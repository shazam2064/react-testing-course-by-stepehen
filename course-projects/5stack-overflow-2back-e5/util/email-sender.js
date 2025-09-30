const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

require('dotenv').config();
const sendgridapikey = process.env.SENDGRID_API_KEY;

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: sendgridapikey
    }
}));

module.exports = transporter;