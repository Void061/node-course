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
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  // Ci darà createdAt & updatedAt
  { timestamps: true }
);

// Export model Post, con struttura postSchema
module.exports = mongoose.model('Post', postSchema);