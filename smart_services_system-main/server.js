const express = require('express')
require('dotenv').config()
const ConnectDB = require('./server/DB/db')
const UserRouter = require('./server/Routes/Users')
const ServiceRouter = require('./server/Routes/Service')
const BookingRouter = require('./server/Routes/BookingService')
const CouponRouter = require('./server/Routes/Coupon')
const ReviewRouter = require('./server/Routes/Rating_Review')
const FilterRouter = require('./server/Routes/Search_Filters')
require('./server/Utils/BookingRemainder')
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const  PORT = process.env.port


//Routes
app.use('/users',UserRouter)
app.use('/services',ServiceRouter)
app.use('/bookings',BookingRouter)
app.use('/coupons',CouponRouter)
app.use('/ratings',ReviewRouter)
app.use('/filters',FilterRouter)
// Connect to MongoDB
ConnectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}✔️`)
    })
})