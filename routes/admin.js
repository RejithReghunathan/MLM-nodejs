var express = require('express');
var router = express.Router();


router.get('/',(req,res)=>{
    res.render('Admin/dashboard',{admin:true})
})
router.get('/login',(req,res)=>{
    res.render('Admin/login-admin')
})
module.exports = router;
