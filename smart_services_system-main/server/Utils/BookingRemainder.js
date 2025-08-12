const corn = require('node-cron')
const BookingModel = require('../Models/BookingService')
const UserModel = require('../Models/Users')
const sendmail = require('../Utils/NodeMailer')


corn.schedule('40 10 * * *', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextDay = new Date(tomorrow);
    nextDay.setDate(nextDay.getDate() + 1);

    try {
        const bookings = await BookingModel.find({
            date: { $gte: tomorrow, $lt: nextDay },
            paymentstatus: 'paid'
        }).populate('customerid'); 

        for (const booking of bookings) {
            const user =await UserModel.findById(booking.customerid);
            await sendmail(
                user.email,
                'Upcoming Booking Remainder',
                `<h3>Hi ${user.name},</h3>
                 <p>This is a reminder for your upcoming service booking on <strong>${booking.date.toDateString()}</strong>.</p>
                 <p>Thank you!</p>`
            );
            console.log(`Reminder sent to: ${user.name}`); 
        }
        console.log('Booking remainders sent.');
    } catch (err) {
        console.log(`Error sending booking remainders: ${err.message}`);
    }
}, {
    timezone: "Asia/kolkata"
});



module.exports = corn