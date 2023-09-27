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
