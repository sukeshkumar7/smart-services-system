const request = require('supertest')
const CouponModel = require('../server/Models/Coupon')
const UserModel = require('../server/Models/Users')
const middle = require('../server/Middlewares/middleware')
const express = require('express')
const app = express()
app.use(express.json()) 

const {addcoupon} = require('../server/Controllers/Coupon')
const CouponRouter = express.Router()
CouponRouter.post('/addcoupon',addcoupon)
app.use('/coupons',CouponRouter)

jest.mock('../server/Models/Coupon')
jest.mock('../server/Models/Users')
jest.mock('../server/Middlewares/middleware')

describe('POST /addcoupon',()=>{
     beforeEach(()=>{
        jest.clearAllMocks()
     })
     test('add coupon successfully',async()=>{
        middle.decodetoken = jest.fn().mockResolvedValue('test@example.com')
        const mockuser = {
            _id: '123',
            role: 'admin',
            email: 'test@example.com',
            name: 'Test User'
        }
        UserModel.findOne = jest.fn().mockResolvedValue(mockuser)
        CouponModel.create = jest.fn().mockResolvedValue({
            _id: 'coupon123',
            code: 'TEST50',
            discounttype: 'percentage',
            discountamount: 50,
            expiredate: '2024-12-31',
            minimumamount: 100
        })
        const res = await request(app)
        .post('/coupons/addcoupon')
        .set({ token: 'mocktoken'})
        .send({
            code: 'TEST50',
            discounttype: 'percentage',
            discountamount: 50,
            expiredate: '2024-12-31',
            minimumamount: 100
        })
        expect(res.status).toBe(200)
        expect(res.body.message).toBe('Coupon is added Successfully')

     })
})