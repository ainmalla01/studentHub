import nodemailer from 'nodemailer';

const transporter= nodemailer.createTransport({
    service:'gamil',
    auth:{
        user:"aionmalla14@gmail.com",
        pass:""
    }
    
})