const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const rootDir = require('./utils/path');

// Setup del template engine e della directory con le views
app.set('view engine', 'pug');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
// Importazione di files tipo css per le views da public
app.use(express.static(path.join(rootDir, 'public')));

const adminData = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use("/admin", adminData.routes);
app.use(shopRoutes);


app.use("/", (req, res, next) => {
  res.status(404).render('404', {pageTitle: 'Not found'});
});

app.listen(3000);
