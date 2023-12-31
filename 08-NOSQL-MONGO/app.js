const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");

const mongoConnect = require("./util/database").mongoConnect;

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const User = require("./models/user");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));


app.use((req, res, next) => {
  User.findById("650c0a92f16d9e912f05d94b")
    .then((user) => {
      req.user = new User(user.name, user.email, user.cart, user._id);

      next();
    })
    .catch((err) => {
      console.log(err);
    });


});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(() => {
  //const user = new User("Ivan", "ivan@live.it");
  //user.save();
  app.listen(3000);
});
