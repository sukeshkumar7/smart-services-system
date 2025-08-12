const UserModel = require('../Models/Users')
const mongoose = require('mongoose')
const BookingModel = require('../Models/BookingService')
const ServiceModel = require('../Models/Service') 
const ReviewModel = require('../Models/Rating_Review')
const middle = require('../Middlewares/middleware')
const updateServiceRating = require('../Utils/updateServiceRating')

exports.addrating = async(req,res)=>{
    try{
        const {token} = req.headers
        const {serviceid} = req.params
        const {rating,reviewtext} = req.body

        if(!token){
            return res.status(400).json({success: false, message: 'Please provide token', statuscode: 400})
        }
        if(!serviceid || !rating){
            return res.status(400).json({success: false, message: 'Please provide seviceid and rating',statuscode: 400})
        }

        const decoded = await middle.decodetoken(token)
        const user = await UserModel.findOne({email: decoded})
        if(!user){
            return res.status(400).json({success: false,message: 'User not found',statuscode: 400})
        } 
        const booking = await BookingModel.findOne({
            customerid: user._id,
            'Bookingservices.serviceid': serviceid
        })
        if(!booking){
             return res.status(400).json({success:false, message: 'You have not booked this service',statuscode: 400})
        }
        const existingReview = await ReviewModel.findOne({
            serviceid,
            customerid: user._id
        })
        if(existingReview){
             return res.status(400).json({success:false, message:'You have already reviewd this sservice', statuscode: 400})
        }
        const newReview = await ReviewModel.create({
            bookingid: booking._id,
            serviceid,
            providerid: booking.providerid,
            customerid: user._id,
            rating,
            reviewtext
        })

        await newReview.save() 
        await updateServiceRating(serviceid)
        return res.status(200).json({success: true,message: 'Review added successfully',statuscode: 201, review: newReview})
    }
    catch(err){
        console.log(`Internal Server Error ${err}`)
        return res.status(400).json({success:false,message:`Internal Server Error : ${err.message}`})
    }
}
exports.getsinglereview = async(req,res)=>{
    try{
        const{reviewid} = req.params
        const review = await ReviewModel.findById(reviewid)
        .populate({path: 'customerid',select: 'name'})
        .populate({path: 'serviceid',select: 'name description duration'})
        .select('-providerid -bookingid -_id -createdAt -updatedAt -__v')
        if(!review){
            return res.status(400).json({success:false, message:'Review not found',statuscode: 400})
        }
        res.status(200).json({success:true,message:'Here is the review',review})
    }
    catch(err){
        console.log(`Internal Server Error ${err}`)
        return res.status(500).json({success:false,message:`Internal Server Error: ${err.message}`,statuscode:500})
    }
}
exports.getreviewsbyservice = async(req,res)=>{
    try{
        const {serviceid} = req.params
        const reviews = await ReviewModel.find({serviceid})
        .populate({path: 'serviceid',select: 'name description duration'})
        .populate({path: 'customerid',select: 'name'})
        .select('-providerid -bookingid -_id -createdAt -updatedAt -__v')
        if(!reviews){
            return res.status(400).json({success:false,message:'Review not found',statuscode: 400})
        }
        res.status(200).json({success:true,message:'Here is the review',Result:reviews})
    }
    catch(err){
        console.log(`Internal Server Error: ${err}`)
        return res.status(500).json({success:false,message:`Internal Server Error: ${err.message}`,statuscode:500})
    }
} 
exports.getRatingBreakdown = async(req,res) =>{
    try{
        const {serviceid} = req.params

        const ratingData = await ReviewModel.aggregate([
            { $match: {serviceid: new mongoose.Types.ObjectId(serviceid)}},
            {
                $group: {
                    _id: "$rating",
                    count: {$sum: 1}
                }
            }
        ])
        const total = ratingData.reduce((sum, r) => sum + r.count, 0);

    const breakdown = [5, 4, 3, 2, 1].map(star => {
      const found = ratingData.find(r => r._id === star);
      const count = found ? found.count : 0;
      const percent = total > 0 ? ((count / total) * 100).toFixed(2) : "0.00";
      return { star, count, percent: `${percent}%` };
    });

    return res.status(200).json({
      success: true,
      breakdown
    });
    }
    catch(err){
        console.log(`Internl Server Error: ${err}`)
        return res.status(500).json({success:false,message:`Internal Server Error ${err.message}`,ststuscode: 500})
    }
} 
exports.updaterating = async(req,res) =>{
    try{
        const{token} = req.headers
        if(!token){
            return res.status(400).json({success:false,message:'Please fill token',statuscode:400})
        }
        const{rating,reviewtext} = req.body
        if(!rating){
             return res.status(400).json({success:false,message:'Please Provide the rating',statuscode:400})
        }
        const{serviceid} = req.params
        if(!serviceid){
            return res.status(400).json({success:false,message:'Please Provide the serviceid',statuscode:400})
        }
        const decoded = await middle.decodetoken(token)
        const user = await UserModel.findOne({email:decoded})
        if(!user){
            return res.status(400).json({success:false,message:'user not found',statuscode:400})
        }
        const service = await ServiceModel.findById(serviceid) 
        if(!service){
            return res.status(400).json({success:false,message:'Service is not there',statuscode:400})
        }
        const review = await ReviewModel.findOne({ serviceid: service._id});
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found for this user and service', statuscode: 404 });
        }
        review.rating = rating
        if(reviewtext){
            review.reviewtext = reviewtext
        }
        await review.save()
        await updateServiceRating(serviceid)
        return res.status(200).json({success:false,message:'Review is update',statuscode: 200})
    }
    catch(err){
        console.log(`Internal Server Error${err}`)
        return res.status(500).json({success:false,message:`Internal Server Error ${err.message}`,statuscode:400})
    }
}
exports.deleterating = async(req,res)=>{
    try{
        const {token} = req.headers
        if(!token){
            return res.status(400).json({success:false,message:'Token is required',statuscode:400})
        }
        const {serviceid} = req.params
        if(!serviceid){
            return res.status(400).json({success:false,message: 'Serviceid is required',statuscode:400})
        }
        const decoded = await middle.decodetoken(token)
        const user = await UserModel.findOne({email: decoded})
        if(!user){
            return res.status(400).json({success:false,message:'user not found',statuscode:400})
        }
        const service = await ServiceModel.findById(serviceid)
        if(!service){
             return res.status(400).json({success:false,message:'service not found',statuscode:400})
        }
        const Review = await ReviewModel.findOne({serviceid})
        if(!Review){
            return res.status(400).json({success:false,message: 'Review not there',statuscode:400})
        }
        if(user.role !== 'customer'){
            return res.status(400).json({success:false,message: 'Only customer can delete the review',statuscode:400})
        }
        const deletereview = await ReviewModel.deleteOne({serviceid})

        return res.status(200).json({success:false,message:'Review is deleted',statuscode:200,deletereview})
    }
    catch(err){
        console.log(`Internal Server Error ${err}`)
        return res.status(500).json({success:false,message:`Internal Server Error: ${err.message}`,statuscode:500})
    }
}