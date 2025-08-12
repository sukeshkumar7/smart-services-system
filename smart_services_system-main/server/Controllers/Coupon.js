const CouponModel = require('../Models/Coupon')
const UserModel = require('../Models/Users')
const middle = require('../Middlewares/middleware')
exports.addcoupon = async(req,res)=>{
    try{
        const {token} = req.headers
        if(!token){
            return res.status(400).json({success:false,message:'Token is required',statuscode:400})
        }
        const{code,discounttype,discountamount,expiredate,minimumamount} = req.body
        if(!code||!discounttype||!discountamount){
            return res.status(400).json({success:false,message:'Please Fill All Fields',statuscode:400})
        }
        const decoded = await middle.decodetoken(token)
        const user = await UserModel.findOne({email:decoded})
        if(!user){
            return res.status(400).json({success:false,message:'User not found'})
        }
        if(user.role !== 'admin'){
            return res.status(400).json({success:false,message:'You Are Not Authorized To Add The Coupon',statuscode:400})
        }
        const addcoupon = await CouponModel.create({
            code,
            discountamount,
            discounttype,
            expiredate,
            minimumamount
        })
        return res.status(200).json({success:true,message:'Coupon is added Successfully',statuscode:true,addcoupon})

    }
    catch(err){
        console.log(`Internl Server Error ${err}`)
        return res.status(400).json({success:false,message:`Internal Server Error ${err.message}`,statuscode:400})
    }
}