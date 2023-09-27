# INSTALLAZIONI NECESSARIE

- nodemon: npm install --save-dev nodemon
  package.json, su scripts aggiungi:
  "start" : "nodemon app.js"
  servirà per avviare nodemon con npm start.

- express: npm install --save express

- body-parser: npm install --save body-parser

# STRUTTURA

Crea i seguenti folders:
routes/
controllers/

# ROUTES

```
const express = require('express');

const feedController = require('../controllers/feed');

const router = express.Router();

router.get('/posts', feedController.getPosts);

module.exports = router;
```

# CONTROLLERS

```
exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [{ title: "First post", content: "this is the first post!" }],
  });
};

```

# WRAP IN APP.js

```
const express = require('express');


// ROUTES
const feedRoutes = require('./routes/feed');


const app = express();



app.use('/feed', feedRoutes)

app.listen(8080)
```

# Dati aspettati (app.js)

Aggiungere su app il middleware body parser, dobbiamo lavorare con i json, quindi ci aspettiamo che i dati vengano correttamente codificati.

```
const express = require('express');
const bodyParser = require('body-parser');

// ROUTES
const feedRoutes = require('./routes/feed');


const app = express();

// Using middlewares
app.use(bodyParser.json()); // application/json

app.use('/feed', feedRoutes)

app.listen(8080)
```

# Prelievo dati da una rotta

- POST : req.body.parametro
- GET : req.params.parametro

# CORS ERROR (Access-Control-Allow-Origin) => App.js

Cors, sta per condivisione delle risorse, puoi di base inviare richieste dallo stesso server, es: localhost:8080, ma se spostassimo l'app altrove (un altro front-end) le richieste andrebbero in cors-error.
Possiamo sovrascrivere questo sistema, in questo modo per definire i client che hanno accesso alle nostre risorse

```
// General imports
const express = require('express');
const bodyParser = require('body-parser');

// ROUTES
const feedRoutes = require('./routes/feed');

// Init app
const app = express();

// Using middlewares
app.use(bodyParser.json()); // application/json
app.use((req, res, next) => { // CORS ERROR PREVENTION
  res.setHeader('Access-Control-Allow-Origin', '*'); // La wildcard(*) indica che chiunque può fare call al server, potrebbe essere sostituita con un insieme di domini.
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE'); // Definiamo i metodi http utilizzabili.
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Possibilità di aggiungere un authorization all'header.
  next();
})

// Using routes
app.use('/feed', feedRoutes)

// App listening
app.listen(8080)
```

# INPUT VALITADION

npm install --save express-validator
Questo è un validator che va inserito direttamente nelle routes/ come middleware
Import:

```
// routes/
const { body } = require('express-validator');

// USING
// POST /feed/post
router.post(
  "/post",
  body("title").trim().isLength({ min: 5 }),
  body("content").trim().isLength({ min: 5 }),
  feedController.createPost
);

// handling error in controllers/ delle rotte
const {validationResult} = require('express-validator')
exports.rotta = (req, res, next) => bla bla..
 const errors = validationResult(req);
  if(!errors.isEmpty()){
    // 422 è lo status code della validazione
    return res.status(422).json({
      message: 'Validation failed, entered data is incorrect.', errors: errors.array()
    })
  }
```

# Configurazione DB

inserisci Sequelize o mongoose
Nel caso specifico usiamo mongoose.
npm install --save mongoose

# Connect DB ( Collegamento su MONGODB ATLAS )

```
// APP.JS
// Database import
const mongoose = require("mongoose");
// Connection DB & LISTENING
// messages è il db
mongoose
  .connect("mongodb+srv://root:QS9bWtLGOYHgCkBQ@cluster0.slkmjcp.mongodb.net/messages")
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
```

# Definiamo un modello

I modelli sono le tabelle sul database, in questo caso in NOSQL si chiamano collections, composti da documenti (documents)
models/

```
// Import mongoose
const mongoose = require("mongoose");

// Import type Schema di mongoose
const Schema = mongoose.Schema;

// Definizione dati
const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    creator: {
      type: Object,
      required: true,
    },
  },
  // Ci darà createdAt & updatedAt
  { timestamps: true }
);

// Export model Post, con struttura postSchema
module.exports = mongoose.model('Post', postSchema);
```

# Utilizzo del modello nei controllers

Esempio di creazione di un nuovo post:

```
exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed, entered data is incorrect.",
      errors: errors.array(),
    });
  }
  const title = req.body.title;
  const content = req.body.content;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: 'images/duck.jpg',
    creator: { name: "Ivan" },
  });
  post
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully!",
        post: result
      });
    })
    .catch((err) => console.log(err));
};
```

