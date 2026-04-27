import {
  isNonEmptyString,
  isValidEmail,
  isValidOtp,
} from "../utils/validation.js";

export const validateRegister = (req) => {
  const { name, email, password } = req.body;

  return [
    !isNonEmptyString(name) && "Name is required",
    !isValidEmail(email) && "Valid email is required",
    !isNonEmptyString(password) && "Password is required",
    isNonEmptyString(password) && password.trim().length < 8 && "Password must be at least 8 characters long",
  ];
};

export const validateLogin = (req) => {
  const { email, password } = req.body;

  return [
    !isValidEmail(email) && "Valid email is required",
    !isNonEmptyString(password) && "Password is required",
  ];
};

export const validateEmailOtp = (req) => {
  const { email, otp } = req.body;

  return [
    !isValidEmail(email) && "Valid email is required",
    !isValidOtp(String(otp || "")) && "OTP must be a 6-digit code",
  ];
};

export const validateForgotPassword = (req) => {
  const { email } = req.body;

  return [!isValidEmail(email) && "Valid email is required"];
};

export const validateResetPassword = (req) => {
  const { email, otp, newPassword } = req.body;

  return [
    !isValidEmail(email) && "Valid email is required",
    !isValidOtp(String(otp || "")) && "OTP must be a 6-digit code",
    !isNonEmptyString(newPassword) && "New password is required",
    isNonEmptyString(newPassword) &&
      newPassword.trim().length < 8 &&
      "Password must be at least 8 characters long",
  ];
};
