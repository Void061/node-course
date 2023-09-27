const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");
const router = express.Router();

const authController = require("../controllers/auth");

// PUT /auth/signup
router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        // Check se l'email esiste già su un utente
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  authController.signup
);

// POST /auth/login
router.post("/login", authController.login);

module.exports = router;