# Handler errori generale (metodo elegante)

```
// In app.js creiamo il middleware che triggera tutti gli errori
// Va inserito dopo le rotte
// General error handling middlewares error
// Verrà triggtutti i throw error nei controllers
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({message: message})
})

// Dentro il controller invece controllers/ impostiamo per far sì che vada in errore in maniera congruente.
exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    // Manda automaticamente uno snippet async
    // Stiamo effettivamente restituendo una risposta in 422
    throw error;

  }
  const title = req.body.title;
  const content = req.body.content;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: 'images/duck.jpg',
    creator: { name: "Ivan" },
  });
  post
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully!",
        post: result
      });
    })
    .catch((err) => {
      // Se lo status code non è settato ma siamo andati in errore, significa che non è un errore previsto es: validazione(422)
      // Salviamo quindi in 500
      if(!err.statusCode){
        err.statusCode = 500
      }
      // Andiamo al middleware errore in app.js
      next(err);
    });
};
```

# Servire immagini statiche

```
// in app.js (middleware)
const path = require("path");

//Serving static images
app.use("/images", express.static(path.join(__dirname, 'images')));

// Questo permetterà di reperire le immagini in urlServer/images/immagineQualsiasi.formato
```

# File upload

Serve multer, npm install --save multer
Installiamo anche uuid, npm install --save uuid
Importiamolo su app.js

```
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configurazione di multer
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    // Questo pecca su macchine windows => cb(null, new Date().toISOString() + '-' + file.originalname);
    const mime = file.mimetype === 'image/png' ? '.png' : file.mimetype === 'image/jpg' ? '.jpg' : file.mimetype === 'image/jpeg' ? '.jpeg' : '.notMyBusiness'

    cb(null, uuidv4() + mime)
  }
});
// Controlli sul tipo di formato che ci aspettiamo
const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/png' || file.mimetype == 'image/jpg' || file.mimetype === 'image/jpeg'){
    // True sta per salva il file
    cb(null, true)
  }
  else{
    // False, sta per non salvare il file
    cb(null, false)
  }
}

// Aggiungiamo il middleware
// .single('image') semplicemente, sta dicendo a multer che ci aspettiamo una singola immagine
// Nel campo della richiesta image, es: req.body.image
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));


// UTILIZZO SUL CONTROLLER controllers/
exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    // Manda automaticamente uno snippet async
    // Stiamo effettivamente restituendo una risposta in 422
    throw error;
  }

  if(!req.file){
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }

  // Pecca su windows => const imageUrl = req.file.path;
  const imageUrl = req.file.path.replace("\\", "/");
  const title = req.body.title;
  const content = req.body.content;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: { name: "Ivan" },
  });
  post
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully!",
        post: result,
      });
    })
    .catch((err) => {
      // Se lo status code non è settato ma siamo andati in errore, significa che non è un errore previsto es: validazione(422)
      // Salviamo quindi in 500
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      // Andiamo al middleware errore in app.js
      next(err);
    });
};
```

# MONGOOSE FUNCTIONS QUERY

- model.save().then().catch(); => Crea / Aggiorna un modello
- model.find().then().catch(); => Select \*, seleziona tutti i dati di una tabella (collection)
- model.findById().then().catch(); => Seleziona per ID da una collection
- model.findByIdAndRemove.then().catch(); => Seleziona per Id e lo rimuove

# UPDATE LATO PRATICO

```
exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    // Manda automaticamente uno snippet async
    // Stiamo effettivamente restituendo una risposta in 422
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  // Prendiamo l'url dell'attuale immagine
  let imageUrl = req.body.image;

  // Se è stato caricato un file nuovo
  if(req.file){
    imageUrl = req.file.path.replace("\\", "/");
  }

  if(!imageUrl){
    const error = new Error('No file picked.');
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId).then((post) => {

    if(!post){
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }

    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }


    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;
    return post.save();
  })
  .then(result => {
    res.status(200).json({ message: 'Post updated!', post: result})
  })
  .catch((err) => {
    // Se lo status code non è settato ma siamo andati in errore, significa che non è un errore previsto es: validazione(422)
    // Salviamo quindi in 500
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    // Andiamo al middleware errore in app.js
    next(err);
  })
}

// Funzione utile per pulire le vecchie immagini non più in uso
const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
}
```

# DELETE IN PRATICA

```
exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }

      //check logged in user
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);

    })
    .then(result => {
      res.status(200).json({message: 'Deleted post.'})
    })

    .catch((err) => {
      // Se lo status code non è settato ma siamo andati in errore, significa che non è un errore previsto es: validazione(422)
      // Salviamo quindi in 500
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      // Andiamo al middleware errore in app.js
      next(err);
    });
};

```

