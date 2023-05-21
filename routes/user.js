const Room = require('../model/room')
const User = require('../model/user')
const route = require('express').Router()

// GET requests

route.get('/roomBooking', async (req, res) => {
  const availableRooms = await Room.find()
  res.json(availableRooms)
})

route.get('/pastBooking', async (req, res) => {
  const allUsers = await User.find()
  let currDate = new Date()
  let resultedUsers = allUsers.filter(item => currDate > item.endDate)
  res.json(resultedUsers)
})
route.get('/upcomingBooking', async (req, res) => {
  const allUsers = await User.find()
  let currDate = new Date()
  let resultedUsers = allUsers.filter(item => item.startDate > currDate)
  res.json(resultedUsers)
})

// POST requests

route.post('/roomBooking', async (req, res) => {
  const { email, startDate, endDate, roomType, paymentMode, roomNo } = req.body
  const { bookedDateList, dateIsBooked } = await bookedDates(
    startDate,
    endDate,
    roomNo
  )
  if (!dateIsBooked) {
    const bookRoom = await Room.findOneAndUpdate(
      { roomNo: roomNo },
      {
        $push: {
          bookedDate: {
            $each: bookedDateList
          }
        }
      }
    )
    const user = new User({
      email,
      startDate,
      endDate,
      roomType,
      paymentMode,
      roomNo,
      amount: bookRoom.price * bookedDateList.length
    })
    await user.save()
    res.json({ booked: true, user })
  } else {
    res.json({
      booked: false,
      message: 'Date is already book. Please try another date'
    })
  }
})


// PUT request
route.put('/updateUser', async (req, res) => {
  const {
    email,
    startDate,
    endDate,
    roomType,
    paymentMode,
    roomNo,
    amount,
    _id
  } = req.body
  const user = await User.findById(_id)

  const { bookedDateList, dateIsBooked } = await bookedDates(
    startDate,
    endDate,
    roomNo
  )
  if (dateIsBooked) {
    res.json({ booked: false, message: "can't update, room already booked" })
  } else {
    const { bookedDateList: previousBookingDates } = await bookedDates(
      user.startDate,
      user.endDate,
      user.roomNo
    )
    let updateRoom = await Room.findOne({ roomNo: roomNo })
    for (let date1 of updateRoom.bookedDate) {
      for (let date2 of previousBookingDates) {
        if (date1 === date2) {
          let idx = updateRoom.bookedDate.indexOf(date1)
          updateRoom.bookedDate.splice(idx)
        }
      }
    }
    await updateRoom.save()
    const updatedRoom = await Room.updateOne(
      { roomNo: roomNo },
      {
        $push: {
          bookedDate: {
            $each: bookedDateList
          }
        }
      },
      { new: true }
    )

    // await updatedRoom.save();
    const updatedObj = await User.findOneAndUpdate(
      { _id: req.body._id },
      { ...req.body, amount: updateRoom.price * bookedDateList.length },
      { new: true }
    )
    res.json({ booked: true, message: 'updated', user: updatedObj })
  }
})

//Delete Request
route.delete('/cancelBooking/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
  const { startDate, endDate, amount, roomNo } = user
  const { bookedDateList: cancelDates } = await bookedDates(
    startDate,
    endDate,
    roomNo
  )
  const choosedRoom = await Room.findOne({ roomNo: roomNo })
  for (let date1 of cancelDates) {
    let idx = choosedRoom.bookedDate.findIndex(item => {
      console.log(item, date1)
      console.log(item.valueOf() === date1.valueOf())
      return item.valueOf() === date1.valueOf()
    })
    // console.log("idx",idx)
    if (idx > -1) {
      choosedRoom.bookedDate.splice(idx, 1)
      // console.log(date1," removed")
    }
  }
  await choosedRoom.save()
  let refundedAmount = 0
  let startDateString = new Date(startDate)
  let currDateString = new Date()
  let daysLeft = new Date(startDateString - currDateString).getDate() - 1
  if (daysLeft <= 4 && daysLeft >= 2) {
    refundedAmount = amount / 2
  } else if (daysLeft > 4) {
    refundedAmount = amount
  }

  const removeUser = await User.findByIdAndDelete(req.params.id)
  // console.log(removeUser)
  res.json({ refundedAmount })
})

const bookedDates = async (startDate, endDate, roomNo) => {
  let bookedDateList = []
  let currDateString = new Date(startDate)
  const endDateString = new Date(endDate)
  while (
    currDateString.toLocaleDateString() !== endDateString.toLocaleDateString()
  ) {
    let tomorrow = new Date(startDate)
    bookedDateList.push(tomorrow)
    tomorrow.setDate(currDateString.getDate())
    currDateString.setDate(currDateString.getDate() + 1)
  }
  const choosedRoom = await Room.findOne({ roomNo: roomNo })
  if (choosedRoom) {
    for (let date1 of bookedDateList) {
      for (let date2 of choosedRoom.bookedDate || []) {
        if (date1.toLocaleDateString() === date2.toLocaleDateString()) {
          return { bookedDateList, dateIsBooked: true }
        }
      }
    }
  }
  return { bookedDateList, dateIsBooked: false }
}

module.exports = route
