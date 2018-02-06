var express = require('express');
var dotenv = require('dotenv');
var path = require('path');
var plivo = require('plivo');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var codes = require('./api/models/Model');
var jwt = require('jsonwebtoken');
var auth = require ('./api/helpers/authHelpers');

dotenv.config();

mongoose.Promise = require('bluebird');
mongoose.connect( process.env.DB_URI, { useMongoClient: true, promiseLibrary: require('bluebird') })
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'true'}));


app.post('/sms/', function(request, response) {

  // plivo number
  var toNumber = request.body.To || request.query.To;
  //Sender's number
  var fromNumber = request.body.From || request.query.From;
  var code = request.body.Text || request.query.Text;
  code = code.toLowerCase();
  var err = '';

  // Find the code in database
  codes.findOneAndUpdate(
    { toNumber: toNumber, codeName: code, lastDate: { $gte: new Date()}, status: true, balance: { $gte: 0.04 }},
    { $inc: { balance: -0.04, messagesSent: 1} },
    { new: true},
    function( err, doc){
      if (doc) {
          var params = {
              'src' : toNumber, // Sender's phone number
              'dst' : fromNumber // Receiver's phone Number
          };
          var body = doc.message;

          var r = plivo.Response();
          r.addMessage(body, params);
          response.set({'Content-Type': 'text/xml'});
          response.end(r.toXML());
      } 
    }
  );
});

// Authentication post page 
app.post('/sms/login', function(req, res) {
  //user admin only
  if ( auth.isUserAuthenticated(req) ){
    const user = { name: process.env.USERNAME };
    const token = jwt.sign({user}, auth.getSecureKey());
    res.json( {token : token } );
  }else{
    res.sendStatus(403);
  }
});


/* Insert codes */
app.post('/sms/add', auth.securedToken, function(req, res, next) {
  
  jwt.verify(req.token, auth.getSecureKey(), function(err, data){
    if (err){
      res.sendStatus(403);
    }else{

      var objectToInsert = {
            toNumber: "680-666-6855",
            codeName: "deal2",
            clientName: "Pollo-tropical2",
            clientLogin: "pollot2",
            clientEmail: "pollo2@pollo.com",
            clientPass: "PolloDulce1223",
            initialBalance: 10.00,
            balance: 10.00,
            messagesSent: 0,
            message: "this is the message to send you",
            lastDate: "2018-02-28",
            expirationDate: null
          };

      // Insert into db
      codes.create(objectToInsert, function (err, post) {
        if (err) return next(err);
          res.sendStatus(200);
      });
    }
  });
});

var port = process.env.PORT || 3002;  
app.listen(port);

module.exports = app;
