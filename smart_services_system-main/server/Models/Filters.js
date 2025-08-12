const mongoose = require('mongoose')

const filterSchema = new mongoose.Schema({
     maxprice:{
        type: String,
        required: true,
        default: 0
     },
     minprice:{
        type: String,
        required: true,
        default: 0
     },
     category:{
        type: String,
        require: true
    },
    title:{
      type: String,
      required: true
    }
})

const FilterModel = mongoose.model('filters',filterSchema)  
module.exports = FilterModel