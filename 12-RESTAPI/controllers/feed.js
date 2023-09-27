const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");

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
      res.status(200).json({
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

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    // Manda automaticamente uno snippet async
    // Stiamo effettivamente restituendo una risposta in 422
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided.");
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
    creator: req.userId,
  });
  post
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      // buttiamo dentro i posts dell'utente il post appena creato
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully!",
        post: post,
        creator: { _id: creator._id, name: creator.name },
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

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({ message: "Post fetched.", post: post });
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
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }

  if (!imageUrl) {
    const error = new Error("No file picked.");
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }

      if(post.creator.toString() !== req.userId){
        const error = new Error('Not authorized');
        error.statusCode = 403;
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
    .then((result) => {
      res.status(200).json({ message: "Post updated!", post: result });
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
