const mongoose = require("mongoose");

const ExcelDataSchema = new mongoose.Schema({
  Policy: {
    type: String,
    required: true,
  },
  Expiry: {
    type: Number,
    required: true,
  },
  Location: {
    type: String,
    required: true,
  },
  State: {
    type: String,
    required: true,
  },
  Region: {
    type: String,
    required: true,
  },
  InsuredValue: {
    type: Number,
    required: true,
  },
  Category: {
    type: String,
    required: true,
  },
  NAME: {
    type: String,
    required: true,
  },
  Pos: {
    type: String,
    required: true,
  },
  Ht: {
    type: String,
    required: true,
  },
  Wt: {
    type: Number,
    required: true,
  },
  Age: {
    type: String,
    required: true,
  },
  Exp: {
    type: String,
    required: true,
  },
  College: {
    type: String,
    required: true,
  },
  FirstName: {
    type: String,
    required: true,
  },
  LastName: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  Phone: {
    type: Number,
    required: true,
  },
});

const ExcelDataModel = mongoose.model("ExcelData", ExcelDataSchema);

module.exports = ExcelDataModel;
