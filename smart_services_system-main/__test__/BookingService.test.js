const request = require('supertest')
const BookingModel = require('../server/Models/BookingService')
const UserModel = require('../server/Models/Users')
const ServiceModel = require('../server/Models/Service')
const middle = require('../server/Middlewares/middleware')
const CouponModel = require('../server/Models/Coupon')
const mail = require('../server/Utils/NodeMailer') 
const express = require('express')
const app = express()
app.use(express.json())

const { BookService } = require('../server/Controllers/BookingService')
const BookingRouter = express.Router()
BookingRouter.post('/bookservice/', BookService);
BookingRouter.post('/bookservice/:serviceid', BookService);
app.use('/bookings',BookingRouter) 

jest.mock('../server/Models/Users')
jest.mock('../server/Models/BookingService')
jest.mock('../server/Models/Service')
jest.mock('../server/Middlewares/middleware')
jest.mock('../server/Utils/NodeMailer') 

describe('Post /bookservice/:serviceid',()=>{
    beforeEach(()=>{
        jest.clearAllMocks()
    })
    test('Booking fail if token is not provided',async()=>{
        const res = await request(app) 
        .post('/bookings/bookservice/service123')
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Please Provide Token')
    })
    test('Booking fails if service id is not provided', async () => {
        const mockUser = {
            _id: 'user123',
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            isverified: true
        };
    
        middle.decodetoken = jest.fn().mockResolvedValue('test@example.com');
        UserModel.findOne = jest.fn().mockResolvedValue(mockUser);
    
        const res = await request(app)
            .post('/bookings/bookservice/') // Send an empty or invalid serviceid
            .set({ token: 'mocktoken' })
            .send({
                bookingdate: '2025-01-01',
                bookingtime: '9:00 AM'
            });
    
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Please Provide Service ID');
    });
    test('Service Booked Successfully', async () => {
        const mockuser = {
            _id: 'user123',
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            isverified: true
        };
        const mockservice = {
            _id: 'service123',
            provider: mockuser._id,
            title: 'Test Service',
            description: 'Test Description',
            category: 'Test Category',
            price: 100,
            duration: '1 hour',
            availableslots: ['9:00 AM', '10:00 AM'],
            rating: 0,
            totalreviews: 0,
            isactive: true
        };
        const mockbooking = {
            customerid: mockuser._id,
            providerid: mockservice.provider,
            Bookingservices: [
                {
                    serviceid: mockservice._id,
                    bookingdate: '2025-01-01',
                    bookingtime: '9:00 AM',
                    status: 'pending',
                    price: mockservice.price
                }
            ],
            totalprice: mockservice.price
        };
    
        middle.decodetoken = jest.fn().mockResolvedValue('test@example.com');
        UserModel.findOne = jest.fn().mockResolvedValue(mockuser);
        ServiceModel.findById = jest.fn().mockResolvedValue(mockservice);
        BookingModel.findById = jest.fn().mockResolvedValue(null);
        // Mock the save method to return the mockbooking object
        BookingModel.prototype.save = jest.fn().mockImplementation(function () {
            return Promise.resolve(this); // Return the instance itself
        });
        // Mock the constructor to initialize with mockbooking data
        BookingModel.mockImplementation(() => ({
            ...mockbooking,
            save: BookingModel.prototype.save
        }));
        mail.sendmail = jest.fn().mockResolvedValue(true);
    
        const res = await request(app)
            .post('/bookings/bookservice/service123')
            .set({ token: 'mocktoken' })
            .send({
                bookingdate: '2025-01-01',
                bookingtime: '9:00 AM'
            });
    
    
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Service Booked Successfully');
        expect(mail.sendmail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: mockuser.email,
                subject: 'Booking conformation mail',
            })
        );
    });
    
})