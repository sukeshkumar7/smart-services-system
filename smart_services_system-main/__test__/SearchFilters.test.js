const request = require('supertest')
const ServiceModel = require('../server/Models/Service')
const express = require('express')
const app = express()
app.use(express.json()) 

const {getproductsbytitle, getproductsbyprice, getservicesbyrating, getservicesbycategory} = require('../server/Controllers/Search_Filters')
const SearchRouter = express.Router()
SearchRouter.get('/getproductbytitle/:title', getproductsbytitle)
SearchRouter.post('/getproductsbyprice', getproductsbyprice)
SearchRouter.get('/sortservicesbyrating', getservicesbyrating)
SearchRouter.get('/getservicesbycategory',getservicesbycategory)
app.use('/filters', SearchRouter)

jest.mock('../server/Models/Service') 

describe('GET /filters/getproductbytitle/:title', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    test('Get products by title', async () => {
        const mockservice = {
            _id: 'service123',
            title: 'Test Service',
            description: 'Test Description',
            category: 'Test Category',
            price: 100,
            duration: '1 hour',
            availableslots: ['9:00 AM', '10:00 AM'],
            rating: 4,
            totalreviews: 10,
            isactive: true
        }
        ServiceModel.find = jest.fn().mockResolvedValue([mockservice])
        const res = await request(app) 
            .get('/filters/getproductbytitle/Test Service')
        expect(res.status).toBe(200)
        expect(res.body.message).toBe('services is found')
    })
})

describe('POST /filters/getproductsbyprice', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('Get products by price', async () => {
        const mockservice = {
            _id: 'service123',
            title: 'Test Service',
            description: 'Test Description',
            category: 'Test Category',
            price: 100,
            duration: '1 hour',
            availableslots: ['9:00 AM', '10:00 AM'],
            rating: 4,
            totalreviews: 10,
            isactive: true
        }

        ServiceModel.find = jest.fn().mockResolvedValue([mockservice])

        const res = await request(app)
            .post('/filters/getproductsbyprice')
            .send({ minprice: 50, maxprice: 150 })
        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.message).toBe('services are filter by the prices')
        expect(res.body.services).toEqual([mockservice])
    })
})

describe('GET /filters/sortservicesbyrating', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('sort services by rating', async () => {
        const mockservice = {
            _id: 'service123',
            title: 'Test Service',
            description: 'Test Description',
            category: 'Test Category',
            price: 100,
            duration: '1 hour',
            availableslots: ['9:00 AM', '10:00 AM'],
            avgrating: 4, // Changed to avgrating to match controller
            totalreviews: 10,
            isactive: true
        }

        ServiceModel.find = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([mockservice])
        })

        const res = await request(app)
            .get('/filters/sortservicesbyrating')
        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.message).toBe('Services are sorted by rating')
        expect(res.body.services).toEqual([mockservice])
    })
})

describe('GET /filters/getservicesbycategory',() => {
     beforeEach(()=>{
         jest.clearAllMocks()
     })
     test('get services by category',async()=>{
         const mockservices = {
            _id: 'service123',
            title: 'Test Service',
            description: 'Test Description',
            category: 'Test Category',
            price: 100,
            duration: '1 hour',
            availableslots: ['9:00 AM', '10:00 AM'],
            avgrating: 4, // Changed to avgrating to match controller
            totalreviews: 10,
            isactive: true
         }
         ServiceModel.find = jest.fn().mockResolvedValue([mockservices])
         const res = await request(app)
         .get('/filters/getservicesbycategory')
         .send({category: 'Test Category'})
         expect(res.status).toBe(200)
         expect(res.body.success).toBe(true)
     })
})