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
    },
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users = await db.get().collection(collection.USER_COLLECTION).find({role:1}).toArray()
            resolve(users)
        })
    },
    getUnverifiedUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match:{
                        status:true,
                        role:1
                    }
                },
                {
                    $project:{
                        name:1,
                        _id:1,
                        phone:1
                    }
                },
                {
                    $lookup:{
                        from:"document",
                        localField:"_id",
                        foreignField:"userId",
                        as:"documents"
                    }
                },
                {
                    $project:{
                        name:1,
                        _id:1,
                        phone:1,
                        documents:{
                            $arrayElemAt:["$documents",0]
                        }
                    }
                },
            ]).toArray()
            
            if(users){
                console.log("Aggregate cheyth samanam ..",users);
                resolve(users)
            }
            else{
                reject()
            }
        })
    },
    verifyPanAdmin:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           let data = await db.get().collection(collection.DOCUMENT_COLLECTION).updateOne({userId:objectId(userId)},{
                $set:{
                    panVerify:true
                }
            })
            if(data)
            {
            resolve()
            }
        })
    }
}