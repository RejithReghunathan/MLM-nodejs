const db = require('../config/connection')
const collection = require('../config/collection')
var objectId = require("mongodb").ObjectID;
const bcrypt = require('bcrypt')
let referralCodeGenerator = require('referral-code-generator');
const Razorpay = require('razorpay');
const {
    resolve
} = require('path');
const { LogInstance } = require('twilio/lib/rest/serverless/v1/service/environment/log');
const { count } = require('console');
const { request } = require('http');
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
                        resolve(response)
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
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                referral_code: data.referral_code
            })
            if (user) {
                if (user.referrals < 2) {
                    data.status = false
                    data.referred_code = user.referral_code
                    data.referred_user = user.name
                    data.referral_code = referralCodeGenerator.custom('uppercase', 3, 3, data.name)
                    data.side = 'right'
                    data.role = 1
                    data.referrals = 0
                    referrals = user.referrals + 1
                    data.password = await bcrypt.hash(data.password, 10);
                    db.get().collection(collection.USER_COLLECTION).updateOne({
                        referral_code: user.referral_code
                    }, {
                        $set: {
                            referrals: referrals
                        }
                    })
                    let response = await db.get().collection(collection.USER_COLLECTION).insertOne(data)
                    resolve(response.ops[0])
                } else {
                    status.errCode = 2 //limit exceeded
                    reject(status)
                }
            } else {
                status.errCode = 1 //invalid referal
                reject(status)
            }

        })
    },
    getInviteLink: (id) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                _id: objectId(id)
            })
            rc = user.referral_code
            link = 'localhost:8000/register?code=' + rc
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
        return new Promise(async(resolve, reject) => {
            let data = await db.get().collection(collection.DOCUMENT_COLLECTION).findOne({_id:objectId(userId)})
            if(!data){
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
            }else{
                reject()
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
                    status: true
                }
            }).then(() => {
                resolve()
            })
        })
    },
    tree: () => {
        let userid = '603dd5c981696c167af5d0bb'
        return new Promise((resolve, reject) => {
            var obj = []
            var count = 0
            userFuct(userid)
            async function userFuct(userid) {
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                    _id: objectId(userid)
                })
                if (user!=null) {
                    obj.push(user)
                    userFuct(user.left)
                    userFuct(user.right)
                }
            }
            setTimeout(()=>{
                resolve(obj)
            },4000)
        })
    },
    singleUser:(id)=>{
        console.log("USERID",id);           
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(id)})
            if(user){
                resolve(user)
            }
        })
    },
    getAllSubordiante:(id)=>{
        return new Promise(async(resolve,reject)=>{
            let subOrdinates = []
            let user =await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(id)})
            console.log("USER",user);
            if(user.left!=null&&user.right!=null){
                console.log('enteres');
                let left = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(user.left)})
                let right = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(user.right)})
                subOrdinates.push(left)
                subOrdinates.push(right)
                console.log(subOrdinates,"THE SUBS");
                console.log('hello',user);
                setTimeout(()=>{
                    resolve(subOrdinates,user)
                },100)
                
            }
            else if(user.left!=null){
                let left = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(user.left)})
                subOrdinates.push(left)
                setTimeout(()=>{
                    resolve(subOrdinates)
                },1000)
            }
            else if(user.right!=null){
                let right = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(user.right)})
                subOrdinates.push(right)
                setTimeout(()=>{
                    resolve(subOrdinates)
                },1000)

            }
            else{
                setTimeout(()=>{
                    reject()
                },1000)

            }
        })
    }
}