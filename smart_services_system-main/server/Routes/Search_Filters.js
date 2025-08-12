const express = require('express')
const FilterRouter = express.Router()
const Filtercntrl = require('../Controllers/Search_Filters')

FilterRouter.get('/gettitleservices/:title',Filtercntrl.getproductsbytitle)
FilterRouter.get('/getproductsbyprice',Filtercntrl.getproductsbyprice)
FilterRouter.get('/sortservicesbyrating',Filtercntrl.getservicesbyrating)
FilterRouter.get('/getservicesbycategory',Filtercntrl.getservicesbycategory)
module.exports = FilterRouter