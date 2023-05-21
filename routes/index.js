const route = require('express').Router()
const admin = require('./admin')
const user = require('./user')

route.use('/admin',admin)
route.use('/user',user)

module.exports = route
