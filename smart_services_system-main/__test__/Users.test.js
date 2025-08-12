const request = require('supertest')
const UserModel = require('../server/Models/Users')
const middle = require('../server/Middlewares/middleware')
const mail = require('../server/Utils/NodeMailer')
const express = require('express')
const bcrypt = require('bcryptjs')
const SessionModel = require('../server/Models/LoginDetails')
const app = express()
app.use(express.json())

const{Signup,resendotp,VerifyOtp,login,getuser,updateprofile,logout} = require('../server/Controllers/Users')

const UserRouter = express.Router()
UserRouter.post('/signup',Signup)
UserRouter.post('/resendotp',resendotp)
UserRouter.post('/verifyotp',VerifyOtp)
UserRouter.post('/login',login)
UserRouter.get('/getuser',getuser)
UserRouter.post('/updateprofile',updateprofile)
UserRouter.post('/logout',logout)
app.use('/users',UserRouter)

jest.mock('../server/Models/Users')
jest.mock('../server/Middlewares/middleware')
jest.mock('../server/Utils/NodeMailer')
jest.mock('bcryptjs')
jest.mock('../server/Models/LoginDetails')

describe('POST /signup',()=>{
    beforeEach(()=>{
         jest.clearAllMocks();
    })
    test('Successful signup returns 201 and sends email',async() => {
        UserModel.findOne.mockResolvedValue(null);
        middle.hashedpassword.mockResolvedValue('hashed123');
        middle.otpgenerator.mockResolvedValue('1234456')
        middle.otpExpires.mockReturnValue(new Date(Date.now() + 5 * 60 * 1000))
        middle.RegEmailTemplate.mockResolvedValue('Email content')
        UserModel.create.mockResolvedValue({email: 'test@example.com'})
        mail.sendmail.mockResolvedValue(true)

        const res = await request(app)
        .post('/users/signup')
        .send({
            name: 'Rajesh',
            email: 'rajesh@example.com',
            phone: '9876543210',
            password: 'Password@123',
            confirmpassword: 'Password@123',
            role: 'user'
        })
        expect(res.status).toBe(201);
        expect(res.body.message).toBe('User Registred successfully')
        expect(mail.sendmail).toHaveBeenCalledWith(
            expect.objectContaining({
              to: 'rajesh@example.com',
              subject: 'Registration OTP'
            })
          );
    })
    test('signup fails id user already exists',async ()=>{
        UserModel.findOne.mockResolvedValue({email: 'exists@example.com'})
        const res = await request(app)
        .post('/users/signup')
        .send({
            name: 'Rajesh',
            email: 'exists@example.com',
            phone: '9876543210',
            password: 'Password@123',
            confirmpassword: 'Password@123',
            role: 'user'
        });
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('User already exists')
    })
    test('signup fails if password and confirm password do not match',async()=>{
        const res = await request(app) 
        .post('/users/signup')
        .send({
           name: 'Rajesh',
           email: 'rajesh@example.com',
           phone: '9876543210',
           password: 'Password@123',
           confirmpassword: 'Password@1234',
           role: 'user'
        })
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Password and Confirm Password do not match')
   })
   test('signup fails if password is not strong',async()=>{
      const res = await request(app)
      .post('/users/signup')
      .send({
         name: 'Rajesh',
         email: 'rajesh@example.com',
         phone: '8374831031',
         password: 'password123',
         confirmpassword: 'password123',
         role: 'user'
      })
      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Password must be at least 6 characters long and contain at least one uppercase letter, one number, and one special character')
   })
   test('sign up fails if email structure is invalid',async()=>{
      const res = await request(app) 
      .post('/users/signup')
      .send({
         name:'Rajesh',
         email: 'rajesjexample.com',
         phone: '9876543210',
         password: 'Password@123',
         confirmpassword: 'Password@123',
         role: 'user'
      })
      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Please enter a valid email')
   })
   test('signup fails if phone number is not valid',async()=>{
       const res = await request(app)
       .post('/users/signup')
       .send({
            name:'Rajesh',
            email: 'rajesj@example.com',
            phone: '987654321',
            password: 'Password@123',
            confirmpassword: 'Password@123',
            role: 'user'
       })
       expect(res.status).toBe(400)
       expect(res.body.message).toBe('Please enter a valid phone number')
   })
})
describe('POST /resendotp',()=>{
    beforeEach(()=>{
        jest.clearAllMocks();
    })
    test('resendotp fails if email is not provided',async()=>{
        const res = await request(app)
        .post('/users/resendotp')
        .send({
            email: ''
        })
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Please fill all the field')
    })
    test('resendotp fails if user not found',async()=>{
         UserModel.findOne.mockResolvedValue(null)
         const res = await request(app)
         .post('/users/resendotp')
         .send({
             email: 'test@example.com'
         })
         expect(res.status).toBe(400)
         expect(res.body.message).toBe('User not found')
    })
    test('resendotp fails if user is already verified',async()=>{
         UserModel.findOne.mockResolvedValue({status: 'verified'})
         const res = await request(app)
         .post('/users/resendotp')
         .send({
             email: 'test@example.com'
         })
         expect(res.status).toBe(400)
         expect(res.body.message).toBe('User already verified')
    })
    test('resendotp resends successfully',async()=>{
        const mockUser = {
            status: 'pending',
            name: 'Test User',
            email: 'test@example.com',
            save: jest.fn().mockResolvedValue(true)
        };
        UserModel.findOne.mockResolvedValue(mockUser);
        middle.otpgenerator.mockResolvedValue('123456');
        middle.otpExpires.mockReturnValue(new Date(Date.now() + 5 * 60 * 1000));
        middle.RegEmailTemplate.mockResolvedValue('Email content');
   
        mail.sendmail.mockResolvedValue(true)
        const res = await request(app) 
        .post('/users/resendotp')
        .send({
             email: 'test@example.com'
        })
        expect(res.status).toBe(200)
        expect(res.body.message).toBe('OTP resent successfully')
        expect(mail.sendmail).toHaveBeenCalledWith(
             expect.objectContaining({
                to: 'test@example.com',
                subject: 'Resend OTP',
             })
        )
    })
})
describe('POST /verifyotp',()=>{
    beforeEach(()=>{
        jest.clearAllMocks()
    })
    test('verifyotp fails if email or otp is not provided ',async()=>{
         const res = await request(app)
         .post('/users/verifyotp')
         .send({
             email:'',
             otp: '123456'
         })
         expect(res.status).toBe(400)
         expect(res.body.message).toBe('Please fill all the fields')
    })
    test('verifyotp fails if user not found',async()=>{
        UserModel.findOne.mockResolvedValue(null)
        const res = await request(app)
        .post('/users/verifyotp')
        .send({
            email: 'test@example.com',
            otp: '123456'
        })
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('User not found')
    })
    test('verifyotp fails if otp is expired',async()=>{
        const mockuser = {
            status: 'pending',
            email: 'test@example.com',
            otp: '123456',
            otpExpires: new Date(Date.now() - 1000)
        }
        UserModel.findOne.mockResolvedValue(mockuser)
        const res = await  request(app)
        .post('/users/verifyotp')
        .send({
            email: 'test@example.com',
            otp: '123456'
        })
        expect(res.status).toBe(400)
        expect(res.body.error).toBe('otp is expired')
    })
    test('verifyotp fails if otp is incorrect',async()=>{
        const mockuser = {
            status: 'pending',
            email: 'test@example.com',
            otp: '123456',
            otpExpires: new Date(Date.now() + 5 * 60 * 1000)
        }
        UserModel.findOne.mockResolvedValue(mockuser)
        const res = await request(app)
        .post('/users/verifyotp')
        .send({
            email: 'test@example.com',
            otp: '123457'
        })
        expect(res.status).toBe(400)
        expect(res.body.error).toBe('otp is expired')
    })
    test('verifyotp successfully verifies user',async()=>{
         const mockuser = {
             status: 'pending',
             email: 'test@example.com',
             otp: '123456',
             otpexires: new Date(Date.now() + 5 * 60 * 1000),
             save: jest.fn().mockResolvedValue(true)
         }
         UserModel.findOne.mockResolvedValue(mockuser)
         const res = await request(app)
         .post('/users/verifyotp')
         .send({
            email: 'test@example.com',
            otp: '123456'
         })
         expect(res.status).toBe(200)
         expect(res.body.message).toBe('successfully user otp is verified')
         expect(mockuser.save).toHaveBeenCalled()
    })
})
describe('POST /login',()=>{
    beforeEach(()=>{
        jest.clearAllMocks()
    })
    test('login fails if email or password or confirm password is not provided',async()=>{
         const res = await request(app)
         .post('/users/login')
         .send({
             email: 'test@example.com',
             password: 'Password@123',
             confirmpassword: ''
         })
         expect(res.status).toBe(400)
         expect(res.body.message).toBe('Please fill all the fields')
    })
    test('login fails if password and confirm password do not match',async()=>{
         const res = await request(app)
         .post('/users/login')
         .send({
             email: 'test@example.com',
             password: 'Password@123',
             confirmpassword: 'Password@1234'
         })
         expect(res.status).toBe(400)
         expect(res.body.message).toBe('Password and Confirm Password do not match')
    })
    test('login fails if user not found',async()=>{
        UserModel.findOne.mockResolvedValue(null)
        const res = await request(app)
        .post('/users/login')
        .send({
            email: 'test@example.com',
            password: 'Password@123',
            confirmpassword: 'Password@123'
        })
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('User not found')
    })
    test('login fails if password is incorrect',async()=>{
        const mockuser={
             email: 'test@example.com',
             password: 'password@123',
        }
        UserModel.findOne.mockResolvedValue(mockuser)
        const res = await request(app)
        .post('/users/login')
        .send({
             email: 'test@example.com',
             password: 'Password@123',
             confirmpassword: 'Password@123'
        })
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Invalid credentials')
    })
    test('login successfully logs in user',async()=>{
        const mockuser = {
            _id: 'mockUserId123',
            email: 'test@example.com',
            password: 'hashedPassword123',
            name: 'Test User'
        }
        UserModel.findOne.mockResolvedValue(mockuser)
        bcrypt.compare.mockResolvedValue(true)
        middle.genratetoken.mockResolvedValue('mockJWTToken')
        SessionModel.create.mockResolvedValue({ userid: mockuser._id, jwt: 'mockJWTToken' })
        middle.otpgenerator.mockResolvedValue('123456')
        middle.otpExpires.mockReturnValue(new Date(Date.now() + 5 * 60 * 1000))
        UserModel.findOneAndUpdate.mockResolvedValue({ ...mockuser, loginotp: '123456' })
        mail.sendmail.mockResolvedValue(true)

        const res = await request(app)
        .post('/users/login')
        .send({
            email: 'test@example.com',
            password: 'Password@123',
            confirmpassword: 'Password@123'
        })

        expect(res.status).toBe(200)
        expect(res.body.message).toBe('Login successfully')
        expect(res.body.token).toBe('mockJWTToken')
        expect(bcrypt.compare).toHaveBeenCalledWith('Password@123', 'hashedPassword123')
        expect(middle.genratetoken).toHaveBeenCalledWith({ id: mockuser.email })
        expect(SessionModel.create).toHaveBeenCalledWith({
            userid: mockuser._id,
            jwt: 'mockJWTToken'
        })
        expect(mail.sendmail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: mockuser.email,
                subject: 'Login OTP'
            })
        )
    })
})
describe('GET /getuser',()=>{
    beforeEach(()=>{
        jest.clearAllMocks()
    })
    test('getuser fails if token is not provided',async()=>{
        const res = await request(app)
        .get('/users/getuser')
        expect(res.status).toBe(400)
        expect(res.body.message).toBe("Please fill all the fields")
    })
    test('getuser fails if user not found',async()=>{
        middle.decodetoken.mockResolvedValue('test@example.com')
        const selectMock = jest.fn().mockResolvedValue(null)
        UserModel.findOne = jest.fn().mockReturnValue({ select: selectMock })
        const res = await request(app)
        .get('/users/getuser')
        .set({token: 'mocktoken'})
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('User not found')

    })
    test('getuser successfully retrieves user', async () => {
        middle.decodetoken.mockResolvedValue('test@example.com')
        const mockuser = {
            _id: 'mockUserId123',
            email: 'test@example.com',
            name: 'Test User',
            phone: '8374831031',
            role: 'user'
        }
        const selectmock = jest.fn().mockResolvedValue(mockuser)
        UserModel.findOne = jest.fn().mockReturnValue({ select: selectmock }) 
        const res = await request(app)
            .get('/users/getuser')
            .set({ token: 'mocktoken' })
        expect(res.status).toBe(200)
        expect(res.body.message).toBe('User found successfully')
    })
})
describe('POST /updateprofile',()=>{
    beforeEach(()=>{
        jest.clearAllMocks()
    })
    test('updateproile fails if token is not provided',async()=>{
        const res = await request(app)
        .post('/users/updateprofile')
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Please fill all the fields')
    })
    test('updateprofile fails if user not found',async()=>{
         middle.decodetoken = jest.fn().mockResolvedValue('test@example.com')
         UserModel.findOne = jest.fn().mockResolvedValue(null)
         const res = await request(app) 
         .post('/users/updateprofile')
         .set({ token: 'mocktoken'})
         expect(res.status).toBe(400)
         expect(res.body.message).toBe('User not found')
    })
    test('updateprofile successfully updates user',async()=>{
        middle.decodetoken = jest.fn().mockResolvedValue('test@example.com')
        const mockuser = {
            _id: 'mockUserId123',
            email: 'test@example.com',
            name: 'Test User',
            phone: '8374831031',
            role: 'user'
        }
        UserModel.findOne = jest.fn().mockResolvedValue(mockuser)
        UserModel.findOneAndUpdate = jest.fn().mockResolvedValue({ ...mockuser, name: 'updated name'})
        const res = await request(app)
        .post('/users/updateprofile')
        .set({ token: 'mocktoken'})
        expect(res.status).toBe(200)
        expect(res.body.message).toBe('User updated successfully')
    })
   
}) 
describe('POST /logout',()=>{
    beforeEach(()=>{
        jest.clearAllMocks()
    })
    test('logout fails if token is not provided',async()=>{
         const res = await request(app)
         .post('/users/logout')
         expect(res.status).toBe(400)
         expect(res.body.message).toBe('Please fill all the fields')
    })
    test('logout fails if user not found',async()=>{
        middle.decodetoken = jest.fn().mockResolvedValue('test@example.com')
        UserModel.findOne = jest.fn().mockResolvedValue(null)
        const res = await request(app)
        .post('/users/logout')
        .set({ token: 'mocktoken'})
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('User not found')
    })
    test('logout successfully logs out user',async()=>{
        middle.decodetoken = jest.fn().mockResolvedValue('test@example.com')
        const mockuser = {
            _id: 'mockuserId123',
            email: 'test@example.com',
            name: 'Test User',
            phone: '8374831031',
            role: 'user'
        }
        UserModel.findOne = jest.fn().mockResolvedValue(mockuser)
        SessionModel.findOneAndDelete = jest.fn().mockResolvedValue(true)
        const res = await request(app)
        .post('/users/logout')
        .set({ token: 'mocktoken'})
        expect(res.status).toBe(200)
        expect(res.body.message).toBe('User logged out successfully')
    })
})