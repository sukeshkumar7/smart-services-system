const UserModel = require('../Models/Users') 
const middle = require('../Middlewares/middleware')
const mail = require('../Utils/NodeMailer')
const bcrypt = require('bcryptjs')
const SessionModel = require('../Models/LoginDetails')
exports.Signup = async(req,res)=>{
    try{
        const {name,email,phone,password,role,confirmpassword} = req.body
        if(!name,!email,!phone,!password,!role,!confirmpassword){
            return res.status(400).json({success:false,message:'Please fill all the fields',statuscode:400})
        }
        const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
        if(!emailregex.test(email)){
            return res.status(400).json({success:false,message:'Please enter a valid email',statuscode:400})
        }
        const phoneregex = /^[0-9]{10}$/;
        if(!phoneregex.test(phone)){
            return res.status(400).json({success:false,message:'Please enter a valid phone number',statuscode:400})
        }
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!])[A-Za-z\d@#$%^&+=!]{6,}$/;
        if(!passwordRegex.test(password)){
            return res.status(400).json({success:false,message:'Password must be at least 6 characters long and contain at least one uppercase letter, one number, and one special character',statuscode:400})
        }
        if(password !== confirmpassword){
            return res.status(400).json({success:false,message:'Password and Confirm Password do not match',statuscode:400})
        }
        const ExistingUser = await UserModel.findOne({email})
        if(ExistingUser){
            return res.status(400).json({success:false,message:'User already exists',statuscode:400})
        }
        const hashedpassword = await middle.hashedpassword(password)
        const otp = await middle.otpgenerator()
        const otpexpires = await middle.otpExpires()
        const user = await UserModel.create({
            name,
            email,
            phone,
            password: hashedpassword,
            role,
            otp,
            otpexires: otpexpires,
            otpexired:false
        })
        mail.sendmail({
            to: email,
            subject: 'Registration OTP',
            text: middle.RegEmailTemplate(name,otp)

        })
        return res.status(201).json({success:true,message:'User Registred successfully',statuscode:201})
    }
    catch(err){
        console.log(`Error in internal server: ${err}`)
        return res.status(500).json({ success:false,message: `Internal Server Error: ${err}`,statuscode:500})
    }
}
exports.resendotp = async(req,res)=>{
    try{
        const {email} = req.body
        if(!email){
            return res.status(400).json({success:false,message:'Please fill all the field',statuscose:400})
        }
        const user = await UserModel.findOne({email})
        if(!user){
            return res.status(400).json({success:false,message:'User not found',statuscode:400})
        }
        if(user.status === 'pending'){
            const newotp = await middle.otpgenerator()
            const otpexpires = await middle.otpExpires()
            user.otp = newotp
            user.otpexires = otpexpires
            await user.save()
            mail.sendmail({
                to: email,
                subject: 'Resend OTP',
                text: middle.RegEmailTemplate(user.name,newotp)
            })
            return res.status(200).json({success:true,message:'OTP resent successfully',statuscode:200})
        }
        else{
            return res.status(400).json({success:false,message:'User already verified',statuscode:400})
        }
    }
    catch(err){
        console.log(`Error in internal server: ${err}`)
        return res.status(500).json({ success:false,message: `Internal Server Error: ${err}`,statuscode:500})
    }
}
exports.VerifyOtp = async(req,res)=>{
    try{
        const{email,otp} = req.body
        if(!email||!otp){
            return res.status(400).json({success:false,message:'Please fill all the fields',statuscode:400})
        }
        const user = await UserModel.findOne({email})
        if(!user){
            return res.status(400).json({success:false,message:'User not found',statuscode:400})
        }
        if(user.status === 'pending'){
            const currentTime = Date.now();
            if(user.otpexires > currentTime){
                if(user.otp === otp){
                    user.status = 'active'
                    await user.save()
                    res.status(200).send({message: 'successfully user otp is verified'})
                }
            }
            else{
                res.status(400).send({error:'otp is expired'})
            }
    }
    else{
        if(user.length>1){
            res.status(200).send({message:'multiple users found'})
        }
        else{
            res.status(400).send({message:'user not found'})
        }
    }
        
    }
    catch(err){
        console.log(`Error in internal server: ${err}`)
        return res.status(500).json({ success:false,message: `Internal Server Error: ${err}`,statuscode:500})
    }
}
exports.login = async(req,res)=>{
    try{
    const{email,password,confirmpassword} = req.body
    if(!email,!password,!confirmpassword){
        return res.status(400).json({success:false,message:'Please fill all the fields',statuscode:400})
    }
    if(password !== confirmpassword){
        return res.status(400).json({success:false,message:'Password and Confirm Password do not match',statuscode:400})
    }
    const user = await UserModel.findOne({email})
    if(!user){
        return res.status(400).json({success:false,message:'User not found',statuscode:400})
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        return res.status(400).json({success:false,message:'Invalid credentials',statuscode:400})
    }
    const payload ={id: user.email}
    const token = await middle.genratetoken(payload)
    const session = await SessionModel.create({
        userid: user._id,
        jwt: token
    })
    const loginotp = await middle.otpgenerator()
    const loginotpexpires = await middle.otpExpires()
    await UserModel.findOneAndUpdate(
            { email },
            { $set: { loginotp, loginotpexpires,otpExpired: false, } },
            { new: true }
    )
    mail.sendmail({
        to: email,
        subject: 'Login OTP',
        text: middle.loginEmailTemplate(user.name,loginotp)
    })
    return res.status(200).json({success:true,message:'Login successfully',statuscode:200,token:token})
  }
  catch(err){
        console.log(`Error in internal server: ${err}`)
        return res.status(500).json({ success:false,message: `Internal Server Error: ${err}`,statuscode:500})
  }
}
exports.resendloginotp = async(req,res)=>{
    const {email} = req.body 
    if(!email){
        return res.status(400).json({success:false,message:'Please fill all the fields',statuscode:400})
    }
    const user = await UserModel.findOne({email})
    if(!user){
        return res.status(400).json({success:false,message:'User not found',statuscode:400})
    }
    if(user.loginstatus === 'pending'){
        const newloginotp = await middle.otpgenerator()
        const loginotpexpires = await middle.otpExpires()
        user.loginotp = newloginotp
        user.loginotpexpires = loginotpexpires
        await user.save()
        mail.sendmail({
            to: email,
            subject: 'Resend Login OTP',
            text: middle.loginEmailTemplate(user.name,newloginotp)
        })
        return res.status(200).json({success:true,message:'Login otp resent successfully',statuscode:200})
    }
    else{
        return res.status(400).json({success:false,message:'User already verified',statuscode:400})
    }
}
exports.verifyloginotp = async(req,res)=>{
   try{
        const{email,loginotp} = req.body 
        if(!email||!loginotp){
            return res.status(400).json({success:false,message:'Please fill all the fields',statuscode:400})
        }
        const user = await UserModel.findOne({email})
        if(!user){
            return res.status(400).json({success:false,message:'User not found',statuscode:400})
        }
        if(user.loginstatus === 'pending'){
            const currentTime = Date.now();
            if(user.loginotpexpires > currentTime){
                if(user.loginotp === loginotp){
                    user.loginstatus = 'active'
                    await user.save()
                    return res.status(200).json({success:true,message:'Login otp verified successfully',statuscode:200})
                }
                else{
                    return res.status(400).json({success:false,message:'Invalid otp',statuscode:400})
                }
            }
            else{
                return res.status(400).json({success:false,message:'otp is expired',statuscode:400})
            }
        }
        else{
            if(user.length>1){
                return res.status(200).json({success:true,message:'multiple users found',statuscode:200})
            }
            else{
                return res.status(400).json({success:false,message:'user not found',statuscode:400})
            }
       }
   }
   catch(err){
        console.log(`Error in internal server: ${err}`)
        return res.status(500).json({ success:false,message: `Internal Server Error: ${err}`,statuscode:500})
    }
}
exports.getuser = async(req,res)=>{
    try{
        const{token} = req.headers
        if(!token){
            return res.status(400).json({success:false,message:'Please fill all the fields',statuscode:400})
        }
        const decoded = await middle.decodetoken(token)
        const user = await UserModel.findOne({email:decoded}).select('-password -otp -otpexires -loginotp -loginotpexpires -__v -status -loginstatus')
        if(!user){
            return res.status(400).json({success:false,message:'User not found',statuscode:400})
        }
        return res.status(200).json({success:true,message:'User found successfully',statuscode:200,user})
    }
    catch(err){
        console.log(`Error in internal server: ${err}`)
        return res.status(500).json({ success:false,message: `Internal Server Error: ${err}`,statuscode:500})
    }
} 
exports.updateprofile = async(req,res)=>{
   try{
        const{token} = req.headers
        if(!token){
            return res.status(400).json({success:false,message:'Please fill all the fields',statuscode:400})
        }
        else{
            const decoded = await middle.decodetoken(token)
            const user = await UserModel.findOne({email: decoded})
            if(!user){
                return res.status(400).json({success:false,message:'User not found',statuscode:400})
            }
            else{
                await UserModel.findOneAndUpdate(
                    {email:decoded},
                    {$set: req.body},
                    {new: true}
                )
                return res.status(200).json({success:true,message:'User updated successfully',statuscode:200})
            }
        }
   }
   catch(err){
       console.log(`Error in internal server: ${err}`)
       return res.status(500).json({success:false,message: `Internal Server Error: ${err}`,statuscode:500})
   }
}
exports.logout = async(req,res)=>{
    try{
        const {token} = req.headers
        if(!token){
            return res.status(400).json({success:false,message:'Please fill all the fields',statuscode:400})
        }
        const decoded = await middle.decodetoken(token)
        const user = await UserModel.findOne({email:decoded})
        if(!user){
            return res.status(400).json({success:false,message:'User not found',statuscode:400})
        }
        await SessionModel.findOneAndDelete({userid:user._id})
        return res.status(200).json({success:true,message:'User logged out successfully',statuscode:200}) 
    }
    catch(err){
        console.log(`Error in internal server: ${err}`)
        return res.status(500).json({ success:false,message: `Internal Server Error: ${err}`,statuscode:500})
    }
}