const mongoose = require("mongoose");
console.log("sdsdda");

productSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
});

module.exports = mongoose.model("Product", productSchema);
