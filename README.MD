# QUI INFO GENERALI, INFORMAZIONI PIU' STRETTE SU 12-RESTAPI

# INIT DEL PROGETTO

- Abbiamo inizializzato un package.json per lavorare con npm, tramite npm init

- La scripts section in package.json è utile per creare scripts, ad esempio: "start": "node app.js" => Permette di avviare il progetto con npm start.

- Puoi utilizzare anche nominativi inventati, come "start-server" : "node app.js", ma andrebbe avviato con npm run start-server in quanto è un comando personalizzato.

# Third party packages utili

- Nodemon => npm install nodemon

# Tipi di pacchetti

- [Development] (npm install X --save-dev), includeremo il pacchetto solo in sviluppo, ad esempio nodemon non ha bisogno di esserci in produzione

- [Globali] (npm install X -g) => Lo inserirà globalmente su tutta la macchina

- [Production] (npm install --save X) => Dipendenze produzione

# EXPRESS.JS

[ISTANZIARE]

- const express = require('express');
- const app = express();

[MIDDLEWARE]

```
app.use((req, res, next) => {
  console.log('In the middleware!');
  next(); // Permette di andare alla linea del prossimo middleware
});
// senza next() non avremmo mai eseguito another middleware
app.use((req, res, next) => {
  console.log('in another middleware!');
  res.send('<h1>Hello from express</h1>'); // Mandare una risposta
});
```

[ROTTE_SPECIFICA]

```
app.use("/add-product", (req, res, next) => {
  console.log("In another middleware!");
  res.send("<h1>The 'Add product page'</h1>"); // Mandare una risposta
});
```

Attenzione: La rotta / matcha con tutte, quindi andrebbe messa alla fine, express verifica se / è in una path, ed anche su /users è effettivamente presente, un esempio dell'ordinamento:

```
// /users va prima
app.use('/users',(req, res, next) => {
  const DUMMY_USERS = [{id: 0, name: 'Ivan'}, {id: 1, name: 'John'}, {id: 2, name: 'Erik'}]
  res.send(DUMMY_USERS)
})

// / Va dopo
app.use('/',(req, res, next) => {
  res.send('<h1>Hello from the main path</h1>');
})
```

[ESTRAZIONE_CHIAMATE_POST]

- C'è la possibilità di estrarre i parametri POST da una richiesta in maniera semplice con i parser, utilizziamo per test body-parser

- npm install --save body-parser

```
//Istanziamo body-parser
const bodyParser = require('body-parser');

// Utilizziamo body-parser come middleware
app.use(bodyParser.urlencoded({extended: false})); //extended false, rimuove le impostazioni default inutili (le funzionalità estese) togliendo anche errori di deprecazione.

app.use('/',(req, res, next) => {
  console.log(req.body); // DATI DELLA RICHIESTA POST
})
```

[DICHIARAZIONE_METODI]

- app.post('/route', (req, res, next) => {})
- app.get('/route', (req, res, next) => {})
- app.delete('/route', (req, res, next) => {})
- app.patch('/route', (req, res, next) => {})

[ESPORTAZIONE_ROTTE_FILE_DIFFERENTI]

- Dichiariamo express in routes/admin.js ad esempio, ed esportiamo express.Routes() che è l'equivalente di Express();

```
ADMIN.JS
const express = require('express');
const router = express.Router();

router.use("/add-product", (req, res, next) => {
  res.send(
    '<form action="/product" method="POST"><input type="text" name="title" /><button type="submit">Add Product</button></form>'
  );
});

router.post("/product", (req, res, next) => {
  console.log(req.body);
  res.redirect("/");
});

module.exports = Router;

APP.jS
const adminRoutes = require('./routes/admin');
app.use(adminRoutes);

// Oppure
app.use('/admin', adminRoutes); // Definisce una rotta con un path /admin/rotte

```

- Come detto precedentemente router.use() triggera il path '/' in tutte le route, ma se si utilizza, router.get() col metodo preciso, allora questa problematica viene risolta, così l'ordine può anche essere con la / route per prima nel codice.

[404_PAGE]
Sfruttiamo il fatto che app.use('/') intercetta tutte le path e mettiamo alla fine del codice:

```
app.use('/', (req, res, next) => {
  res.status(404).send('<h1>PAGE NOT FOUND</h1>');
})
```

[SERVIRE_FILE_HTML]

- Crea /views/file.html
- Importiamo path di Node.js che servirà per la gestione dei percorsi per importare file
- Spedisci il file dalla response

