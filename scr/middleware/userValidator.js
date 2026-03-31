
import { body, validationResult } from "express-validator";

export const userValidationRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Please provide a name"),

  body("email")
    .trim()
    .isEmail().withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage("Password must include uppercase, lowercase, number and special character"),

  body("role")
    .optional()
    .isIn(["admin", "student"]).withMessage("Role must be either admin or student"),
];

// catch any errors from  here
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
    });
  }
  // If no errors, proceed to the controller
  next();
};