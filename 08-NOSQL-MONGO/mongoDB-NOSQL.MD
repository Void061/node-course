# Per utilizzare mongoDB bisogna installarlo

npm install --save mongodb

# CONNESSIONE

util/database.js

```
// Importa mongodb
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
let _db;

// Crea connessione con l'endpoint e il nome dell'utente + password ( REPERITI DA MONGODB ATLAS)
const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://root:QS9bWtLGOYHgCkBQ@cluster0.slkmjcp.mongodb.net/shop?retryWrites=true&w=majority"
  )
    .then((client) => {
      console.log("Connected!");
      // è possibile inserire il nome di un db per cambiarlo
      // In questo caso il default sarà shop, come da url indicato
      _db = client.db('');
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if(_db){
    return _db;
  }
  throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;



// IMPORTA SU APP.js
const mongoConnect = require('./util/database').mongoConnect;

// Esegui alla fine di app.js


mongoConnect(() => {
  app.listen(3000);
});

```

# DEFINIZIONE DI UN MODELLO CON I METODI

```
const getDb = require('../util/database').getDb;

class Product {
  constructor(title, price, description, imageUrl, id){
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = new mongodb.ObjectId(id); // Mongodb usufruisce degli id con Object binary, quindi occorre convertirlo.
  }

  save() {
    // Carichiamo il db
    const db = getDb();
    // Ritorniamo una collezione
    return db.collection('products').insertOne(this).then(result => {
      console.log(result)
    }).catch(err => console.log(err));
  }
}


module.exports = Product;

```

# INSERIMENTO | INSERT | DI UN RECORD SU MONGO

Prendiamo come riferimento Product classe

Inserimento nel modello:
models/product.js

```
save() {
    // Carichiamo il db
    const db = getDb();
    let dbOp;
    if (this._id) {
       // farà un update di tutti gli attributi, se devi andare nello specifico usa:
      //dbOp = db.collection("products").updateOne({_id: this._id}, {$set: {title : this.title}});
      dbOp = db
        .collection("products")
        .updateOne({ _id: this._id }, { $set: this });
      // esiste anche updateMany([])
    }
    else {
      dbOp = db.collection("products").insertOne(this);
      // esiste anche insertMany([])
    }
    return dbOp
      .then((result) => {
        console.log(result);
      })
      .catch((err) => console.log(err));
  }
```

controllers/admin.js

```
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(null, title, imageUrl, description, price);
  product.save()
  .then(result => {
    console.log('Created Product');
    res.redirect("/admin/products");
  })
  .catch(err => console.log(err))

};
```

# SELECT ALL DI UNA TABELLA (collection)

Prendendo come riferimento models/product.js
si aggiunge questo metodo:

```
static fetchAll() {
    // Carichiamo il db
    const db = getDb();
    // find restituisce un cursore, oggetto di mongoDB, con toArray si converte
    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        console.log(products);
        return products;
      })
      .catch((err) => console.log(err));
  }

  // Richiamiamolo nel controllore della rotta
  controllers/shop.js
  exports.getProducts = (req, res, next) => {
  Product.fetchAll()
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

# SELECT SINGLE / GET SINGLE

```
 static findById(prodId) {
    const db = getDb();
    // .next() serve a prendere l'ultimo cursore restituioto
    return db
      .collection("products")
      // _id da mogno è un binaryObjectId
      // Quindi per far avvenire al meglio il confronto bisogna convertirlo
      .find({ _id: new mongodb.ObjectId(prodId) })
      .next()
      .then((product) => {
        return product;
      })
      .catch((err) => console.log(err));
  }
}



```

# Update di un record

```
save() {
    // Carichiamo il db
    const db = getDb();
    let dbOp;
    if (this._id) {
       // farà un update di tutti gli attributi, se devi andare nello specifico usa:
      //dbOp = db.collection("products").updateOne({_id: this._id}, {$set: {title : this.title}});
      dbOp = db
        .collection("products")
        .updateOne({ _id: this._id }, { $set: this });
      // esiste anche updateMany([])
    }
    else {
      dbOp = db.collection("products").insertOne(this);
      // esiste anche insertMany([])
    }
    return dbOp
      .then((result) => {
        console.log(result);
      })
      .catch((err) => console.log(err));
  }

  // nel controller della rotta
  // controllers/admin.js



  exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  const updatedImageUrl = req.body.imageUrl;


  const product = new Product(
    updatedTitle,
    updatedPrice,
    updatedDesc,
    updatedImageUrl,
    // Forniamo l'id come dato codificato
    new ObjectId(prodId)
  );
  product
    .save()
    .then((result) => {
      console.log("UPDATED PRODUCT");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
```

# DELETE RECORD

```
models/product.js aggiungere il metodo
static deleteById(prodId) {
    const db = getDb();
    return db
      .collection("products")
      .deleteOne({ _id: new mongodb.ObjectId(prodId) })
      .then((result) => {
        // console.log(result);
      })
      .catch((err) => console.log(err));

    // esiste anche deleteMany([])
  }

  // su controllers/admin.js sistemare il controller per la delete
  exports.deleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteById(prodId)
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
```

```
  // RELAZIONARE DUE COLLECTIONS
  // ABBIAMO LA COLLECTION USER (CHE HA UNA CART) E UNA COLLECTION PRODUCTS
  // IN models/user.js inseriremo all'user un object cart user : { cart : { items: [ { productId: 0, quantity: }]}}

  // Abbiamo così relazionato due collections inserendo l'id del prodotto
  // Nella cart di un utente
  getCart() {
    const db = getDb();

    // ID DEI PRODOTTI NELLA CART
    const productIds = this.cart.items.map((i) => {
      return i.productId;
    });
    // Ricerchiamo tutti i prodotti che hanno gli id contenuti nell'array di ID
    // $in prende come input un array di qualcosa, come ad esempio id in questo caso
    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find((i) => {
              return i.productId.toString() === p._id.toString();
            }).quantity
          };
        });
      })
      .catch((err) => console.log(err));
    
  }
```

# RICERCA | FIND | SELECT DI UN DATO INGLOBATO DENTRO PARAMETRI
```
// cerchiamo dentro la tabella orders
// gli ordini che contengono lo user id che sarà in user: { _id : xxxxx }
getOrders() {
    const db = getDb();
    return db.collection("orders").find().find({
      'user._id' : new ObjectId(this._id)
    }).toArray();
  }
```