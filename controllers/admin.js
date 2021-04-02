const db = require('../config/connection')
const collection = require('../config/collection')
var objectId = require("mongodb").ObjectID;
const { response } = require('express');

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
                        role:1,
                        verify:false
                    }
                },
                {
                    $project:{
                        name:1,
                        _id:1,
                        phone:1,
                        document:1,
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
                        document:1,
                        documents:{
                            $arrayElemAt:["$documents",0]
                        }
                    }
                },
            ]).toArray()
            
            if(users){
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
            if(data.bankVerify&&data.panVerify){
               
                    db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{
                        $set:{
                            verify:true
                        }
                    })
                
            }
            if(data)
            {
            resolve()
            }
        })
    },
    verifyBankAdmin:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           let data = await db.get().collection(collection.DOCUMENT_COLLECTION).updateOne({userId:objectId(userId)},{
                $set:{
                    bankVerify:true
                }
            })
            if(data.panVerify&&data.bankVerify){
                
                    db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{
                        $set:{
                            verify:true
                        }
                    })
                
            }
            if(data)
            {
            resolve()
            }
        })
    },
    getverifiedUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users = db.get().collection(collection.USER_COLLECTION).find({status:true,role:1}).toArray()
            if(users){
                resolve(users)
            }
        })
    },
    addMembership:(data)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.MEMBERSHIP_COLLECTION).insertOne({name:data.name,amount:data.amount}).then((result)=>{
                if(result){
                    resolve(result.ops[0])
                }
            })
        })
    },
    getAllMembership:()=>{
        return new Promise(async(resolve,reject)=>{
        let datas= await db.get().collection(collection.MEMBERSHIP_COLLECTION).find({}).toArray()
        if(datas){
            resolve(datas)
        }
        })
    },
    viewMembership:()=>{
        return new Promise(async(resolve,reject)=>{
            let data = await db.get().collection(collection.USER_COLLECTION).find({payment:true}).toArray()
            if(data){
                resolve(data)
            }
        })
    },
    rejectPanAdmin:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           let data=await db.get().collection(collection.DOCUMENT_COLLECTION).updateOne({userId:objectId(userId)},{
                $set:{
                    panReject:true
                }
            })
            if(data){
            resolve()
            }
        })
    },
    rejectBankAdmin:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           let data= await db.get().collection(collection.DOCUMENT_COLLECTION).updateOne({userId:objectId(userId)},{
            $set:{
                bankReject:true
            }
        })
            if(data){
                await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{
                    $set:{

                    reject:true
                }})
            resolve()
            }
        })
    }
}