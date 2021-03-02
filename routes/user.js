var express = require('express');
var router = express.Router();
const userController = require('../controllers/user')


router.get('/',(req,res)=>{
  res.render('User/login.hbs')                                    
})
router.get('/register',(req,res)=>{
  let rc= req.query.id
  console.log(rc);
  res.render('User/register',{name:rc})
})
router.post('/login',(req,res)=>{
  console.log(req.body);
  userController.userLogin(req.body).then((response)=>{
    console.log('res',response);
    res.json(response)
  })
})
router.get('/home',(req,res)=>{
  res.render('User/home')
})
router.get('/invite',(req,res)=>{
  userController.getInviteLink(id).then(()=>{
    res.render('User/home',)
    
  })
})
router.post('/signup',(req,res)=>{
  userController.userSignup(req.body).then((response)=>{
    console.log('The data of the India ',response);
  }).catch(()=>{
    console.log('the data of the country absent');
  })
})
module.exports = router;
