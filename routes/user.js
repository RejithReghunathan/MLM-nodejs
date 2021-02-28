var express = require('express');
var router = express.Router();
const db = require('../config/connection')
const collection = require('../config/collection')

router.get('/',(req,res)=>{
  res.render('User/login.hbs')                                    
})

module.exports = router;
