var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var random = require('random-js');
var jwt = require('jsonwebtoken');
var auth = require ('../helpers/authHelpers');
var Codes = require('../models/Model');
const ObjectId = require("mongodb").ObjectID;

router.get('*', function(req, res){
    res.json('Are you lost?');
});

module.exports = router;
