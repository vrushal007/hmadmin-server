const route = require('express').Router()
const Room = require("../model/room")
const User = require('../model/user')

route.get('/allRooms',async(req,res)=>{
    const allRooms = await Room.find()
    res.json(allRooms)
})

route.get('/getRoom',async(req,res)=>{
    const room = await Room.findOne({roomNo:req.headers.roomno})
    res.json(room)
})

route.get('/getUser',async(req,res)=>{
    const user = await User.findById(req.headers.id)
    res.json(user)
})

route.get('/allUsers',async (req,res)=>{
    const allUsers = await User.find();
    res.json(allUsers)
})

route.post('/createRoom',async (req,res)=>{
    const bookRoom = new Room({
        roomNo:req.body.roomNo,
        roomType: req.body.roomType,
        price:req.body.price
    })
    const result = await bookRoom.save()
    res.json(result)
})

module.exports = route