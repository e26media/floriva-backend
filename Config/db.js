const mongoose =require('mongoose');
const mongoUrl='mongodb://127.0.0.1:27017/flower';


const   connectMongoDb =async()=>{
    try{
        await mongoose.connect(mongoUrl);
      console.log("Connect Database");

    }
    catch(err){
        console.log("Not Connect Data base",err);
    }
}
module.exports=connectMongoDb;