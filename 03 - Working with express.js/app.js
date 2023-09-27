const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const rootDir = require('./utils/path');

app.use(bodyParser.urlencoded({ extended: false }));
// Importazione di files tipo css statici
app.use(express.static(path.join(rootDir, 'public')));

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use("/admin", adminRoutes);
app.use(shopRoutes);


app.use("/", (req, res, next) => {
  res.status(404).sendFile(path.join(rootDir, "views", "404.html"));
});

app.listen(3000);
