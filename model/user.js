const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    email:{
        type:String,
    },
    startDate:{
        type:Date,
    },
    endDate:{
        type:Date
    },
    roomNo:{
        type:String
    },
    roomType:{
        type:String,
    },
    paymentMode:{
        type:String,
    },
    amount:{
        type:Number,
    }
})

module.exports = mongoose.model('users',userSchema)