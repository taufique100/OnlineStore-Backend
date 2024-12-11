// require('dotenv').config({path:'./env'});
import dotenv from 'dotenv'
import connectDB from "./db/index.js";
import { app } from './app.js';


dotenv.config({
    path:'./.env'
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port : ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log('MongoDB connection error', err)
})





























/**
 * 
import express from 'express';
const app = express();
(async()=>{
    try{
       await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on('error',(error)=>{
            console.log("Error", error)
        })

        app.listen(process.env.PORT,()=>{
            console.log(`APp is listing on port ${process.env.PORT}`)
        })

    }catch(error){
        console.log(error)
        throw error;
    }
})()

*/