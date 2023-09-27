const express = require('express');
const router = express.Router();
const path = require('path');
const rootDir = require('../utils/path');

router.get("/", (req, res, next) => {
  // __dirname è una variabile globale pre-costituita dall'attuale path,
  // Ci troviamo dentro /routes/shop.js quindi __dirname sarà /routes
  // Forniamo i parametri per tornare dietro di path e prendere shop.html
  res.sendFile(path.join(rootDir, 'views', 'shop.html'));
});

module.exports = router;
