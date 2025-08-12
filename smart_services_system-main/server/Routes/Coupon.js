const express = require('express')
const CouponRouter = express.Router()
const Couponcntrl = require('../Controllers/Coupon')


CouponRouter.post('/addcoupon',Couponcntrl.addcoupon)

module.exports = CouponRouter