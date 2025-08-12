const BookingModel = require('../Models/BookingService')
const UserModel = require('../Models/Users')
const ServiceModel = require('../Models/Service')
const middle = require('../Middlewares/middleware')
const CouponModel = require('../Models/Coupon')
const mongoose = require('mongoose')
const mail = require('../Utils/NodeMailer')

exports.BookService = async(req , res) =>{
    try{
        const {token} = req.headers 
        if(!token){
            return res.status(400).json({success:false,message:'Please Provide Token',statuscode:400})
        }
        const {serviceid} = req.params
        if(!serviceid){
            return res.status(400).json({success:false,message:'Please Provide Service ID',statuscode:400})
        }
        const {bookingdate,bookingtime} = req.body 
        if(!bookingdate || !bookingtime){
            return res.status(400).json({success:false,message:'Please Provide Booking Date and Time',statuscode:400})
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
        const booking = await BookingModel.findById(serviceid)
        if(booking){
            return res.status(400).json({success:false,message:'Service Already Booked',statuscode:400})
        }
        const bookingservice = new BookingModel({
            customerid: user._id,
            providerid: service.provider,
            Bookingservices:[
                {
                    serviceid: service._id,
                    bookingdate,
                    bookingtime,
                    status: 'pending',
                    price: service.price
                }
            ],
            totalprice: service.price
        })
        await bookingservice.save()
        await mail.sendmail({
            to: user.email,
            subject: 'Booking conformation mail',
            text: `<h2> Hi ${user.name},</h3>
                    <p> Your Service is Booked Successfully on the ${bookingservice.Bookingservices[0].bookingdate}.At ${bookingservice.Bookingservices[0].bookingtime} please notify the 
                    Bookingdate and Bookingtime</p>`
        })
        return res.status(200).json({success:true,message:'Service Booked Successfully',statuscode:200,bookingservice})

    }
    catch(err){
       
        return res.status(500).json({success:false,message:`Internal Server Error: ${err.message}`,statuscode:500})
    }
}
exports.getservice = async(req,res) =>{
    try{
        const {token} = req.headers
        if(!token){
            return res.status(400).json({success:false,message:'Please Provide Token',statuscode:400})
        }
        const {userid} = req.params
        if(!userid){
            return res.status(400).json({success:false,message:'Please Provide User ID',statuscode:400})
        }
        const decoded = await middle.decodetoken(token)
        const user = await UserModel.findOne({email:decoded})
        if(!user){
            return res.status(400).json({success:false,message:'User Not Found',statuscode:400})
        }
        if(user.role !== 'customer'){
            return res.status(400).json({success:false,message:'You Are Not Authorized To View This Service',statuscode:400})
        }
        const getservice = await BookingModel.find({customerid:userid}).populate({
            path:'Bookingservices.serviceid',
            select: 'title description category duration'
        })
        if(!getservice){
            return res.status(400).json({success:false,message:'Service Not Found',statuscode:400})
        }
        return res.status(200).json({success:true,message:'Service Found Successfully',statuscode:200,getservice})

    }
    catch(err){
        console.log(`Internal Server Error: ${err}`)
        return res.status(500).json({success:false,message:`Internal Server Error: ${err.message}`,statuscode:500})
    }
}
exports.getservicebyproviderid = async (req, res) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Please Provide Token', statuscode: 400 });
        }

        const { providerid } = req.params;
        if (!providerid) {
            return res.status(400).json({ success: false, message: 'Please Provide Provider ID', statuscode: 400 });
        }

        const decoded = await middle.decodetoken(token);
        const user = await UserModel.findOne({ email: decoded });

        if (!user) {
            return res.status(400).json({ success: false, message: 'User Not Found', statuscode: 400 });
        }

        if (user.role !== 'admin' || user.role !== 'provider' || user._id.toString() !== providerid.toString()) {
            return res.status(403).json({ success: false, message: 'You Are Not Authorized To View This Service', statuscode: 403 });
        }

        const getservice = await BookingModel.find({ providerid: providerid }).populate({
            path: 'Bookingservices.serviceid',
            select: 'title description category duration'
        });

        if (!getservice || getservice.length === 0) {
            return res.status(400).json({ success: false, message: 'Service Not Found', statuscode: 400 });
        }

        return res.status(200).json({ success: true, message: 'Service Found Successfully', statuscode: 200, getservice });
    }
    catch (err) {
        console.log(`Internal Server Error: ${err}`);
        return res.status(500).json({ success: false, message: `Internal Server Error: ${err.message}`, statuscode: 500 });
    }
}
exports.updatestatus = async (req, res) => {
    try {
      const { token } = req.headers;
      const { bookingid } = req.params;
      const { status } = req.body;
  
      // Token validation
      if (!token) {
        return res.status(400).json({ success: false, message: 'Please Provide Token', statuscode: 400 });
      }
  
      // Booking ID validation
      if (!bookingid) {
        return res.status(400).json({ success: false, message: 'Please Provide Booking ID', statuscode: 400 });
      }
  
      // Status validation
      if (!status) {
        return res.status(400).json({ success: false, message: 'Please Provide Status', statuscode: 400 });
      }
  
      // Decode token and find user
      const decoded = await middle.decodetoken(token);
      const user = await UserModel.findOne({ email: decoded });
  
      if (!user) {
        return res.status(400).json({ success: false, message: 'User Not Found', statuscode: 400 });
      }
  
      // Find booking
      const booking = await BookingModel.findById(bookingid).populate('customerid')
  
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking Not Found', statuscode: 404 });
      }
  
      const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid Status Value', statuscode: 400 });
      }
  
      // Authorization check
      if (status === 'cancelled') {
        if (String(booking.customerid) !== String(user._id)) {
          return res.status(403).json({ success: false, message: 'Only customer can cancel the booking', statuscode: 403 });
        }
      }
  
      if (status === 'confirmed' || status === 'completed') {
        if (String(booking.providerid) !== String(user._id)) {
          return res.status(403).json({ success: false, message: 'Only provider can confirm or complete the booking', statuscode: 403 });
        }
      }
  
      // Update status inside each Bookingservices item
      if (booking.Bookingservices.length > 0) {
        booking.Bookingservices.forEach(service => {
          service.status = status;
        });
        const customer = await UserModel.findById(booking.customerid)
        
        await mail.sendmail({
            to: customer.email,
            subject: "Status Of Booking Service",
            text: `<h2>Hi ${customer.name},</h2>
                   <p>Your Booking Services Status is changed please check it ones.<h3>${status}</h3>`
        })
        await booking.save();
      } else {
        return res.status(400).json({ success: false, message: 'No services found in booking', statuscode: 400 });
      }
  
      return res.status(200).json({
        success: true,
        message: 'Booking status updated successfully',
        statuscode: 200,
        booking,
      });
  
    } catch (err) {
      console.log(`Internal Server Error: ${err}`);
      return res.status(500).json({ success: false, message: `Internal Server Error: ${err.message}`, statuscode: 500 });
    }
};
exports.proccedtopayment = async (req, res) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Please Provide Token', statuscode: 400 });
        }

        const { bookingid } = req.params;
        if (!bookingid) {
            return res.status(400).json({ success: false, message: 'Please Provide Booking ID', statuscode: 400 });
        }

        const { paymentmethod, code } = req.body;
        if (!paymentmethod) {
            return res.status(400).json({ success: false, message: 'Please Provide Payment Method', statuscode: 400 });
        }

        const decoded = await middle.decodetoken(token);
        const user = await UserModel.findOne({ email: decoded });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User Not Found', statuscode: 400 });
        }

        const booking = await BookingModel.findById(bookingid);
        if (!booking) {
            return res.status(400).json({ success: false, message: 'Booking Not Found', statuscode: 400 });
        }

        if (String(booking.customerid) !== String(user._id)) {
            return res.status(403).json({ success: false, message: 'You Are Not Authorized To Proceed To Payment', statuscode: 403 });
        }

        let discountAmount = 0;
        let couponUsed = null; // to store coupon id

        if (code) {
            const coupon = await CouponModel.findOne({code});

            if (!coupon) {
                return res.status(400).json({ success: false, message: 'Coupon Not Found', statuscode: 400 });
            }

            // Correct Expiry Check
            if (coupon.expiredate && new Date(coupon.expiredate) < new Date()) {
                return res.status(400).json({ success: false, message: 'Coupon Expired', statuscode: 400 });
            }

            // Check if user already used
            if (coupon.usedby.includes(user._id)) {
                return res.status(400).json({ success: false, message: 'You have already used this coupon', statuscode: 400 });
            }

            if(booking.totalprice < coupon.minimumamount){
                return res.status(400).json({success:false,message:`You Price Should Be Minimum of ${coupon.minimumamount}`})
            }

            discountAmount = coupon.discountamount; // assuming discountAmount field in coupon
            couponUsed = coupon._id;

            // Push user id into coupon usedBy array
            coupon.usedby.push(user._id);
            coupon.usedcount += 1;
            await coupon.save();
        }

        // Final total after discount
        const totalprice = booking.totalprice - discountAmount;

        // Update booking details
        // booking.Bookingservices[0].status = 'completed'
        // await booking.save();
        booking.paymentstatus = 'paid';
        booking.paymentmethod = paymentmethod;
        booking.coupon = couponUsed;
        booking.discountAmount = discountAmount;
        booking.totalprice = totalprice;
        await booking.save();

        return res.status(200).json({ success: true, message: 'Payment Processed Successfully', statuscode: 200, booking });

    } catch (err) {
        console.log(`Internal Server Error: ${err}`);
        return res.status(500).json({ success: false, message: `Internal Server Error: ${err.message}`, statuscode: 500 });
    }
};

  
  