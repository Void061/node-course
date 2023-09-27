# METODO DI STORE SESSIONI LATO SERVER

# INSTALLA IL PACCHETTO PER EXPRESS

npm install --save express-session

# INIZIALIZZARE LA SESSIONE IN APP.JS

```
const session = require("express-session");
app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
}));
```

# UTILIZZARE LA SESSIONE NEI CONTROLLERS

req.session.isLoggedIn = true;

# NOTE

E' diverso da utente ad utente, quindi puoi distinguere gli utenti.
E' richiamabile dal req.proprietà in tutte le rotte => req.session.isLoggedIn

# SALVARE NEL DB

La memoria non è illimitata dei server, quindi conviene salvarli nel DB
installiamo il pacchetto per mongoDB:
npm install --save connect-mongodb-session

# Utilizzare mongodb session store in app.js

```
const MongoDBStore = require("connect-mongodb-session")(session); // session istanziata prima

// URL DB
const MONGODB_URI = "mongodb+srv://root:QS9bWtLGOYHgCkBQ@cluster0.slkmjcp.mongodb.net/shop";

// STORE
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

// REFACTORING UTILIZZANDO store
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
```

# DISTRUGGERE UNA SESSIONE | DESTROY

```
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
```
