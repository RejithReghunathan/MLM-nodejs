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
    res.render('Admin/login-admin')
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
    console.log("EE route vilichi");
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
module.exports = router;
