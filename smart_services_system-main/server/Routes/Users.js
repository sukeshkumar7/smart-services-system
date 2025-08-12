const express = require('express')
const UserRouter = express.Router()
const userctrl = require('../Controllers/Users')


UserRouter.post('/signup',userctrl.Signup)
UserRouter.post('/verifyotp',userctrl.VerifyOtp)
UserRouter.post('/login',userctrl.login)
UserRouter.post('/loginotpverify',userctrl.verifyloginotp)
UserRouter.post('/resendotp',userctrl.resendotp)
UserRouter.post('/resendloginotp',userctrl.resendloginotp)
UserRouter.post('/getuser',userctrl.getuser)
UserRouter.patch('/updateprofile',userctrl.updateprofile)
UserRouter.post('/logout',userctrl.logout)
module.exports = UserRouter