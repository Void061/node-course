const express = require('express');
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

const adminRoutes = require("./routes/admin");;
const shopRoutes = require("./routes/shop");;

const errorController = require("./controllers/error");

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404)

app.listen(3000);