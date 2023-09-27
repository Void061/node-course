const Product = require("../models/products");


exports.getAddProduct = (req, res, next) => {
  res.send("<html><head></head><body><form action='/admin/add-product' method='POST'><input type='text' name='title' value='new pc samsung' /> <button type='submit'>ADD PRODUCT</button></form></body></html>");
};

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