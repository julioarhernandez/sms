var express = require('express');
var dotenv = require('dotenv');
var path = require('path');
var plivo = require('plivo');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var codes = require('./api/models/Model');
var numbers = require('./api/models/NumbersModel');
var jwt = require('jsonwebtoken');
var auth = require ('./api/helpers/authHelpers');
const ObjectId = require("mongodb").ObjectID;

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
  code = code ? code.toLowerCase(): '';
  var err = '';
  if ( code ){
    // Find the code in database
    codes.aggregate([
      { $unwind: "$codes" },
      { $match: { 
                  "status" : true ,
                  "balance" : {$gte: 0.04},
                  "lastDate" : { $gte: new Date()},
                  "codes.codeName": code, 
                  "codes.toNumber": toNumber 
                }                        
      }], function (err, post) {
              if (err) return next(err);
              // Get the message variable
              // and the client id
              if ( typeof post[0] !== "undefined" ){
                var message = post[0].codes.message;
                var cid = post[0]._id;
                // Decrement the balance and
                // increment by one messages sent field
                codes.findOneAndUpdate(
                    { _id: ObjectId(cid)},
                    { $inc: { balance: -0.04, messagesSent: 1} },
                    { new : true},
                    function( err, doc){
                      if (doc){
                      // Save the sender's number
                      // Find number in database
                      // Insert from-number, date, code and clientID
                      numbers.findOneAndUpdate(
                        { "number": fromNumber },
                        { $push : { "users": { "_id" : ObjectId(cid), "date" : new Date(), "code" : code}} },
                        { new : true, upsert: true },function(e, d){
                          if(d){
                            //Send the sms
                              var params = {
                                'src' : toNumber, // Sender's phone number
                                'dst' : fromNumber // Receiver's phone Number
                            };
                            var body = message;
                            var r = plivo.Response();
                            r.addMessage(body, params);
                            response.set({'Content-Type': 'text/xml'});
                            response.end(r.toXML());
                          }
                        });   
                    }
                  });
              }
            });
  }

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
        clientName: "pollo-tropical2",
        clientLogin: "pollot2",
        clientEmail: "pollo2@pollo.com",
        clientPass: "polloDulce1223",
        clientAddress: "123sw 23 nw, miami florida, 33124",
        initialBalance: 10.00,
        balance: 10.00,
        messagesSent: 0,
        lastDate: "2018-02-28",
        codes: [{
          toNumber: "16806666855",
          codeName: "pollo2",
          message: "this first is the message to send you",
          messagesSent: 0,
          expirationDate: null
        },
        {
          toNumber: "16806666855",
          codeName: "pollo3",
          message: "this is the second message to send you",
          messagesSent: 0,
          expirationDate: null
        }]
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
