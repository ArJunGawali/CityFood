const mongoose = require("mongoose");

userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  verify: { type: Boolean },
});

module.exports = mongoose.model("User", userSchema);
