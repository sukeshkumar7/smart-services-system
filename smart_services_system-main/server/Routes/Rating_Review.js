const express = require('express')
const ReviewRouter = express.Router() 
const Reviewcntrl = require('../Controllers/Rating_Review')


ReviewRouter.post('/addrating_review/:serviceid',Reviewcntrl.addrating)
ReviewRouter.get('/getreview/:reviewid',Reviewcntrl.getsinglereview)
ReviewRouter.get('/getreviews/:serviceid',Reviewcntrl.getreviewsbyservice)
ReviewRouter.get('/breakdownreviews/:serviceid',Reviewcntrl.getRatingBreakdown)
ReviewRouter.put('/updatereview/:serviceid',Reviewcntrl.updaterating)
ReviewRouter.delete('/deletereview/:serviceid',Reviewcntrl.deleterating)
module.exports = ReviewRouter 