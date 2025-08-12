const express = require('express')
const BookingRouter = express.Router()
const bookingctrl = require('../Controllers/BookingService')

BookingRouter.post('/bookservice/:serviceid',bookingctrl.BookService)
BookingRouter.get('/getuserbookings/:userid',bookingctrl.getservice)
BookingRouter.get('/getproviderservices/:providerid',bookingctrl.getservicebyproviderid)
BookingRouter.put('/updatestatus/:bookingid',bookingctrl.updatestatus)
BookingRouter.post('/payment/:bookingid',bookingctrl.proccedtopayment)

module.exports = BookingRouter