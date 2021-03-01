var express = require('express');
var router = express.Router();
const userController = require('../controllers/user')


router.get('/',(req,res)=>{
  res.render('User/login.hbs')                                    
})
router.get('/register',(req,res)=>{
  res.render('User/register',{name:'UMAR'})
})
router.post('/login',(req,res)=>{
  console.log(req.body);
  userController.userLogin(req.body).then((response)=>{
    console.log('res',response);
    res.json(response)
  })
})
module.exports = router;
