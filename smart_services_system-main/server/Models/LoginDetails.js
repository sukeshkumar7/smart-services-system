const mongoose = require('mongoose')

const SessionSchema = new mongoose.Schema({
    userid:String,
    jwt:String
},{timestamps: true})

const SessionModel = mongoose.model('logindetails',SessionSchema)
module.exports = SessionModel