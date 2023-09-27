# Usiamo express-validator
npm install --save express-validator

# INIZIALIZZAZIONE NELLE ROUTES
```
// routes folder
const { check } = require("express-validator");

router.post(
  "/signup",
  check("email").isEmail().withMessage("Please enter a valid email"),
  authController.postSignup
);
```

# CUSTOM ERROR HANDLER
```
router.post(
  "/signup",
  check("email").isEmail().withMessage("Please enter a valid email")
  .custom((value, {req}) => {
    // DUMMY LOGIC
    if(value === 'test@test.com'){
      throw new Error('This email address is forbidden');
    }
  }),
  authController.postSignup
);
```

# CATCH NEL CONTROLLER ROTTA
```
// controllers folder
 const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // RENDER TEMPLATE FAKE
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg
    });
  }
```

# ALTRI VALIDATORI
```
// Esempio di body, richiede che la password sia in req.body
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        if (value === "test@test.com") {
          throw new Error("This email address is forbidden");
        }
        return true;
      }),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
  ],
  authController.postSignup
);


// CHECK TWO PASSWORD EQ WITH CUSTOM VALIDATOR
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        if (value === "test@test.com") {
          throw new Error("This email address is forbidden");
        }
        return true;
      }),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match!");
      }
      return true;
    }),
  ],
```


# ASYNC VALIDATION | VALIDAZIONE ASINCRONA

```
// Verifica ad esempio se un email esiste già nel db per una registrazione

```