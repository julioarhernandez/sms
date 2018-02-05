var mongoose = require('mongoose');

var codesSchema = new mongoose.Schema({
  toNumber: String,
  status: {type:Boolean, default: true},
  codeName: String,
  clientName: String,
  clientLogin: String,
  clientEmail: String,
  clientPass: String,
  initialBalance: Number,
  balance: Number,
  messagesSent: Number,
  lastDate: Date
});

module.exports = mongoose.model('Codes', codesSchema);
