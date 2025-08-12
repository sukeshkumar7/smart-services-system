const request = require('supertest')
const BookingModel = require('../server/Models/BookingService')
const UserModel = require('../server/Models/Users')
const ServiceModel = require('../server/Models/Service')
const ReviewModel = require('../server/Models/Rating_Review')
const middle = require('../server/Middlewares/middleware')
const express = require('express')
const app = express()
app.use(express.json()) 


const{addrating} = require('../server/Controllers/Rating_Review')
const ReviewRouter = express.Router()
ReviewRouter.post('/addrating/:serviceid',addrating)
ReviewRouter.post('/addrating/',addrating)
app.use('/ratings',ReviewRouter)


jest.mock('../server/Models/BookingService')
jest.mock('../server/Models/Users')
jest.mock('../server/Models/Service')
jest.mock('../server/Models/Rating_Review')
jest.mock('../server/Middlewares/middleware')

describe('POST /addrating/:serviceid',()=>{
     beforeEach(()=>{
         jest.clearAllMocks()
     })
     test('Rating is failed if token is not provided',async()=>{
         const res = await request(app)
         .post('/ratings/addrating/service123')
         .send({ rating: 4, review: 'Good service' });  
         expect(res.status).toBe(400)
         expect(res.body.message).toBe('Please provide token')
     })
     test('Rating is failed if service id is not provided',async()=>{
        const mockUser = {
            _id: 'user123',
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            isverified: true
        };
        middle.decodetoken = jest.fn().mockResolvedValue('test@example.com')
        UserModel.findOne = jest.fn().mockResolvedValue(mockUser)
        const res = await request(app)
        .post('/ratings/addrating/')
        .set({token: 'mocktoken'})
        .send({rating: 4, review: 'Good service'})
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Please provide seviceid and rating')
     })
     describe('POST /addrating/:serviceid', () => {
        beforeEach(() => {
            jest.clearAllMocks()
        })
    
        test('Rating is added successfully', async () => {
            const mockUser = {
                _id: 'user123',
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                isverified: true
            }
    
            const mockService = {
                _id: 'service123',
                provider: mockUser._id,
                title: 'Test Service',
                price: 100,
                rating: 0,
                totalreviews: 0,
                isactive: true
            }
    
            const mockBooking = {
                _id: 'booking123',
                customerid: mockUser._id,
                providerid: mockService.provider,
                Bookingservices: [
                    {
                        serviceid: mockService._id,
                        bookingdate: '2025-01-01',
                        bookingtime: '9:00 AM',
                        status: 'pending',
                        price: mockService.price
                    }
                ],
                totalprice: mockService.price
            }
    
            const mockReview = {
                bookingid: mockBooking._id,
                serviceid: mockService._id,
                providerid: mockUser._id,
                customerid: mockUser._id,
                rating: 4,
                reviewtext: 'Good service'
            }
    
            // Mock middleware and DB calls
            middle.decodetoken = jest.fn().mockResolvedValue(mockUser.email)
            UserModel.findOne = jest.fn().mockResolvedValue(mockUser)
            ServiceModel.findById = jest.fn().mockResolvedValue(mockService)
            BookingModel.findOne = jest.fn().mockResolvedValue(mockBooking)
            // ReviewModel.findOne = jest.fn().mockResolvedValue(null)
            ReviewModel.find = jest.fn().mockResolvedValue([mockReview])
            ReviewModel.create = jest.fn().mockResolvedValue({
                ...mockReview,
                save: jest.fn().mockResolvedValue(mockReview)
            })
            
    
            const res = await request(app)
                .post('/ratings/addrating/service123')
                .set({ token: 'mocktoken' })
                .send({ rating: 4, reviewtext: 'Good service' })
    
            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toBe('Review added successfully')
            expect(res.body.review).toEqual(mockReview)
        })
    })
})