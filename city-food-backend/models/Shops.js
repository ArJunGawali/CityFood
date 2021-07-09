const mongoose = require("mongoose");
console.log("sdsdda");

shopSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: { type: mongoose.Schema.Types.ObjectId },
  name: { type: String, required: true },
  image: { type: String },
  mobileNo: { type: Number },
});

module.exports = mongoose.model("Shop", shopSchema);
