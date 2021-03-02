const db = require('../config/connection')
const collection = require('../config/collection')
var objectId = require("mongodb").ObjectID;
const bcypt = require('bcrypt')
let referralCodeGenerator = require('referral-code-generator')

module.exports={
    userLogin:(data)=>{
        return new Promise(async(resolve,reject)=>{
            let status = false
            let response = {}
            console.log('data',data);
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({name:data.email})
            if(!user){
                response.status=false
                resolve(response)
            }
        })
    },
    userSignup:(data)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({referral_code:data.referral_code})
            if(user){
            data.status=false
            data.referred_code=user.referral_code
            data.referred_user=user.name
            data.referral_code = referralCodeGenerator.custom('uppercase', 5, 3,data.name)
            data.side='left'
            data.role=1
            resolve(data)
            }
            else{
                reject()
            }
            
        })
    }
}