const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    phone:{
        type:Number,
        required: true
    },
    password:{
        type:String,
        required: true
    },
    role:{
        type: String,
        enum: ['customer','provider','admin'],
        default: 'customer'
    },
    otp:{
        type:Number
    },
    otpexires:{
        type:Date
    },
    status:{
        type:String,
        default: 'pending'
    },
    loginotp:{
        type:Number
    },
    loginotpexpires:{
        type:Date
    },
    loginstatus:{
        type:String,
        default: 'pending'
    }
},{timestamps: true})

const UserModel = mongoose.model('users',userSchema)
module.exports = UserModel