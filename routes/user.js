const { response } = require('express');
var express = require('express');
const {
  ObjectID
} = require('mongodb');
const { session } = require('passport');

require('./passport')

var router = express.Router();
const passport = require('passport');
const user = require('../controllers/user');
const userController = require('../controllers/user')


router.get('/', (req, res) => {
  let user = req.session.user
  let loggedIn = req.session.userLoggedIn
  if (loggedIn) {
    res.render('User/home', {
      user
    })
  } else {
    res.render('User/login',{user:true,login:true})
  }
})
router.get('/register', (req, res) => {
  let rc = req.query.code
  res.render('User/register', {
    name: rc,user:true,login:true
  })
})
router.post('/login', (req, res) => {
  userController.userLogin(req.body).then((response) => {
    req.session.user = response.user;
    console.log(response.user.levels)
    req.session.userLoggedIn=true
    req.session.id=[]
    res.json(response)
  })
})
router.get('/home', (req, res) => {
  let user = req.session.user
  let loggedIn = req.session.userLoggedIn
  if (loggedIn) {
    res.render('User/home', {
      user
    })
  } else {
    res.redirect('/')
  }

})
router.post('/signup', (req, res) => {
  userController.userSignup(req.body).then((response) => {
    req.session.user = response;
    res.json(response)
  }).catch((response) => {
    res.json(response)
  })
})
router.get('/logout', (req, res) => {
  req.session.userLoggedIn=false
  res.redirect('/')
})
router.get('/acivateAcct', (req, res) => {
  let loggedIn = req.session.userLoggedIn
  let user = req.session.user
  if (loggedIn) {
    res.render('User/activateAcct', {
      user
    })
  } else {
    res.render('User/login.hbs',{user:true,login:true})
  }
})
router.post('/requestOTP', (req, res) => {
 
  userController.phoneExist(req.body.mobile).then((response)=>{
    if(response){
     
    res.json({data:false})
    }
  }).catch(()=>{
    userController.requestOTP(req.body).then((result) => {
      res.json({data:true})
    })
  })
  
})
router.post('/verifyOTP', (req, res) => {
  let user = req.session.user
  userController.verifyOTP(req.body).then((data) => {
    data.otp = true
    req.session.user.phone=true
    userController.addPhone(user._id, data.phone).then(() => {
      res.json(data)
    })

  })
})
router.post('/documentUpload', (req, res) => {
  console.log('called',req.body);
  let user = req.session.user
  userController.documentUpload(req.body, user._id).then((datas) => {
    req.session.user.document = true
    let pan = req.files.upload;
    let bank = req.files.uploadw;
    pan.mv("./public/documents/" + user._id + "-PAN.jpg", (err) => {
      if (!err) {
        bank.mv("./public/documents/" + user._id + "-BANK.jpg", (err) => {
          if (!err) {
            res.json(datas)
          }
        })
      } else {
        console.log("Error in adding Image");
      }
    });

  }).catch(() => {
    console.log('Can Upload document Document alreday exists');
  })
})
router.post('/paymentRazorpay', (req, res) => {
  let user = req.session.user
  userController.generateRazorpay(user._id).then((response) => {
    req.session.user.status = true
    res.json(response)
  })
})
router.post("/verify-payment", (req, res) => {
  let user = req.session.user
  userController
    .verifyPaymentDetails(req.body)
    .then(() => {
      userController.changePaymentStatus(user._id).then(() => {
        res.json({
          status: true
        });
      });
    })
    .catch((err) => {
      res.json({
        status: "payment failed"
      });
    });
});
router.get('/dashBoard', (req, res) => {
  req.session.id=[]

  let loggedIn = req.session.userLoggedIn
  let user = req.session.user
  if (loggedIn) {
    let data = {
      name: user.name,
      _id: user._id
    }
    userController.getFirstLevel(user._id).then((result)=>{
      userController.tree(user._id).then((count)=>{
        count=count-1
        res.render('User/tree', {
          data,user,result,count
        })
      })
    })
    
  } else {
    res.render('User/login.hbs',{user:true,login:true})
  }
})
router.post('/getSubOridinates', (req, res) => {
  let id = req.body.id; 
  var check = 0
  userController.getAllSubordiante(req.body.id).then((data) => {
    userController.singleUser(req.body.id).then((userData) => {
      for(i=0;i<=req.session.id.length;i++){
        if(req.session.id[i]===id){
            check =1
            res.json({
            a: false,
            data,
            userData
          })
        }
         }
         if(check===0){
          req.session.id.push(id)
          res.json({
          a: true,
          data,
          userData
       })
     }
    })
    
  }).catch(() => {
    res.json({
      b: true
    })
  })
})
router.get('/account',(req,res)=>{
  let user = req.session.user
  let loggedIn = req.session.userLoggedIn
  let subOridantes = []
  if (loggedIn) {
    userController.getDetails(user._id).then((userData)=>{
      userController.getInviteLink(user._id,req.headers.host).then((inviteLink) => {
        userController.subOrdinatesDetails(user._id).then((data)=>{
          datas=userData.levels
        res.render('User/account',{user,userData,inviteLink,datas})
      })
      })
    })
  } else {
    res.redirect('/')
  }
  
})
router.get('/wallet',(req,res)=>{
  let user = req.session.user
  let loggedIn = req.session.userLoggedIn
  let subOridantes = []
  if (loggedIn) {
    userController.getDetails(user._id).then((userData)=>{
      userController.getInviteLink(user._id,req.headers.host).then((inviteLink) => {
        res.render('User/wallet',{user,userData,inviteLink})
      })
    })
  } else {
    res.redirect('/')
  }  
})
router.get('/googleAuth',passport.authenticate('google',{scope:['profile','email']}))
router.get('/googleAuth/callback',passport.authenticate('google',{failureRedirect:'/failure'}),
(req,res)=>{
  userController.emailCheck(req.user.email).then((data)=>{
    if(data){
      console.log('success');
      req.session.user = data;
      req.session.userLoggedIn=true
    res.redirect('/home')
    }
    }).catch(()=>{
      res.redirect('/')
    })
}
)
router.get('/failure',(req,res)=>{
  res.render('User/login.hbs',{user:true,login:true,google:true})
})
router.get('/facebookAuth',passport.authenticate('facebook',{scope:['profile','email']}))
router.get('/facebookAuth/callback',passport.authenticate('facebook',{failureRedirect:'/failure'},),
(req,res)=>{
  userController.emailCheck(req.user.email).then((data)=>{
    if(data){
      console.log('success');
      req.session.user = data;
      req.session.userLoggedIn=true
    res.redirect('/home')
    }
    }).catch(()=>{
      res.redirect('/')
    })
})
router.post('/verifyIFSC',(req,res)=>{
  console.log(req.body.ifsc);
  userController.verifyIFSC(req.body.ifsc).then(()=>{
    res.json({a:true})
  }).catch(()=>{
    res.json({b:true})

  })
})
router.post('/withdrawRequest',(req,res)=>{
  userController.requestWithdraw(req.body).then((response)=>{
    console.log(response);
    res.json({response})
  })
})
router.get('/messages',(req,res)=>{
  let user = req.session.user
  let loggedIn = req.session.userLoggedIn
  if (loggedIn) {
    userController.getChatUser(user._id).then((data)=>{
      res.render('User/messages', {
        user,data
      })
    })
    
  } else {
    res.render('User/login',{user:true,login:true})
  }
})

module.exports = router;