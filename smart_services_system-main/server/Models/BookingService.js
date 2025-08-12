const mongoose = require('mongoose') 

const BookingSchema = new mongoose.Schema({
    customerid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    providerid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    Bookingservices:[
        {
            serviceid:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'services',
                required: true
            },
            bookingdate:{
                type: String,
                required: true
            },
            bookingtime:{
                type: String,
                required: true
            },
            status:{
                type: String,
                enum: ['pending', 'confirmed', 'completed', 'cancelled'],
                default: 'pending'
            },
            price:{
                type: Number,
                required: true
            },
        }
    ],
    totalprice:{
        type: Number,
        required: true
    },
    paymentstatus:{
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    paymentmethod:{
        type: String,
        enum: ['creditcard', 'paypal', 'banktransfer'],
        default: null
    },
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        default: null,
    },
    discountAmount: {
        type: Number,
        default: 0,
    }
},{timestamps: true})

const BookingModel = mongoose.model('bookings',BookingSchema)
module.exports = BookingModel