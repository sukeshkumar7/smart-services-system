const mongoose = require('mongoose')

const RatingSchema = new mongoose.Schema({
      bookingid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bookings',
        required: true
      },
      serviceid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'services',
        required: true
      },
      providerid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
      },
      customerid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
      },
      rating:{
        type: Number,
        required: true,
        min: 1,
        max:5
      },
      reviewtext:{
        type: String,
      }
},{timestamps: true}) 


const RatingModel = mongoose.model('ratings',RatingSchema)

module.exports = RatingModel