# PAGINAZIONE | PAGINATION

```
exports.getPosts = (req, res, next) => {
  // Paginazione
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  // Prendiamo il numero di posts
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      // Il metodo skip, salta una pagina
      // supponendo di avere currentPage a 2, skippiamo 2 - 1 => La pagina 1 e tutti i suoi elementi
      // Prendendo direttamente la 2
      // Con limit prendiamo solo 2 elementi in questo caso
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res
        .status(200)
        .json({
          message: "Fetched posts.",
          posts: posts,
          totalItems: totalItems,
        });
    })
    .catch((err) => {
      // Se lo status code non è settato ma siamo andati in errore, significa che non è un errore previsto es: validazione(422)
      // Salviamo quindi in 500
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      // Andiamo al middleware errore in app.js
      next(err);
    });
};
```

# SEZIONE AUTENTICAZIONE

- Installiamo bcryptjs, per criptare le passwords, npm install --save bcryptjs
- Installiamo jsonwebtoken per gestire i jwt, npm install --save jsonwebtoken

1. Creazione del modello user

```
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'I am new!'
  },
  // Collegamento ai posts col modello Post
  posts: [
    {
      // Tipologia object ID, noSQL lo utilizza come metodologia di ID
      type: Schema.Types.ObjectId,
      // Referenza al model Post
      ref: "Post",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);



```

2. Rotte auth

```
const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");
const router = express.Router();

const authController = require("../controllers/auth");

// PUT /auth/signup
router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        // Check se l'email esiste già su un utente
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  authController.signup
);

// POST /auth/login
router.post("/login", authController.login);

module.exports = router;



// IN APP.JS
app.use("/auth", authRoutes);
```

3. Sistemazione dell'error handler in APP.JS

```
// General error handling middlewares error
// Verrà triggtutti i throw error nei controllers
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  // Abbiamo aggiunto questo
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});
```

4. Controllers auth

```
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  // HASHING PW
  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      const user = new User({
        email: email,
        name: name,
        password: hashedPw,
      });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: "User created!", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("A user with this e-mail already exist");
        error.statusCode = 401;
        throw error;
      }

      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong password!");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(), // perchè è un objectID per mongoDB
        },
        "some^super_se_^cret^S_password",
        { expiresIn: "1h" }
      );
      res.status(200).json({token: token, userId: loadedUser._id.toString()})
      // Creating json web token (jwt)
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

```

# Creazione middleware di protezione per le rotte, se un utente è autenticato può fare determinate cose.
- Crea middleware/is-auth.js
```
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization')
  if(!authHeader){
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try{
    decodedToken = jwt.verify(token, 'some^super_se_^cret^S_password');
  }
  catch(err){
    err.statusCode = 500;
    throw err;
  }
  if(!decodedToken){
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
}
// per proteggere una rotta basta fare così
// Esempio di routes/feed.js

const isAuth = require("../middleware/is-auth");
// DELETE /feed/post/id
router.delete("/post/:postId", isAuth, feedController.deletePost);
```

# Cancellazione di una relazione, esempio: Se un utente ha posts, viene cancellato un posts dal db, dovrebbe sparire in NOSQL anche dall'utente.
```
exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }

    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not authorized");
      error.statusCode = 403;
      throw error;
    }
      //check logged in user
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      return User.findById(req.userId);
     
    })
    .then(user => {
      // Cancelliamo il post contenuto dentro l'utente, perchè ormai non esiste più
      user.posts.pull(postId);
      return user.save();
      
    })
    .then(result => {
       res.status(200).json({ message: "Deleted post." });
    })
    .catch((err) => {
      // Se lo status code non è settato ma siamo andati in errore, significa che non è un errore previsto es: validazione(422)
      // Salviamo quindi in 500
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      // Andiamo al middleware errore in app.js
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

```

# Un pò di teoria sul jsonwebtoken

Il json web token (jwt) è un metodo sicuro di codifica per l'autenticazione, viene suddiviso in 3 sezioni.

1. L'header, che definisce l'algoritmo e il tipo
2. Il payload, ovvero i dati all'interno
3. La verify signature
   ```
   HEADER
   {
   "alg" : "HS256",
   "typ" : "JWT"
   },
   PAYLOAD
   {
   "email" : "test@test.com",
   "userId" : "1",
   "iat" : 153916581,
   "exp" : 1539166728, (scadenza)
   }
   VERIFY SIGNATURE
   Di più su: https://jwt.io
   ```
