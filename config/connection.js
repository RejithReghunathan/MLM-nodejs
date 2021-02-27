const mongoClient = require("mongodb").MongoClient;

const state= {
    db:null
}

module.exports.connect = function(done){
    const url = 'mongodb+srv://dbUser:dbUser@mlm.l1o9h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
    const dbname = 'MLM'

    mongoClient.connect(url,{useUnifiedTopology:true},(err,data)=>{
        if(err) return done(err)

        state.db=data.db(dbname)
        done()
    })
}
module.exports.get=function(){
    return state.db
}