```
const path = require('path');
router.get("/", (req, res, next) => {
  // __dirname è una variabile globale pre-costituita dall'attuale path,
  // Ci troviamo dentro /routes/shop.js quindi __dirname sarà /routes
  // Forniamo i parametri per tornare dietro di path e prendere shop.html
  res.sendFile(path.join(__dirname,'../', 'views', 'shop.html'));
});

// Alternativa senza __dirname
// Creare /utils/path.js
// PATH.JS
// Cosi abbiamo sempre la mainRoot /
const path = require('path');
module.exports = path.dirname(require.main.filename);

// RI-SCRIVERE IL PATH.JOIN()
const rootDir = require('../utils/path');
router.get("/", (req, res, next) => {
  // Forniamo i parametri per tornare dietro di path e prendere shop.html
  res.sendFile(rootDir, 'views', 'shop.html'));
});
```

[FILE_STATICI_COME_CSS_PER_VIEWS]

```
// Importazione di files tipo css per le views da public
app.use(express.static(path.join(rootDir, 'public')));
// Poi nella view ti colleghi con <link rel="stylesheet" href="/css/main.css" />
```

[NOTE]

- Express con app.listen(3000); fa tutto quello che si faceva manualmente col package http.

# TEMPLATE & RENDER

Esistono diversi motori di template, ejs, pug, express-handlebars
installiamoli tutti per provarli, banalmente se ne seleziona uno

npm install --save ejs pug express-handlebars

```
// Setup del template engine e della directory con le views
app.set('view engine', 'pug');
app.set('views', 'views');

// RENDER DI UN FILE PUG
router.get("/", (req, res, next) => {
  res.render('shop', {dati: seEsistono});
});
```

# MVC

- Cartelle: public - routes - views - utils - controllers

[routes]
Ci vanno le rotte, es:

```
router.get("/add-product", (req, res, next) => {
 res.send('ADD PROD');
});
```

[views]
Ci va il template tipo pug, ejs, handlebars

[utils]
Ci va dentro le utility, come questa

```
// Cosi abbiamo sempre la mainRoot /
const path = require("path");
module.exports = path.dirname(require.main.filename);
```

[controllers]
Ci va dentro la logica

```
// controllers/products.js
exports.getAddProduct = (req, res, next) => {
  res.send("ADD PROD");
};

exports.postAddProduct = (req, res, next) => {
  res.send(products);
};


// Poi si importa nella routes ad esempio così
// routes/admin.js
// CONTROLLERS
// /admin/add-product => GET
router.get("/add-product", productsController.getAddProduct);
// /admin/add-product => POST
router.post("/add-product", productsController.postAddProduct);
```

[models]
Insieme di dati logici
```
models/product.js

// IN QUESTO CASO SIAMO CONCENTRATI SULLA CLASSE PRODUCT

const fs = require("fs");
const path = require("path");
const rootDir = require("../utils/path");

// PATH DEI DUMMY PRODUCTS
const p = path.join(rootDir, "data", "products.json");

const getProductsFromFile = (cb) => {
  // cb parametro è una callback
  // quando verrà richiamata sarà: getProductsFromFile((item) => {})
  // Leggo il contenuto se c'è, altrimenti torno un array vuoto
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      return cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }

  });
};

module.exports = class Product {
  constructor(t) {
    this.title = t;
  }

  // METHODS
  save() {
    // Leggo il contenuto
    getProductsFromFile((products) => {

      // Pusho il contenuto dentro l'array
      products.push(this);

      // Scrivo su file
      fs.writeFile(p, JSON.stringify(products), (err) => {
        console.log(err);
      });
    });
  }
  // STATIC si usa per richiamare senza istanza, es: Product.fetchAll();
  static fetchAll(cb) {
    getProductsFromFile(cb);
  }
};

// RICHIAMARE UNA CLASSE(MODEL) SUI CONTROLLERS
// controllers/products.js
const Product = require("../models/products");

exports.postAddProduct = (req, res, next) => {
  const product = new Product(req.body.title);
  product.save();
  res.send('PRODUCT ADDED SUCCESSFULLY');
};

exports.getProducts = (req, res, next) => {
  // Richiamo il metodo statico
  // Passiamo una callback (cb)
  const products = Product.fetchAll((_products) => {
    res.send(_products);
  });
}
```

# ROTTE DINAMICHE | DYNAMIC ROUTES

routes/rotta.js

```
// Questo triggera tutti i path dopo products/
// Quindi se si hanno altre route tipo /products/delete
// Andrebbero inserite prima di questo blocco

router.get('/products/:productId', shopController.getProduct);

// DENTRO IL MODELLO shopController
exports.getProduct = (req, res, next) => {
const prodId = req.params.productId
}
```

# Query parameters, parametri query
```
// Dentro il controller della rotta
const data = req.query.parametro;
```


