const request = require('supertest')
const ServiceModel = require('../server/Models/Service')
const UserModel = require('../server/Models/Users')
const middle = require('../server/Middlewares/middleware')
const express = require('express')
const app = express()
app.use(express.json())


const {addservice,getallservices,getsingleservice,updateservice,deleteservice} = require('../server/Controllers/Service')

const ServiceRouter = express.Router()
ServiceRouter.post('/addservice',addservice)
ServiceRouter.get('/getservices',getallservices)
ServiceRouter.get('/getservice/:serviceid',getsingleservice)
ServiceRouter.put('/updateservice/:serviceid',updateservice)
ServiceRouter.delete('/deleteservice/:serviceid',deleteservice)
app.use('/services',ServiceRouter)

jest.mock('../server/Models/Users')
jest.mock('../server/Models/service')
jest.mock('../server/Middlewares/middleware')

describe('POST /addservice',()=>{
    beforeEach(()=>{
         jest.clearAllMocks()
    })
     test('add service fail if token is not provided',async()=>{
        const res = await request(app)
        .post('/services/addservice')
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Please Provide Token')
     })
     test('add service fail if user is not found', async () => {
        middle.decodetoken = jest.fn().mockResolvedValue('test@example.com');
        UserModel.findOne = jest.fn().mockResolvedValue(null);
    
        const res = await request(app)
            .post('/services/addservice')
            .set({ token: 'mocktoken' })
            .send({
                title: 'Test Service',
                description: 'Test Description',
                category: 'Test Category',
                price: 100,
                duration: '1 hour',
                availableslots: ['9:00 AM', '10:00 AM']
            });
    
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('User Not Found'); // match exactly
    });
    test('add service fail if user role is not provider',async()=>{
        const mockuser = {
             _id: '123',
             role: 'customer',
             email: 'test@example.com',
             name: 'Test User'
        }
         middle.decodetoken = jest.fn().mockResolvedValue('test@example.com')
         UserModel.findOne = jest.fn().mockResolvedValue(mockuser)
         const res = await request(app)
         .post('/services/addservice')
         .set({ token: 'mocktoken'})
         .send({
            title: 'Test Service',
            description: 'Test Description',
            category: 'Test Category',
            price: 100,
            duration: '1 hour',
            availableslots: ['9:00 AM', '10:00 AM']
         })
          expect(res.status).toBe(403)
          expect(res.body.message).toBe('You are unauthorized to add the service. Only admin or provider can add services.')
    })
    test('add service successfully',async()=>{
        middle.decodetoken = jest.fn().mockResolvedValue('test@example.com')
         const mockuser = {
             _id: '123',
             role: 'provider',
             email: 'test@example.com',
             name: 'Test User',
         }
         UserModel.findOne = jest.fn().mockResolvedValue(mockuser)
         ServiceModel.create = jest.fn().mockResolvedValue({
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
         })
         const res = await request(app)
         .post('/services/addservice')
         .set({ token: 'mocktoken'})
         .send({
             title: 'Test Service',
             description: 'Test Description',
             category: 'Test Category',
             price: 100,
             duration: '1 hour',
             availableslots: ['9:00 AM', '10:00 AM']
         })
         expect(res.status).toBe(200)
         expect(res.body.message).toBe('Service Added Successfully')
    })
})
describe('GET /getservices',()=>{
    beforeEach(()=>{
        jest.clearAllMocks()
    })
    test('get all services successfully',async()=>{
         middle.decodetoken = jest.fn().mockResolvedValue('test@example.com')
         const mockuser = {
             _id: '123',
             role: 'provider',
             email: 'test@example.com',
             name: 'Test User',
         }
         UserModel.findOne = jest.fn().mockResolvedValue(mockuser)
         ServiceModel.find = jest.fn().mockResolvedValue([
               {
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
               },
               {
                  _id: 'service456',
                  provider: mockuser._id,
                  title: 'Test Service 2',
                  description: 'Test Description 2',
                  category: 'Test Categeory 2',
                  price: 200,
                  duration: '2 hours',
                  availableslots: ['11:00 AM', '12:00 AM'],
                rating: 0,
                totalreviews: 0,
                isactive: true
               }
         ])
         const res = await request(app)
         .get('/services/getservices')
         .set({ token: 'mocktoken'})
         expect(res.status).toBe(200)
         expect(res.body.message).toBe('Services Found Successfully')
    })
    
})
describe('GET /getservice/:serviceid',()=>{
     beforeEach(()=>{
         jest.clearAllMocks()
     })
     test('get single service successfully',async()=>{
         middle.decodetoken = jest.fn().mockResolvedValue('test@example.com')
         const mockuser = {
             _id: '123',
             role: 'provider',
             email: 'test@example.com',
             name: 'Test User'
         }
         UserModel.findOne = jest.fn().mockResolvedValue(mockuser)
         ServiceModel.findById = jest.fn().mockResolvedValue({
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
         })
         const res = await request(app)
         .get('/services/getservice/service123')
         .set({ token: 'mocktoken'})
         expect(res.status).toBe(200)
         expect(res.body.message).toBe('Service Found Successfully')
     })
})
describe('PUT /updateservice/:serviceid',()=>{
     beforeEach(()=>{
        jest.clearAllMocks()
     })
     test('update service successfully',async()=>{
         middle.decodetoken = jest.fn().mockResolvedValue('test@example.com')
         const mockuser = {
             _id: '123',
             role: 'provider',
             email: 'test@example.com',
             name: 'Test User',
         }
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
         }
         UserModel.findOne = jest.fn().mockResolvedValue(mockuser)
         ServiceModel.findByIdAndUpdate = jest.fn().mockResolvedValue({...mockservice, title: 'Updated Service'})
         const res = await request(app)
         .put('/services/updateservice/service123')
         .set({ token: 'mocktoken'})
         expect(res.status).toBe(200)
         expect(res.body.message).toBe('Service Updated Successfully')
     })
})
describe('DELETE /deleteservice/:serviceid',()=>{
    beforeEach(()=>{
        jest.clearAllMocks()
    })
    test('delete service successfully',async()=>{
         middle.decodetoken = jest.fn().mockResolvedValue('test@example.com')
         const mockuser = {
            _id: '123',
            role: 'provider',
            email: 'test@example.com',
            name: 'Test User',      
         }
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
         }
         UserModel.findOne = jest.fn().mockResolvedValue(mockuser)
         ServiceModel.findByIdAndDelete = jest.fn().mockResolvedValue(true)
         const res = await request(app)
         .delete('/services/deleteservice/service123')
         .set({ token: 'mocktoken'})
         expect(res.status).toBe(200)
         expect(res.body.message).toBe('Service Deleted Successfully')
    })
})