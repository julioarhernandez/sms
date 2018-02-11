var mongoose = require('mongoose');
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;
var numberSchema = new mongoose.Schema({
  number: String,
  users:[{
      uid: {
          type: SchemaTypes.ObjectId, 
          ref: 'codes' 
        },
        code: String,
        date: Date,
    }]
});

module.exports = mongoose.model('numbers', numberSchema, 'numbers');
