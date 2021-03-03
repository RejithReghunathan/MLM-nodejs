const db = require('../config/connection')
const collection = require('../config/collection')
var objectId = require("mongodb").ObjectID;
const bcrypt = require('bcrypt')
let referralCodeGenerator = require('referral-code-generator');
// const { config } = require('dotenv/types');
const client = require('twilio')(process.env.accountSID, process.env.authToken)
var phone 


module.exports = {
    userLogin: (data) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                email: data.email
            })
            console.log('THe user of the country', user);
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
        phone=mobile.mobile
        return new Promise((resolve, reject) => {
            client.verify.services(process.env.serviceID).verifications.create({
                to: phone,
                channel: 'sms'
            }).then((data) => {
                resolve(data)
            })
        })
    },
    verifyOTP:(data)=>{
        let otp = data.otp
        console.log("OTP OF THE COUNTYE",otp);
        return new Promise((resolve,reject)=>{
            client.verify.services(process.env.serviceID).verificationChecks
            .create({
                to: phone,
                code: otp
            }).then((data) => {
                data.phone=phone
                resolve(data)
            })
        })
    },
    addPhone:(id,phone)=>{
        phone=parseInt(phone)
        return new Promise(async(resolve,reject)=>{
           let data=await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(id)},{$set:{
                phone:phone
            }})
            resolve(data)
        })
    }
}