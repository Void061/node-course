// General imports
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

// Configurazione di multer
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    // Questo pecca su macchine windows => cb(null, new Date().toISOString() + '-' + file.originalname);
    const mime =
      file.mimetype === "image/png"
        ? ".png"
        : file.mimetype === "image/jpg"
        ? ".jpg"
        : file.mimetype === "image/jpeg"
        ? ".jpeg"
        : ".notMyBusiness";

    cb(null, uuidv4() + mime);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype == "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    // True sta per salva il file
    cb(null, true);
  } else {
    // False, sta per non salvare il file
    cb(null, false);
  }
};

// ROUTES
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

// Database import
const mongoose = require("mongoose");

// Init app
const app = express();

// Using middlewares
app.use(bodyParser.json()); // application/json
//.single(image) specifica a multer che ci aspettiamo un'immagine nel campo req.body.image
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use((req, res, next) => {
  // CORS ERROR PREVENTION
  res.setHeader("Access-Control-Allow-Origin", "*"); // La wildcard(*) indica che chiunque può fare call al server, potrebbe essere sostituita con un insieme di domini.
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  ); // Definiamo i metodi http utilizzabili.
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Possibilità di aggiungere un authorization all'header.
  next();
});
//Serving static images
app.use("/images", express.static(path.join(__dirname, "images")));

// Using routes
app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

// General error handling middlewares error
// Verrà triggtutti i throw error nei controllers
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// Connection DB & LISTENING
// messages è il db
mongoose
  .connect(
    "mongodb+srv://root:QS9bWtLGOYHgCkBQ@cluster0.slkmjcp.mongodb.net/messages"
  )
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
