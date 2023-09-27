# INSTALLAZIONE

npm install --save sequelize
Sequelize richiede mysql2, quindi bisogna installarlo per usare sequelize.
npm install --save mysql2

# CONNESSIONE AL DB

Solitamente in util/database.js

```
const Sequelize = require('sequelize');

const sequelize = new Sequelize('nodejs_course', 'root', 'toor', {
  dialect: 'mysql',
  host: 'localhost',
});

module.exports = sequelize;
```

# DEFINIZIONE DI UN MODELLO

Esempio di models/product.js

```
const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Product = sequelize.define("product", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: Sequelize.STRING,
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Product;
```

# TRASFORMAZIONE DEI MODELLI IN TABELLE

in app.js

```
const sequelize = require('./util/database');
// Creerà le tabelle e le relazioni tra di loro
// NB: Non sovrascrive le tabelle esistenti
// Se inserisci sequelize.sync({force: true}) ricreerà le tabelle buttando le precedenti
// force:true non è da non utilizzare in produzione
sequelize.sync().then(result => {
  console.log(result);
  app.listen(3000);
}).catch(err => {
  console.log(err);
});
```

# INSERIMENTO DEI DATI DENTRO UNA TABELLA

```
// Dentro controller/file.js
// Importa il modello
const Product = require("../models/product");

// Dentro il controller della rotta
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(null, title, imageUrl, description, price);

  Product.create({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description
  }).then(result => {
    console.log(result);
  }).catch(err =>{
    console.log(err)
  });

};
```

# FIND ALL RESTITUIRE TUTTI I DATI DI UNA COLONNA

```
Product.findAll().then(products => {
    console.log(products); // Array di prodotti
  }).catch(err => console.log(err));

  // Possiamo condizionare il findAll con i WHERE
  // Restituirà un array di ordini, dove cercherà quelli dell'utente 1
  Orders.findAll({ where : { user: 1}}).then(products => {
    console.log(products); // Array di ordini
  }).catch(err => console.log(err));
```

# FIND BY PRIMARY KEY, TROVARE UN DATO SPECIFICO

```
Product.findByPk(prodId).then(product => {
    console.log(product) // Non sarà un array
  }).catch(err => console.log(err));
```

# UPDATE DI UN RECORD

```
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  const updateProduct = new Product(
    prodId,
    updatedTitle,
    updatedImageUrl,
    updatedDesc,
    updatedPrice
  );
  Product.findByPk(prodId)
    .then((product) => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;
      // Prima di salvare non apporterà modifiche al DB, ma solo all'app localmente
      return product.save();
    })
    .then(result => {
      console.log('UPDATED PRODUCT');
    })
    // Nota come il catch sia unico, catcherà le exceptions sia del primo .then()
    // Che del secondo, per product.save();
    .catch((err) => console.log(err));
  res.redirect("/admin/products");
};
```

# DELETE RECORD

```
Product.destroy({ where: { id: prodId } }).then((result) => {
     console.log(result)
  }).catch((err) => console.log(err))
```

# Associazioni / Relazioni

```
// Su app.js prima del sync
// Si importano due modelli
const Product = require("./models/product");
const User = require("./models/user");

// Diciamo che un prodotto appartiene ad un utente e che se viene eliminato un utente
// Che ha quel prodotto, deve avvenire in cascata anche per esso
// Relazione 1 a 1
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

// Cosi diciamo che un User ha più prodotti
// Relazione 1 a n
User.hasMany(Product);
```

# ASSOCIAZIONE | INSERT | INSERIMENTO

```
// Queste relazioni sbloccano dei nuovi metodi, ad esempio, supponiamo di dover creare
// Un prodotto per un utente
// in app.js mettiamo intanto l'utente sulla req.user (MIDDLEWARE)
app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});


// Dirigiamoci sul controller della rotta che crea il prodotto, avremo su req.user
// che è un oggetto sequelize, tutti i metodi disponibili e viene sbloccato .createProduct()
// Grazie all'associazione, questo metodo creerà un prodotto con lo userId associato.
req.user
    .createProduct({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description,
    })
```

# ASSOCIAZIONE | FIND BY ASSOCIAZIONE | TROVA PER ASSOCIAZIONE

```
req.user
    .getProducts({
      where: { id: prodId },
    })
    .then((products) => {
      // products è un array
      const product = products[0];
      console.log(product)

    })
    .catch((err) => console.log(err));
```

# FIND ALL PER ASSOCIAZIONE

```
req.user
    .getProducts().then(() => {}).catch(() => {})

```

# Tipi di relazione

```
// Product appartiene a User
// Genererà un userId nella tabella Product
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
// Si unisce questo per far capire le intenzioni
User.hasMany(Product)

// Aggiunge alla tabella carts uno userId
User.hasOne(Cart);
Cart.belongsTo(User);

// Cart e Product sono collegati ed è una n a n tramite una tabella che fa da intermediario che si chiama cartItems, la tabella avrà productId e cartId
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
```
