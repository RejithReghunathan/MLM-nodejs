const db = require('../config/connection')
const collection = require('../config/collection')
var objectId = require("mongodb").ObjectID;
const bcypt = require('bcrypt')

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
    }
}