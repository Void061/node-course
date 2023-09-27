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
