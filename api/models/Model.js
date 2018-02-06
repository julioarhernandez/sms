var mongoose = require('mongoose');
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;
var codesSchema = new mongoose.Schema({
  toNumber: String,
  status: {type:Boolean, default: true},
  codeName: String,
  clientName: String,
  clientLogin: String,
  clientEmail: String,
  clientPass: String,
  initialBalance: Number,
  balance: {
    type: SchemaTypes.Double
  },
  messagesSent: Number,
  message: String,
  lastDate: Date,
  expirationDate: Date
});

module.exports = mongoose.model('codes', codesSchema);
