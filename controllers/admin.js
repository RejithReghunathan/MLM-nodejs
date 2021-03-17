const db = require('../config/connection')
const collection = require('../config/collection')
var objectId = require("mongodb").ObjectID;

module.exports={
    adminLogin:(data)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                email:data.email
            })
            if(user){
                if(user.password===data.password){
                    resolve(user)
                }
                else{
                    reject({status:0})
                }
            }else{
                reject({status:1})
            }
        })
    }
}