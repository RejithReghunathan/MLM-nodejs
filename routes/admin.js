var express = require('express');
var router = express.Router();
var adminController = require('../controllers/admin')


router.get('/',(req,res)=>{
    let adminLoggedIn = req.session.adminLoggedIn
    if(adminLoggedIn){
        res.render('Admin/dashboard',{admin:true})
    }
    else{
        res.render('Admin/login-admin')
    }  
})
router.get('/login',(req,res)=>{
    let adminLoggedIn = req.session.adminLoggedIn
    if(adminLoggedIn){
        res.render('Admin/dashboard',{admin:true})
    }
    else{
        res.render('Admin/login-admin')
    }  
})
router.post('/login',(req,res)=>{
    adminController.adminLogin(req.body).then((admin)=>{
        req.session.adminLoggedIn=true
        req.session.admin=admin
        admin.status=3
        res.json(admin)
    }).catch((response)=>{
        res.json(response)
    })
})
router.get('/logoutadmin', (req, res) => {
    req.session.adminLoggedIn=false
    res.redirect('/admin')
})
router.get('/getAllUser',(req,res)=>{
    let adminLoggedIn = req.session.adminLoggedIn
    if(adminLoggedIn){
        adminController.getAllUsers().then((users)=>{
            res.render('Admin/allUsers',{admin:true,users})
        })
    }
    else{
        res.render('Admin/login-admin')
    }   
})
router.get('/verifyUsers',(req,res)=>{
    let adminLoggedIn = req.session.adminLoggedIn
    if(adminLoggedIn){
        adminController.getUnverifiedUsers().then((users)=>{
            res.render('Admin/verifyUsers',{admin:true,users})
        }).catch(()=>{
            console.log("no data found");
        }) 
    }
    else{
        res.render('Admin/login-admin')
    }  
})
router.post('/verifyPan',(req,res)=>{
    adminController.verifyPanAdmin(req.body.userId).then(()=>{
        res.send({res:true})
    }) 
})
router.post('/verifyBank',(req,res)=>{
    adminController.verifyBankAdmin(req.body.userId).then(()=>{
        res.send({res:true})
    })
})
router.get('/verifiedUser',(req,res)=>{
    adminController.getverifiedUsers().then((users)=>{
        res.render('Admin/verifiedUser',{admin:true,users})
    })
})
router.get('/memberShips',(req,res)=>{
    let adminLoggedIn = req.session.adminLoggedIn
    if(adminLoggedIn){
        // adminController.getAllUsers().then((users)=>{
            res.render('Admin/memberships',{admin:true})
        // })
    }
    else{
        res.render('Admin/login-admin')
    }  
    
})
module.exports = router;