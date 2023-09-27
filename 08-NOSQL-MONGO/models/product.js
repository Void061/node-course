const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new mongodb.ObjectId(id) : null;
    this.userId = userId;
  }

  save() {
    // Carichiamo il db
    const db = getDb();
    let dbOp;
    if (this._id) {
      // farà un update di tutti gli attributi, se devi andare nello specifico usa:
      //dbOp = db.collection("products").updateOne({_id: new mongodb.ObjectId(this._id)}, {$set: {title : this.title}});
      console.log(this._id);
      dbOp = db
        .collection("products")
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOp = db.collection("products").insertOne(this);
    }
    return dbOp
      .then((result) => {
       
        console.log(result);
      })
      .catch((err) => console.log(err));
  }

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

  static findById(prodId) {
    const db = getDb();
    // .next() serve a prendere l'ultimo cursore restituioto
    return (
      db
        .collection("products")
        // _id da mogno è un binaryObjectId
        // Quindi per far avvenire al meglio il confronto bisogna convertirlo
        .find({ _id: new mongodb.ObjectId(prodId) })
        .next()
        .then((product) => {
          return product;
        })
        .catch((err) => console.log(err))
    );
  }

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
}

module.exports = Product;
