const { parse } = require('dotenv')
const ServiceModel = require('../Models/Service')

exports.getproductsbytitle = async(req,res) =>{
    const{serviceid,title} = req.params
    if(!serviceid,!title){
        return res.status('400').json({success:false,message: 'serviceid and title is need',statuscode:400})
    }
    const services = await ServiceModel.find({title})
    if(!services){
        return res.status(400).json({success:false,message:'services is not found',statuscode:400})
    }
    return res.status(200).json({success:false,message:'services is found',statuscode:200,services})
}
exports.getproductsbyprice = async(req,res)=>{
    let{maxprice,minprice} = req.body
    if(!maxprice || !minprice){
        return res.status(400).json({success:false,message:'Please fill the max min prices'})
    }
    minprice = parseFloat(minprice)
    maxprice = parseFloat(maxprice)
    const query = {price: { $gte: minprice, $lte: maxprice }}
    const services = await ServiceModel.find(query)
    return res.status(200).json({success:true,message:'services are filter by the prices',statuscode:200,services})
}
exports.getservicesbyrating = async(req,res)=>{
    try{
        const services = await ServiceModel.find().sort({avgrating:-1})
        if(services.length === 0){
            return res.status(400).json({success:false,message: 'no services found',statuscode: 400})
        }
        return res.status(200).json({success:true,message: 'Services are sorted by rating',statuscode: 200,services})
    }
    catch(err){
        console.log(`Internal Server Error ${err}`)
        return res.status(500).json({success:false,message: `Internal Server Error ${err.message}`,statuscode:500})
    }
}
exports.getservicesbycategory = async (req, res) => {
    try {
        const { category } = req.body; 

        if (!category) {
            return res.status(400).json({ success: false, message: 'Category is required', statuscode: 400 });
        }

        const services = await ServiceModel.find({ category });

        if (services.length === 0) {
            return res.status(404).json({ success: false, message: 'No services found in this category', statuscode: 404 });
        }

        return res.status(200).json({ success: true, services, statuscode: 200 });

    } catch (err) {
        console.log(`Internal Server Error ${err.message}`);
        return res.status(500).json({ success: false, message: `Internal Server Error ${err.message}`, statuscode: 500 });
    }
};
