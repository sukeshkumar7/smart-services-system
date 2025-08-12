const express = require('express')
const ServiceRouter = express.Router()
const servicectrl = require('../Controllers/Service')

ServiceRouter.post('/addservice',servicectrl.addservice)
ServiceRouter.get('/getservices',servicectrl.getallservices)
ServiceRouter.get('/getservice/:serviceid',servicectrl.getsingleservice)
ServiceRouter.put('/updateservice/:serviceid',servicectrl.updateservice)
ServiceRouter.delete('/deleteservice/:serviceid',servicectrl.deleteservice)
module.exports = ServiceRouter