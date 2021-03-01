var express = require('express');
var router = express.Router();
const db = require('../config/connection')
const collection = require('../config/collection')

router.get('/',(req,res)=>{
  res.render('User/login.hbs')                                    
})
router.get('/register',(req,res)=>{
  res.render('User/register',{name:'UMAR'})
})

module.exports = router;
