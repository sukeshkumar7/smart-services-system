const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    discounttype:{
        type: String,
        enum: ['percentage', 'fixed'],
        requiured: true
    },
    discountamount:{
        type: Number,
        required: true,
    },
    expiredate: {
        type: Date,
        default: null
    },
    usagelimit:{
        type: Number,
        default: 1
    },
    usedcount:{
        type: Number,
        default: 0
    },
    minimumamount: {
        type: Number,
        default: 0
    },
    isactive:{
        type: Boolean,
        default: true
    },
    usedby: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"users"
        }
    ]
},{timestamps: true})

const CouponModel = mongoose.model('coupons',CouponSchema)
module.exports = CouponModel