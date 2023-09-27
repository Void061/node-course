const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db; 

const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://root:QS9bWtLGOYHgCkBQ@cluster0.slkmjcp.mongodb.net/shop?retryWrites=true&w=majority"
  )
    .then((client) => {
      console.log("Connected!");
      // è possibile inserire il nome di un db per cambiarlo
      // In questo caso il default sarà shop, come da url indicato
      _db = client.db('');
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if(_db){
    return _db;
  }
  throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
