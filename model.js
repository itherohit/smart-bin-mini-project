const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let bin = new Schema(
  {
    name: {
      type: String
    },
    location: {
        type: String
    },
    lat: {
      type: Number
    },
    lon: {
      type: Number
    },
    isFull: {
        type: Boolean
    }
  },
  { collection: "Smartbins" }
);

module.exports = mongoose.model("Smartbins", bin);