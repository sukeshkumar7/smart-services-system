const bycrpt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.hashedpassword = async(password)=>{
    const salt = 10
    const hashedpassword = await bycrpt.hash(password,salt)
    return hashedpassword
}

exports.otpgenerator = async()=>{
    const otp = Math.floor(100000 + Math.random() * 900000)
    return otp
}  
exports.otpExpires=()=>{
    return Date.now() + 10 * 60 * 1000;
}
exports.RegEmailTemplate = (name, otp) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .email-container {
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                    text-align: center;
                }
                .header {
                    font-size: 20px;
                    font-weight: bold;
                    color: #333;
                }
                .otp-code {
                    font-size: 24px;
                    font-weight: bold;
                    color: #d9534f;
                    margin: 10px 0;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 14px;
                    color: #777;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <p class="header">Hello, ${name}!</p>
                <p>Your Registration OTP for is:</p>
                <p class="otp-code">${otp}</p>
                <p>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
                <p>If you did not request this, please ignore this email.</p>
                <div class="footer">
                    <p>Best Regards,</p>
                    <p><strong>Smart_Service_System</strong></p>
                </div>
            </div>
        </body>
        </html>
    `;
};
exports.genratetoken = async(payload)=>{
    return await jwt.sign(payload,process.env.SECRET_KEY,{
        expiresIn: '1d'
    })
}
exports.loginEmailTemplate = (name, otp) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .email-container {
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                    text-align: center;
                }
                .header {
                    font-size: 20px;
                    font-weight: bold;
                    color: #333;
                }
                .otp-code {
                    font-size: 24px;
                    font-weight: bold;
                    color: #d9534f;
                    margin: 10px 0;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 14px;
                    color: #777;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <p class="header">Hello, ${name}!</p>
                <p>Your Login OTP for is:</p>
                <p class="otp-code">${otp}</p>
                <p>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
                <p>If you did not request this, please ignore this email.</p>
                <div class="footer">
                    <p>Best Regards,</p>
                    <p><strong>Your Company Name</strong></p>
                </div>
            </div>
        </body>
        </html>
    `;
};
exports.decodetoken = async(token)=>{
    const decoded =  jwt.verify(token, process.env.SECRET_KEY);
    return decoded.id
}