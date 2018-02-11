var mongoose = require('mongoose');
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;
var codesSchema = new mongoose.Schema({
  clientName: String,
  clientLogin: String,
  clientEmail: String,
  clientPass: String,
  clientAddress: String,
  messagesSent: Number,
  initialBalance: Number,
  balance: {
    type: SchemaTypes.Double
  },
  lastDate: Date,
  status: {type:Boolean, default: true},
  codes: [{
    codeName: String,
    toNumber: String,
    message: String,
    expirationDate: Date
  }]
});

module.exports = mongoose.model('codes', codesSchema, 'codes');
