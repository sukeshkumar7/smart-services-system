const ServiceModel = require('../Models/Service')
const UserModel = require('../Models/Users')
const middle = require('../Middlewares/middleware') 


exports.addservice = async (req, res) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Please Provide Token', statuscode: 400 });
        }
        const {
            title,
            description,
            category,
            provider,
            price,
            duration,
            availableslots,
            rating,
            totalreviews,
            isactive
        } = req.body;

        if (!title || !description || !category || !price || !duration || !Array.isArray(availableslots) || availableslots.length === 0) {
            return res.status(400).json({ success: false, message: 'Please Provide All Fields', statuscode: 400 });
        }

        const decoded = await middle.decodetoken(token); 
        const user = await UserModel.findOne({ email: decoded }); 

        if (!user) {
            return res.status(400).json({ success: false, message: 'User Not Found', statuscode: 400 });
        }

        if (user.role === 'customer') {
            return res.status(403).json({
                success: false,
                message: 'You are unauthorized to add the service. Only admin or provider can add services.',
                statuscode: 403
            });
        }

        const addservice = await ServiceModel.create({
            title,
            description,
            category,
            provider: user._id,
            price,
            duration,
            availableslots,
            rating,
            totalreviews,
            isactive
        });

        if (!addservice) {
            return res.status(400).json({ success: false, message: 'Service Not Added', statuscode: 400 });
        }

        return res.status(200).json({ success: true, message: 'Service Added Successfully', statuscode: 200, addservice });

    } catch (err) {
        console.log(`Internal Server Error: ${err}`);
        return res.status(500).json({
            success: false,
            message: `Internal Server Error: ${err.message}`,
            statuscode: 500
        });
    }
};
exports.getallservices = async(req,res) =>{
   try{
        const{token} = req.headers
        if(!token){
            return res.status(400).json({success:false,message:'Please Provide Token',statuscode:400})
        }
        const decoded = await middle.decodetoken(token)
        const user = await UserModel.findOne({email:decoded})
        if(!user){
            return res.status(400).json({success:false,message:'User Not Found',statuscode:400})
        }
        const getallservices = await ServiceModel.find({})
        if(!getallservices){
            return res.status(400).json({success:false,message:'Services Not Found',statuscode:400})
        }
        return res.status(200).json({success:true,message:'Services Found Successfully',statuscode:200,getallservices})
   }
   catch(err){
    console.log(`Internal Server Error: ${err}`)
    return res.status(500).json({success:false,message:`Internal Server Error: ${err.message}`,statuscode:500})
   }
}
exports.getsingleservice = async(req,res) =>{
    try{
         const{token} = req.headers
         if(!token){
             return res.status(400).json({success:false,message:'Please Provide Token',statuscode:400})
         }
         const {serviceid} = req.params
        if(!serviceid){
            return res.status(400).json({success:false,message:'Please Provide Service ID',statuscode:400})
        }
        const decoded = await middle.decodetoken(token)
        const user = await UserModel.findOne({email:decoded})
        if(!user){
            return res.status(400).json({success:false,message:'User Not Found',statuscode:400})
        }
        const getsingleservice = await ServiceModel.findById(serviceid)
        if(!getsingleservice){
            return res.status(400).json({success:false,message:'Service Not Found',statuscode:400})
        }
        return res.status(200).json({success:true,message:'Service Found Successfully',statuscode:200,getsingleservice})
    }
    catch(err){
        console.log(`Internal Server Error: ${err}`)
        return res.status(500).json({success:false,message:`Internal Server Error: ${err.message}`,statuscode:500})
    }
} 
exports.updateservice = async(req,res)=>{
    try{
        const {token} = req.headers
        if(!token){
            return res.status(400).json({success:false,message:'Please Provide Token',statuscode:400})
        }
        const {serviceid} = req.params
        if(!serviceid){
            return res.status(400).json({success:false,message:'Please Provide Service ID',statuscode:400})
        }
        const decoded = await middle.decodetoken(token)
        const user = await UserModel.findOne({email:decoded})
        if(!user){
            return res.status(400).json({success:false,message:'User Not Found',statuscode:400})
        }
        const service = await ServiceModel.findById(serviceid)
        if(!service){
            return res.status(400).json({success:false,message:'Service Not Found',statuscode:400})
        }
        if( user.role === 'customer' || service.provider.toString() !== user._id.toString()){
            return res.status(403).json({success:false,message:'You are unauthorized to update the service. Only perticular provider can update services.',statuscode:403})
        }
        const updateservice = await ServiceModel.findByIdAndUpdate(serviceid,req.body,{new:true})
        if(!updateservice){
            return res.status(400).json({success:false,message:'Service Not Updated',statuscode:400})
        }
        return res.status(200).json({success:true,message:'Service Updated Successfully',statuscode:200,updateservice})
    }
    catch(err){
        console.log(`Internal Server Error: ${err}`)
        return res.status(500).json({success:false,message:`Internal Server Error: ${err.message}`,statuscode:500})
    }
}
exports.deleteservice = async(req,res)=>{
    try{
         const{token} = req.headers
         if(!token){
             return res.status(400).json({success:false,message:'Please Provide Token',statuscode:400})
         }
         const {serviceid} = req.params
         if(!serviceid){
            return res.status(400).json({success:false,message:'Please Provide Service ID',statuscode:400})
        }
        const decoded = await middle.decodetoken(token)
        const user = await UserModel.findOne({email:decoded})
        if(!user){
            return res.status(400).json({success:false,message:'User Not Found',statuscode:400})
        }
        const service = await ServiceModel.findById(serviceid)
        if(!service){
            return res.status(400).json({success:false,message:'Service Not Found',statuscode:400})
        }
        if(user.role === 'customer' || service.provider.toString() !== user._id.toString()){
            return res.status(403).json({success:false,message:'You are unauthorized to delete the service. Only perticular provider can delete services.',statuscode:403})
        }
        if(user.role === 'customer'){
            return res.status(403).json({success:false,message:'You are unauthorized to delete the service. Only admin or provider can delete services.',statuscode:403})
        }
        const deleteservice = await ServiceModel.findByIdAndDelete(serviceid)
        if(!deleteservice){
            return res.status(400).json({success:false,message:'Service Not Deleted',statuscode:400})
        }
        return res.status(200).json({success:true,message:'Service Deleted Successfully',statuscode:200,deleteservice})
    }
    catch(err){
        console.log(`Internal Server Error: ${err}`)
        return res.status(500).json({success:false,message:`Internal Server Error: ${err.message}`,statuscode:500})
    }
}