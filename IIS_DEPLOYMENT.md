# IIS Deployment Guide

This document explains how to deploy the Venue Booking Website using IIS on Windows.

It is written for this project specifically:

- Frontend: React + Vite build from `app/`
- Backend: Node.js + Express from `Backend/`
- Database: MongoDB Atlas
- API base path: `/api/v1`

## Recommended Deployment Architecture

Use this setup:

- IIS serves the React frontend
- Node/Express backend runs on the same Windows machine
- IIS forwards `/api/v1/*` requests to the backend running on port `5001`

This is the cleanest approach because:

- users only open one URL
- the frontend does not need hardcoded localhost ports
- cookies and auth flows are easier to manage

## Example Ports

You can use any ports, but this guide assumes:

- IIS website: `http://localhost:8081`
- Backend API: `http://localhost:5001`

If you later bind IIS to port `80` or `443`, the same deployment flow still applies.

## 1. Prepare the Backend

Go to the backend folder:

```bash
cd Backend
```

Install dependencies:

```bash
npm install
```

Create or update `Backend/.env`:

```env
PORT=5001
MONGO_URL=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d
CORS_ORIGIN=http://localhost:8081
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password
```

Important notes:

- `MONGO_URL` must point to a working MongoDB Atlas cluster
- if your Mongo password contains `@`, encode it as `%40`
- `EMAIL_PASS` should be a valid Gmail app password if you use Gmail

Start the backend:

```bash
npm run dev
```

Or for a production-style run:

```bash
npm start
```

Check that backend works:

```text
http://localhost:5001/api/v1/venues
```

You should get JSON back.

Do not move to IIS setup until this works.

## 2. Prepare the Frontend

Go to the frontend folder:

```bash
cd app
```

Install dependencies:

```bash
npm install
```

This project is already configured so that if `VITE_API_URL` is not set, it falls back to:

```text
/api/v1
```

That is ideal for IIS reverse-proxy deployment.

Build the frontend:

```bash
npm run build
```

This creates the production build in:

```text
app/dist
```

## 3. Install Required IIS Components

Make sure the IIS machine has:

- IIS
- URL Rewrite
- Application Request Routing (ARR)

### Enable Proxy in ARR

In IIS Manager:

1. Click the server name
2. Open `Application Request Routing Cache`
3. Click `Server Proxy Settings...`
4. Check `Enable Proxy`
5. Click `Apply`

If proxy is not enabled, IIS cannot forward API requests to Node.

## 4. Create the IIS Website

In IIS Manager:

1. Right-click `Sites`
2. Click `Add Website`
3. Set the site name
4. Set the physical path to:

```text
<project-path>\app\dist
```

Example:

```text
C:\Projects\Booking-website\app\dist
```

5. Bind it to a port such as:

```text
8081
```

After creating the site, browsing to:

```text
http://localhost:8081
```

should at least load the frontend files.

## 5. Add `web.config` to the Frontend Build

Place this `web.config` inside the IIS site root, which is the same folder IIS serves, usually:

```text
app/dist/web.config
```

Use this content:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ReverseProxyApi" stopProcessing="true">
          <match url="^api/v1/(.*)" />
          <action type="Rewrite" url="http://localhost:5001/api/v1/{R:1}" appendQueryString="true" />
        </rule>

        <rule name="ReactRoutes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/api/" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>

    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".webp" mimeType="image/webp" />
    </staticContent>

    <httpProtocol>
      <customHeaders>
        <add name="X-Content-Type-Options" value="nosniff" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
```

Important:

- the API rule must come before the React fallback rule
- otherwise `/api/v1/*` may get rewritten to the frontend instead of the backend

## 6. Test the Reverse Proxy

Test the backend directly:

```text
http://localhost:5001/api/v1/venues
```

Then test the same endpoint through IIS:

```text
http://localhost:8081/api/v1/venues
```

Expected result:

- both should return JSON

Then open:

```text
http://localhost:8081
```

Expected result:

- the frontend should load
- login/register/forgot-password should call `/api/v1/...` through IIS

## 7. If Users Need to Access from Another Machine

Do not use `localhost` from another computer.

From another machine on the same network, users must open:

```text
http://<IIS-machine-IP>:8081
```

Example:

```text
http://192.168.1.20:8081
```

Also make sure:

- Windows Firewall allows the IIS port
- the site binding uses the correct IP/port

## 8. If Backend Runs on a Different Machine

This is not recommended, but if you do it, do not proxy to `localhost:5001`.

Instead, update the API rewrite target to the backend machine IP:

```xml
<action type="Rewrite" url="http://192.168.1.35:5001/api/v1/{R:1}" appendQueryString="true" />
```

Remember:

- `localhost` on the IIS machine means IIS machine itself
- it does not point to your laptop or another PC

## 9. Common Problems and Fixes

### Problem: `localhost refused to connect`

Cause:

- backend is not running
- or frontend/browser is calling the wrong machine/port

Fix:

- verify backend on `http://localhost:5001/api/v1/venues`

### Problem: Browser shows `ERR_NETWORK`

Cause:

- frontend cannot reach backend
- IIS proxy not working
- backend not responding

Fix:

- confirm backend is reachable directly
- confirm `/api/v1/venues` works through IIS

### Problem: `/api/v1/...` returns frontend HTML instead of JSON

Cause:

- React fallback rule is catching API requests

Fix:

- ensure API rewrite rule is above React fallback
- ensure React fallback excludes `/api/`

### Problem: `502 Bad Gateway`

Cause:

- IIS cannot reach backend
- ARR proxy disabled
- backend not running on target port

Fix:

- enable ARR proxy
- start backend
- verify rewrite URL target

### Problem: Forgot-password OTP not sending

Cause:

- backend mail config invalid
- Gmail app password wrong
- backend not reachable

Fix:

- verify `EMAIL_USER` and `EMAIL_PASS`
- use Gmail app password, not normal Gmail password
- verify backend route works

## 10. Quick Deployment Checklist

- Backend `.env` is correct
- MongoDB Atlas connection works
- Backend runs on `5001`
- Frontend built with `npm run build`
- IIS site points to `app/dist`
- `web.config` exists in the IIS site root
- URL Rewrite installed
- ARR installed and proxy enabled
- `/api/v1/venues` works directly on backend
- `/api/v1/venues` works through IIS
- frontend loads and can call auth routes

## 11. Recommended Production Improvements

- run backend with a process manager like PM2 or NSSM instead of a VS Code terminal
- bind IIS to `80` or `443` instead of only `8081`
- configure HTTPS with a certificate
- use a public domain
- store secrets safely and never commit `.env`

## 12. Summary

For this project, the correct IIS deployment flow is:

1. run backend on the same Windows/IIS machine on port `5001`
2. build frontend from `app/`
3. serve `app/dist` through IIS
4. reverse-proxy `/api/v1/*` from IIS to `http://localhost:5001`
5. test backend directly, then through IIS, then the frontend

If these steps are followed in order, the booking website should work correctly on IIS.
