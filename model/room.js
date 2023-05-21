const mongoose = require("mongoose")

const roomSchema = new mongoose.Schema({
    roomNo: {
        type: String,
        required: true
    },
    roomType:{
        type: String,
        required: true
    },
    price:{
        type:Number
    },
    bookedDate: [
        {
            type: Date,
            default:null,
        }
    ]
})

module.exports = mongoose.model('room',roomSchema)