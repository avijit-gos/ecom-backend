/** @format */

import Joi from "joi";

export const validateUserRegisterInput = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z\s]+$/) // Only letters and spaces allowed
    .required()
    .messages({
      "string.base": "Name must be a string",
      "string.empty": "Name cannot be empty",
      "string.min": "Name must have at least 3 characters",
      "string.max": "Name must not exceed 50 characters",
      "string.pattern.base": "Name must only contain alphabets and spaces",
      "any.required": "Name is required",
    }),

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),

  phone: Joi.string()
    .length(10)
    .pattern(/^[0-9]+$/) // Only digits allowed
    .required()
    .messages({
      "string.pattern.base": "Mobile number must contain only digits",
      "string.length": "Mobile number must be exactly 10 digits",
      "any.required": "Mobile number is required",
    }),

  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$"
      )
    ) // At least one uppercase, one lowercase, one number, and one special character
    .required()
    .messages({
      "string.min": "Password must have at least 8 characters",
      "string.pattern.base":
        "Password must contain an uppercase letter, a lowercase letter, a number, and a special character",
      "any.required": "Password is required",
    }),
});
