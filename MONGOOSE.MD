# DOC
https://mongoosejs.com/docs/

# Per utilizzare mongoose bisogna installarlo

```
npm install --save mongose
```

# CONNESSIONE AL DB

```
// Si importa su app.js
const mongoose = require("mongoose");

// Inizia la connessione all'url del DB NOSQL & APP LISTEN
// In basso a tutto su app.js
mongoose
  .connect(
    "mongodb+srv://root:QS9bWtLGOYHgCkBQ@cluster0.slkmjcp.mongodb.net/shop?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(3000);
  });

```

# Creazione di un modello / models

```
// models/product.js
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

// Il primo parametro sarà il nome della tabella
module.exports = mongoose.model("Product", productSchema);


```

# Salvare un elemento nel DB | INSERT | INSERIMENTO

```
// controllers/admin.js
const Product = require("../models/product");

// Il .save() è un metodo di mongoose, quindi automaticamente andrà
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
  });
  product
    .save()
    .then((result) => {
      console.log("Created Product");
    })
    .catch((err) => console.log(err));
};
```

# SELECT ALL | FIND | SELEZIONE | FETCH ALL | SELEZIONA TUTTO

```
// Il metodo find fornisce una select al database
// controllers/shop.js
Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "All products",
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};
```

# SELECT BY ID | SELEZIONE CON PARAMETRO | SELECT SINGOLA | SINGLE SELECT

```
// find by id permette di trovare un elemento tramite Id
// controllers/shop.js
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: `Product - ${product.title}`,
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};
```

# SELECT BY PARAMETRO  | SELECT WHERE 
```
// Si specifica nel find, la chiave da trovare
// In questo caso stiamo cercando Order: { user: { userId: 1111 }}
exports.getOrders = (req, res, next) => {
  Order.find({
    "user.userId": req.user._id,
  }).then((orders) => {
    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: orders,
    });
  });
};
```


# UPDATE QUERY

```
// controllers/admin.js
// Sostanzialmente cerchiamo per id il prodotto, poi aggiorniamo i campi e invochiamo
// product.save() come nella creazione, questo farà l'update dei suoi parametri / attributi / valori
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  const updatedImageUrl = req.body.imageUrl;

  Product.findById(prodId)
    .then((product) => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;
      return product.save();
    })
    .then((result) => {
      console.log("UPDATED PRODUCT");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
```

# DELETE RECORD

```
// controllers/admin.js
// Invochiamo .findByIdAndRemove, che ricerca per id l'elemento e lo rimuove.
exports.deleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByIdAndRemove(prodId)
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
```

# Modello complesso con documenti embed

```
// models/user.js
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  // Cart avrà dentro un array di elementi, che conterrà Oggetti (documents in NOSQL)
  // i documents sono composti da: productId, che è un type ObjectId (id NOSQL)
  // quantity, che è un Numero.

  cart: {
    items: [
      {
        productId: { type: Schema.Types.ObjectId, required: true },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

module.exports = mongoose.model('User', userSchema);


```

# USO DELLE RELAZIONI IN MONGOOSE

```
// Supponendo che ogni prodotto dovrebbe avere un utente.
// models/product.js
const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
});

module.exports = mongoose.model("Product", productSchema);

// Abbiamo aggiunto userId, che sarà un ObjectId e farà riferimento al nostro .model('User'); nel models/User.js

// allo stesso tempo in models/User.js
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  // Cart avrà dentro un array di elementi, che conterrà Oggetti (documents in NOSQL)
  // i documents sono composti da: productId, che è un type ObjectId (id NOSQL)
  // quantity, che è un Numero.

  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

module.exports = mongoose.model("User", userSchema);

// Abbiamo aggiunto la ref per product
// perchè ogni item dentro la cart ha un productId, che fa riferimento a .model('Product');

// Dunque un prodotto adesso dovrà essere salvato con lo userId, quindi rifattoriamo
// controllers/admin.js => addProduct
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user, // L'utente ce l'abbiamo nella req (fatto in app.js) 
  });
  product
    .save()
    .then((result) => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
```

# RICERCA | FETCHING | nelle RELAZIONI | RELATIONS

```
// Supponendo di voler sfruttare quello userId per reperire informazioni
// controllers/admin.js

// Il populate richiede il nome dell'attributo in cui è contenuto l'id, restituirà automaticamente tutti i dati dell'utente fetchato.
// Se il parametro è annidato, tipo userId: { campo: 111 } è possibile fare .populate('userId.campo')
exports.getProducts = (req, res, next) => {
  Product.find().populate('userId')
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => console.log(err));
};

// E' possibile fare una ricerca relazionale avanzata con il .select()

exports.getProducts = (req, res, next) => {
  // Stiamo selezioando dai prodotti solo title e price, e stiamo escludendo l'id forzatamente
  // Nel populate, dallo user estrapoliamo solo il name.
  Product.find().select('title price -_id').populate('userId', 'name')
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => console.log(err));
};

```

# Aggiunta metodi in un modello | Methods on models
```
// Supponendo di voler aggiungere un metodo per aggiungere items nella Cart dell'utente.
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  // Cart avrà dentro un array di elementi, che conterrà Oggetti (documents in NOSQL)
  // i documents sono composti da: productId, che è un type ObjectId (id NOSQL)
  // quantity, che è un Numero.

  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }

  const updatedCart = {
    items: updatedCartItems,
  };
  // Richiamiamo cart del modello, mettiamoci dentro i nuovi valori
  this.cart = updatedCart;
  // Salviamo
  return this.save();
};

module.exports = mongoose.model("User", userSchema);


// Per utilizzarlo nel controller della rotta
// controllers/shop.js
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  // Ricerchiamo per id il prodotto
  Product.findById(prodId)
    .then((product) => {
      // Passiamo il prodotto al metodo .addToCart definito nel modello User
      // in req.user è contenuto il modello
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};
```

# ._doc operator
```
// controllers/shop.js
//._doc fetcherà automaticamente i dati di quell'id restituendone tutte le proprietà, quindi product: avrà dentro title, description etc...
exports.postOrder = (req, res, next) => {
  req.user.populate("cart.items.productId").then((user) => {
    const products = user.cart.items.map((i) => {
      return { quantity: i.quantity, product: {...i.productId._doc } };
    });
    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user,
      },
      products: products,
    });
    return order
      .save()
      .then((orders) => {
        res.render("shop/orders", {
          path: "/orders",
          pageTitle: "Your Orders",
          orders: orders,
        });
      })
      .catch((err) => console.log(err));
  });
};
```