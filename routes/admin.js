var express = require('express');
var router = express.Router();


router.get('/',(req,res)=>{
    res.render('Admin/dashboard',{admin:true})
})

module.exports = router;
