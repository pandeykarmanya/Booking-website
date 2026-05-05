# User Manual - Venue Booking Website

This manual explains how to use the Venue Booking Website for both normal users and administrators.

## 1. Purpose of the Application

The Venue Booking Website helps users:

- create an account
- log in securely
- check venue availability
- book a venue for a selected date and time
- manage their own bookings

It also helps administrators:

- manage users
- manage venues
- change venue availability or maintenance status
- view bookings
- monitor upcoming bookings

## 2. Main User Roles

There are two main roles in the system:

- User
- Admin

### User

A normal user can:

- register
- verify account by OTP
- log in
- search for available venues
- create bookings
- view upcoming, ongoing, and past bookings
- cancel eligible bookings

### Admin

An admin can:

- log in to the admin dashboard
- view bookings
- view users
- manage venues
- mark venues as available or under maintenance
- see upcoming bookings
- access booking reports

## 3. Accessing the Website

Open the web application in your browser using the provided URL from the institution or administrator.

Example:

```text
http://your-server-address
```

## 4. Login Page

When the application opens, the Login page appears first.

### On this page, the user can:

- enter email and password
- click `Sign in`
- go to the registration page
- use `Forgot password` if login credentials are forgotten

## 5. Registering a New Account

To create an account:

1. Open the `Register` page
2. Enter:
   - full name
   - email
   - password
   - confirm password
3. Click `Create account`

### OTP Verification

After registration:

1. An OTP is sent to the registered email
2. Enter the OTP in the popup/modal
3. Click `Verify OTP`

If the OTP is correct, the account is verified and the user can log in.

## 6. Forgot Password

If a user forgets the password:

1. Click `Forgot password` on the login page
2. Enter the registered email
3. Click `Send OTP`
4. Open the reset-password page
5. Enter:
   - OTP
   - new password
   - confirm new password
6. Click `Reset Password`

### Important Notes

- both password fields must match
- the page has an eye icon to show or hide passwords
- OTP is valid for a limited time only

## 7. User Dashboard

After a normal user logs in, the User Dashboard opens.

### The dashboard shows:

- profile initials and email
- total bookings
- upcoming bookings
- ongoing bookings
- past bookings

### Booking Tabs

The user can switch between:

- Upcoming
- Ongoing
- Past Events

### Cancel Booking

For eligible upcoming bookings:

1. Click `Cancel`
2. Confirm cancellation in the popup

### Note

A user cannot cancel:

- completed bookings
- past bookings
- ongoing bookings
- already cancelled bookings

## 8. Booking a Venue

To create a booking:

1. Open the `Booking` page
2. Select:
   - event date
   - start time
   - end time
3. Click `Check Availability`

The system will show a list of venues.

### Available Venues Page

On this page:

- available venues can be booked
- booked venues are marked unavailable
- maintenance venues are marked separately

### To book a venue:

1. Click `Book Venue`
2. Wait for confirmation
3. On success, the user is redirected to the dashboard

## 9. Understanding Venue Status

A venue may appear in different states:

- Available
- Already Booked
- Under Maintenance

### Meaning of Each Status

- `Available`: venue can be booked
- `Already Booked`: another booking already exists in the selected slot
- `Under Maintenance`: venue is temporarily blocked by admin and cannot be booked

## 10. Admin Login

If the logged-in account has admin role, it is redirected to the Admin Dashboard.

## 11. Admin Dashboard

The Admin Dashboard contains major sections such as:

- Bookings
- Users
- Venues
- Pre-Bookings

## 12. Admin - Bookings Section

This section allows the admin to:

- view all bookings
- monitor booking status
- cancel bookings if necessary

Booking cards may show:

- upcoming
- in progress
- done
- cancelled

## 13. Admin - Users Section

This section allows the admin to:

- view registered users
- promote eligible users to admin when allowed by the system setup

## 14. Admin - Venue Management

In the Venue Management page, admin can:

- add a new venue
- delete a venue
- update venue status

### To add a venue:

1. Enter venue name
2. Enter location
3. Enter capacity
4. Click `Add Venue`

### To change venue status:

Use the status toggle button to switch between:

- Available
- Maintenance

### To delete a venue:

1. Click `Delete`
2. Confirm the action

## 15. Admin - Upcoming Bookings / Pre-Bookings

This section shows:

- ongoing bookings
- upcoming bookings
- all booking previews for administrative planning

This helps the admin monitor venue usage in advance.

## 16. Booking Reports

Admins can also view booking reports and download reports in PDF format where enabled.

This is useful for:

- record keeping
- activity tracking
- administrative review

## 17. Common User Actions

### Create Account

- Register
- Verify OTP
- Login

### Make Booking

- Choose date/time
- Check availability
- Book venue

### Reset Password

- Forgot password
- Receive OTP
- Set new password

### Cancel Booking

- Open dashboard
- Find booking
- Cancel if allowed

## 18. Common Errors and Their Meaning

### `Invalid email or password`

- wrong login credentials entered

### `Please verify your email first`

- account exists but OTP verification is not complete

### `Passwords do not match`

- new password and confirm password are different

### `Error sending OTP`

- backend or email service issue
- user should try again later or contact admin

### `Venue already booked`

- selected time slot is no longer available

### `This venue is currently under maintenance`

- admin has blocked that venue temporarily

## 19. Best Practices for Users

- always use a valid email address
- complete OTP verification immediately
- choose future booking times only
- double-check date and time before booking
- use the password visibility icon when resetting password

## 20. Best Practices for Admins

- keep venue status updated
- mark unavailable venues under maintenance clearly
- review bookings regularly
- verify reports before download or sharing
- protect admin credentials carefully

## 21. Troubleshooting

If the system does not work properly:

- refresh the page
- try logging in again
- verify internet/server connectivity
- contact the system administrator

If login, register, or forgot-password stop working together, it usually means the backend server is not reachable.

## 22. Summary

The Venue Booking Website is designed to make venue reservation simple for users and manageable for administrators.

Users can:

- register
- log in
- check venue availability
- create and manage bookings

Admins can:

- manage users
- manage venues
- monitor bookings
- access reports

This manual can be shared with students, staff, or administrators to help them understand the platform quickly.
