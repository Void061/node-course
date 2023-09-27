# Criptare sempre le password col modulo
npm install --save bcryptjs

bcrypt.hash(password, 12) => RITORNA UNA PROMISE
quindi await o then


# COMPARAZIONE
bcrypt.compare(passwordRichiesta, user.password)


# PROTEZIONE DELLE ROTTE | MIDDLEWARE AUTH
Creare una cartella middleware e inserirci dentro is-auth.js
```
// dentro is-auth.js
// è un esempio, di come controllare con i middleware
module.exports = (req, res, next) => {
  if(!req.session.isLoggedIn){
    return res.redirect('/login');
  }
  next();
}


// si importa nelle routes.
const isAuth = require('../middleware/is-auth');

// si aggiunge in una route
router.get("/cart", isAuth, shopController.getCart);
```

# PROTEZIONE DA CSRF ATTACK
npm install --save csurf
Utilizzo:
```
// in app.js
const csrf = require("csurf");
const csrfProtection = csrf();

// QUESTO VA MESSO DOPO LA SESSIONE, csrf sfrutta le sessioni.
app.use(csrfProtection);

```