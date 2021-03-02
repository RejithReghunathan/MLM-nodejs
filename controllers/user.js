const db = require('../config/connection')
const collection = require('../config/collection')
var objectId = require("mongodb").ObjectID;
const bcrypt = require('bcrypt')
let referralCodeGenerator = require('referral-code-generator')

module.exports = {
    userLogin: (data) => {
        return new Promise(async (resolve, reject) => {
            let status = false
            let response = {}
            console.log('data', data);
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                name: data.email
            })
            if (!user) {
                response.status = false
                resolve(response)
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
                if (user.referrals <= 2) {
                    data.status = false
                    data.referred_code = user.referral_code
                    data.referred_user = user.name
                    data.referral_code = referralCodeGenerator.custom('uppercase',3, 3, data.name)
                    data.side = 'left'
                    data.role = 1
                    data.referrals = 0
                    referrals = user.referrals + 1
                    data.password= await bcrypt.hash(data.password, 10);
                    db.get().collection(collection.USER_COLLECTION).updateOne({
                        referral_code: user.referral_code
                    }, {
                        $set: {
                            referrals: referrals
                        }
                    })
                    let response=db.get().collection(collection.USER_COLLECTION).insertOne(data)
                    resolve(response)
                }else{
                    status.errCode=3
                    reject(status)
                }
            } else {
                status.errCode=1
                reject(status)
            }

        })
    }
}