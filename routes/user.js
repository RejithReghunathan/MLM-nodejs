var express = require('express');
var router = express.Router();
const userController = require('../controllers/user')


router.get('/',(req,res)=>{
  let user = req.session.user
  if(user){
    res.render('User/home',{user})
  }else{
  res.render('User/login.hbs')  
  }                                  
})
router.get('/register',(req,res)=>{
  let rc= req.query.code
  console.log(rc);
  res.render('User/register',{name:rc})
})
router.post('/login',(req,res)=>{
  console.log(req.body);
  userController.userLogin(req.body).then((response)=>{
    req.session.user = response.user;
    res.json(response)
  })
})
router.get('/home',(req,res)=>{
  let user=req.session.user 
  if(user){
    res.render('User/home',{user})
  }
  else{
    res.redirect('/')
  }
  
})
router.get('/invite',(req,res)=>{
  let user = req.session.user
  userController.getInviteLink(user._id).then((response)=>{
    res.render('User/invite',{response,user})
    
  })
})
router.post('/signup',(req,res)=>{
  userController.userSignup(req.body).then((response)=>{
    req.session.user = response;
    console.log(response);
    res.json(response)
  }).catch((response)=>{
    res.json(response)
  })
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})
module.exports = router;
