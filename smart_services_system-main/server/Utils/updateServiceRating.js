const ReviewModel = require('../Models/Rating_Review')
const ServiceModel = require('../Models/Service') 


const updateServiceRating = async(serviceid) =>{
    const reviews = await ReviewModel.find({serviceid})
    
    const totalreviews = reviews.length;
    const averagerating = totalreviews
      ? reviews.reduce((acc, r) => acc + r.rating,0) / totalreviews : 0;
    
    await ServiceModel.findByIdAndUpdate(serviceid,{
        avgrating: averagerating.toFixed(1),
        totalreviews
    })
}

module.exports = updateServiceRating