const { default: mongoose } = require("mongoose");
const mongoos = require("mongoose");
const schema = mongoose.Schema;

let userSchema = new schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoos.model("users", userSchema);
