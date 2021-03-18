var express = require('express');
const {
  ObjectID
} = require('mongodb');

var router = express.Router();
const userController = require('../controllers/user')


router.get('/', (req, res) => {
  let user = req.session.user
  let loggedIn = req.session.userLoggedIn
  if (loggedIn) {
    res.render('User/home', {
      user
    })
  } else {
    res.render('User/login.hbs',{user:true,login:true})
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
    req.session.userLoggedIn=true
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
router.get('/invite', (req, res) => {
  let user = req.session.user
  let loggedIn = req.session.userLoggedIn
  if(loggedIn){
    userController.getInviteLink(user._id,req.headers.host).then((response) => {
      res.render('User/invite', {
        response,
        user
      })
  
    })
  }else{
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
    console.log('Can Uploaf document Document alreday exists');
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
  userController.getAllSubordiante(req.body.id).then((data) => {
    userController.singleUser(req.body.id).then((userData) => {
      res.json({
        a: true,
        data,
        userData
      })
    })

  }).catch(() => {
    res.json({
      b: true
    })
  })
})
module.exports = router;