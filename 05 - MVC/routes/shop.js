const express = require("express");
const router = express.Router();

// CONTROLLERS
const productsController = require('../controllers/products');


router.get("/", productsController.getProducts);

module.exports = router;
