const express = require('express')
const app = express();
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.json());
const dbString = process.env.DATABASE_URL
mongoose.connect(dbString)
const db = mongoose.connection;

db.on('error',(err)=>{
    console.log(err)
})

db.once('connected',()=>{
    console.log("database connected")
})
const route = require('./routes/index')
app.use('/',route)

app.listen(3001,()=>{
    console.log("server started on http://localhost:3001/")
})