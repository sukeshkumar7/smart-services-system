const mongoose = require('mongoose')
require('dotenv').config()



const ConnectDB = async() =>{
    await mongoose.connect(process.env.mongo_url,{
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err))
}

module.exports = ConnectDB