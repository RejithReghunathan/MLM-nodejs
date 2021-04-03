const db = require('../config/connection')
const collection = require('../config/collection')
var objectId = require("mongodb").ObjectID;
const bcrypt = require('bcrypt')
let referralCodeGenerator = require('referral-code-generator');
const Razorpay = require('razorpay');
const {
    resolve
} = require('path');
const {
    LogInstance
} = require('twilio/lib/rest/serverless/v1/service/environment/log');
const {
    count
} = require('console');
const {
    request
} = require('http');
const {
    disable
} = require('debug');
const { rejects } = require('assert');
var instance = new Razorpay({
    key_id: process.env.razorpayKeyID,
    key_secret: process.env.razorpayKeySECRET,
});
const client = require('twilio')(process.env.accountSID, process.env.authToken)
var phone


module.exports = {
    userLogin: (data) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                email: data.email
            })

            if (!user) {
                response.status = 3
                resolve(response)
            } else {
                bcrypt.compare(data.password, user.password).then((status) => {
                    if (status) {
                        response.status = 1
                        response.user = user
                        if(user.wallet){
                            resolve(response)
                        }
                        else{
                            db.get().collection(collection.USER_COLLECTION).updateOne({
                                _id:objectId(user._id)
                            },
                            {
                            $set:{
                                wallet:{
                                    refferalAmount:0,
                                    bonusAmount:0
                                }
                            }})
                        }
                        
                    } else {
                        response.status = 2
                        resolve(response)
                    }
                })
            }

        })
    },
    userSignup: (data) => {
        return new Promise(async (resolve, reject) => {
            let status = {}
            let wallet ={}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                referral_code: data.referral_code
            })
            let email = await db.get().collection(collection.USER_COLLECTION).findOne({
                email:data.email
            })
            if(email){
                status.errCode=3
                
            }else{
            if (user) {
                if (user.referrals < 2) {
                    if (user.referrals == 0) {
                        data.status = false
                        data.referred_code = user.referral_code
                        data.referred_userid = objectId(user._id)
                        data.referred_user=user.name
                        data.referral_code = referralCodeGenerator.custom('uppercase', 3, 3, data.name)
                        data.side = 'left'
                        data.role = 1
                        data.referrals = 0
                        data.verify=false
                        referrals = user.referrals + 1
                        data.password = await bcrypt.hash(data.password, 10);
                        wallet.refferalAmount = 0
                        wallet.bonusAmount = 0
                        data.wallet = wallet
                        data.membership= objectId('606176368ba9da0cac5e2b18')
                        let response = await db.get().collection(collection.USER_COLLECTION).insertOne(data)
                        let result = await db.get().collection(collection.USER_COLLECTION).updateOne({
                            referral_code: user.referral_code
                        }, {
                            $set: {
                                referrals: referrals,
                                left:objectId(response.ops[0]._id),
                                levels:[
                                    {"1":1}
                            ]
                            }
                        })
                        getTotalLevels(user._id)
                        async function getTotalLevels(referralId){
                            let a = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(referralId)})
                            
                            if(a){
                                console.log(a,"The A of the India");
                                console.log("THe a id",a._id);
                                getTotalLevels(a.referred_userid)
                                
                            }
                        }
                        setTimeout(()=>{
                            resolve(response.ops[0])
                        },3000)
                    } else {
                        data.status = false
                        data.referred_code = user.referral_code
                        data.referred_user = user.name
                        data.referral_code = referralCodeGenerator.custom('uppercase', 3, 3, data.name)
                        data.side = 'right'
                        data.role = 1
                        data.referrals = 0
                        data.verify=false
                        referrals = user.referrals + 1
                        data.password = await bcrypt.hash(data.password, 10);
                        wallet.refferalAmount = 0
                        wallet.bonusAmount = 0
                        data.wallet = wallet
                        let response = await db.get().collection(collection.USER_COLLECTION).insertOne(data)
                        db.get().collection(collection.USER_COLLECTION).updateOne({
                            referral_code: user.referral_code
                        }, {
                            $set: {
                                referrals: referrals,
                                right:objectId(response.ops[0]._id),
                                levels:[
                                    {"1":2}
                            ]
                            }
                        })
                        resolve(response.ops[0])
                    }
                } else {
                    status.errCode = 2 //limit exceeded
                    reject(status)
                }
            } else {
                status.errCode = 1 //invalid referal
                reject(status)
            }
        }

        })
    },
    getInviteLink: (id,host) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                _id: objectId(id)
            })
            rc = user.referral_code
            link = host + '/register?code=' + rc
            resolve(link)
        })
    },
    requestOTP: (mobile) => {
        phone = mobile.mobile
        return new Promise((resolve, reject) => {
            client.verify.services(process.env.serviceID).verifications.create({
                to: phone,
                channel: 'sms'
            }).then((data) => {
                resolve(data)
            })
        })
    },
    verifyOTP: (data) => {
        let otp = data.otp
        return new Promise((resolve, reject) => {
            client.verify.services(process.env.serviceID).verificationChecks
                .create({
                    to: phone,
                    code: otp
                }).then((data) => {
                    data.phone = phone
                    resolve(data)
                })
        })
    },
    addPhone: (id, phone) => {
        phone = parseInt(phone)
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: objectId(id)
            }, {
                $set: {
                    phone: phone
                }
            })
            resolve(data)
        })
    },
    documentUpload: (data, userId) => {
        let detail = {}
        detail.panCard = data.pan
        detail.bankAcct = data.bank
        detail.ifsc = data.ifsc
        detail.userId = objectId(userId)
        detail.verifyBank=false
        detail.panVerify=false
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collection.DOCUMENT_COLLECTION).findOne({
                _id: objectId(userId)
            })
            if (!data) {
                db.get().collection(collection.DOCUMENT_COLLECTION).insertOne(detail).then((result) => {
                    if (result) {
                        db.get().collection(collection.USER_COLLECTION).updateOne({
                            _id: objectId(userId)
                        }, {
                            $set: {
                                document: true
                            }
                        })
                    }
                    resolve(result.ops[0])
                })
            } else {
                // Come back here for updating after the admin reject the documentl verification 
            }
        })
    },
    generateRazorpay: (userId) => {
        return new Promise(async (resolve, reject) => {
            var options = {
                amount: 25000,
                currency: 'INR',
                receipt: "RCPT" + userId
            };
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                _id: objectId(userId)
            })
            instance.orders.create(options, function (err, order) {
                order.user = user
                console.log(order);
                resolve(order)
            })
        })
    },
    verifyPaymentDetails: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', 'Vc7ocS2CYtfgTGayZs8Hatdk')
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: objectId(orderId)
            }, {
                $set: {
                    payment: true,
                    status: true,
                    verify:false
                }
            }).then(() => {
                resolve()
            })
        })
    },
    tree: (userid) => {
        return new Promise((resolve, reject) => {
            var obj = []
            userFuct(userid)
            async function userFuct(userid) {
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                    _id: objectId(userid)
                })
                if (user != null) {
                    obj.push(user)
                    userFuct(user.left)
                    userFuct(user.right)
                }
            }
            setTimeout(() => {
                let length = obj.length
                resolve(length)
            }, 1000)
        })
    },
    singleUser: (id) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                _id: objectId(id)
            })
            if (user) {
                resolve(user)
            }
        })
    },
    getAllSubordiante: (id) => {
        return new Promise(async (resolve, reject) => {
            let subOrdinates = []
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                _id: objectId(id)
            })
            if (user.left != null && user.right != null) {
                console.log('enteres');
                let left = await db.get().collection(collection.USER_COLLECTION).findOne({
                    _id: objectId(user.left)
                })
                let right = await db.get().collection(collection.USER_COLLECTION).findOne({
                    _id: objectId(user.right)
                })
                subOrdinates.push(left)
                subOrdinates.push(right)
                console.log('hello', user);
                setTimeout(() => {
                    resolve(subOrdinates, user)
                }, 100)

            } else if (user.left != null) {
                let left = await db.get().collection(collection.USER_COLLECTION).findOne({
                    _id: objectId(user.left)
                })
                subOrdinates.push(left)
                setTimeout(() => {
                    resolve(subOrdinates)
                }, 100)
            } else if (user.right != null) {
                let right = await db.get().collection(collection.USER_COLLECTION).findOne({
                    _id: objectId(user.right)
                })
                subOrdinates.push(right)
                setTimeout(() => {
                    resolve(subOrdinates)
                }, 100)

            } else {
                setTimeout(() => {
                    reject()
                }, 1000)

            }
        })
    },
    phoneExist: (mob) => {
        return new Promise(async (resolve, reject) => {
            let number = '+' + mob
            console.log(number, "THE NUMBER");
            let num = await db.get().collection(collection.USER_COLLECTION).findOne({
                phone: number
            })
            if (num) {
                resolve(num)
            } else {
                reject()
            }
        })
    },
    getFirstLevel: (userId) => {
        let data = {}
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                _id: objectId(userId)
            })
            if (user) {
                let userLeft = await db.get().collection(collection.USER_COLLECTION).findOne({
                    _id: objectId(user.left)
                })
                let userRight = await db.get().collection(collection.USER_COLLECTION).findOne({
                    _id: objectId(user.right)
                })
                data.left = userLeft
                data.right = userRight
            }
            resolve(data)
        })
    },
    getDetails:(userId)=>{
        return new Promise((resolve,reject)=>{
            let user = db.get().collection(collection.USER_COLLECTION).findOne({
                _id:objectId(userId)
            })
            resolve(user)
        })
    },
    subOrdinatesDetails:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let sub=[]
            let list = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match:{
                        _id:objectId(userId)
                    },
                }
            ]).toArray()
           resolve(list)
        })
    },
    emailCheck:(emailId)=>{
        return new Promise(async(resolve,reject)=>{
            let email =await db.get().collection(collection.USER_COLLECTION).findOne({email:emailId})
            if(email){
                console.log(email,"athe Email")
                resolve(email)
            }
            else{
                reject()
            }
        })
    },
    verifyIFSC:(ifsce)=>{
        var ifsc = require('ifsc');
        console.log('called',ifsc);
        let data = ifsce.toUpperCase()
        return new Promise((resolve,reject)=>{
            ifsc.fetchDetails(data).then(function(res) {
                console.log('UPPER SARATH ',res);
                resolve(res)
             }).catch((err)=>{
                 console.log(err);
                 reject(err)
             })
            
        })
    }
}