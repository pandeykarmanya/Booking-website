import mongoose from "mongoose";

export const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const isValidEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isValidTime = (value) =>
  typeof value === "string" && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value.trim());

export const isValidOtp = (value) =>
  typeof value === "string" && /^\d{6}$/.test(value.trim());

export const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
