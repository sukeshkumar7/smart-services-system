const mongoose = require('mongoose')

const ServiceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
      },
      category: {
        type: String,
        required: true,
      },
      provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      price: {
        type: Number,
        required: true,
      },
      duration: {
        type: String,
        required: true,
      },
      availableslots: [{
        date: String, // e.g. "2025-04-30"
        times: [String], // e.g. ["10:00", "11:00", "14:30"]
      }],
    
      avgrating: {
        type: Number,
        default: 0,
      },
      totalreviews: {
        type: Number,
        default: 0,
      },
      isactive: {
        type: Boolean,
        default: true,
      }
},{timestamps: true});

const ServiceModel = mongoose.model('services',ServiceSchema)
module.exports = ServiceModel