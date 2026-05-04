# Venue Booking Website

A full-stack venue booking platform built for institutional use. The application allows users to register, verify their account with OTP, check venue availability, create bookings, manage reservations, and lets admins manage venues, bookings, and user access from an admin dashboard.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Authentication: JWT with HttpOnly cookies, OTP email verification
- Utilities: Nodemailer, PDFKit, Day.js

## Features

- User registration with OTP email verification
- Login/logout with cookie-based authentication
- Forgot-password and reset-password flow
- Role-based access control for user and admin flows
- Venue availability search by date and time
- Booking creation, cancellation, and booking history tracking
- Admin venue management with maintenance status support
- Admin booking reports and PDF download
- Request validation, route protection, global error handling, and auth rate limiting

## Project Structure

```text
Booking-website/
├── app/        # React frontend
└── Backend/    # Express + MongoDB backend
```

## Environment Variables

Create `Backend/.env` and add values similar to:

```env
PORT=5001
MONGO_URL=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password
```

For the frontend, you can optionally set:

```env
VITE_API_URL=http://localhost:5001/api/v1
```

If `VITE_API_URL` is not provided, the frontend falls back to `/api/v1`, which is useful for reverse-proxy deployment.

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Booking-website
```

### 2. Install frontend dependencies

```bash
cd app
npm install
```

### 3. Install backend dependencies

```bash
cd ../Backend
npm install
```

### 4. Start the backend

```bash
cd Backend
npm run dev
```

Backend runs on:

```text
http://localhost:5001
```

### 5. Start the frontend

```bash
cd app
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Important Backend Routes

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/me`

### Booking

- `GET /api/v1/booking/check-availability`
- `POST /api/v1/booking/create`
- `GET /api/v1/booking/my-bookings`
- `PATCH /api/v1/booking/cancel/:bookingId`
- `GET /api/v1/booking/today`

### Venue

- `GET /api/v1/venues`
- `POST /api/v1/venues`
- `DELETE /api/v1/venues/:id`
- `PATCH /api/v1/venues/:venueId/status`

### Admin

- `GET /api/v1/admin/requests`
- `POST /api/v1/admin/handle-request/:userId`
- `GET /api/v1/admin/bookings`
- `GET /api/v1/admin/bookings/download-pdf`

## Security Improvements Included

- Protected admin-only routes at the route layer
- HttpOnly cookie-based authentication
- Removed token exposure from login JSON responses
- Request validation middleware for auth, booking, and venue routes
- Auth rate limiting for login, register, OTP, and password reset endpoints
- Global error handler for consistent API responses
- Server-side cancellation rule enforcement
- Venue maintenance checks during booking and availability lookup

## Deployment Notes

- The frontend is configured to work with relative API paths like `/api/v1`
- For IIS or reverse-proxy deployment, forward `/api/v1/*` requests to the backend server
- For separate frontend/backend hosting, set `VITE_API_URL` to the deployed backend base URL
- Do not commit real `.env` values, production database URLs, or email credentials

## Known Limitation

- Booking creation still uses a conflict-check-then-insert flow, so under high concurrency it can still be vulnerable to double-booking. This should be solved with a stronger atomic booking strategy for production-scale usage.

## Resume-Friendly Summary

Built a full-stack venue booking platform with secure authentication, admin controls, booking workflows, request validation, and deployment-ready API integration using React, Node.js, Express, and MongoDB.
