# Installare multer

npm install --save multer

# Inizializzazione in app.js

```
// Import
const multer = require('multer');

// Configurazione e location
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

// Memorizzerà i files con data + nome originale nella dir images
app.use(multer({ storage: fileStorage }).single('image'));
```

# FILTRARE SOLO FILE SPECIFICI / FORMATI
```
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    // errore null
    // TRUE LO SALVIAMO
    cb(null, true);
  }
  // errore null
  // FALSE NON LO SALVIAMO
  cb(null, false);
};

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
```


# RECUPERO NEI CONTROLLERS ROTTA
```
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file; // RECUPERO FILE DI MULTER
  const price = req.body.price;
  const description = req.body.description;
  
  // SE L'IMMAGINE NON ESISTE O NON E' DEL FORMATO ( GIA PREVISTO DA MULTER NEI FILTRI)
  if(!image){
     return res.status(422).render("admin/edit-product", {
       pageTitle: "Add Product",
       path: "/admin/add-product",
       editing: false,
       hasError: true,
       product: {
         title: title,
         imageUrl: imageUrl,
         price: price,
         description: description,
       },
       errorMessage: 'Attached file is not an image',
       validationErrors: [],
     });
  }

  // COSTRUZIONE PATH PER SALVARLA NEL DB
  const imageUrl = image.path;
}
```

# SERVIRE IMMAGINI STATICAMENTE
```
// Aggiungere in app.js
// Renderà raggiungibile la path /images/img.jpg
app.use(express.static(path.join(__dirname, 'images')));
```