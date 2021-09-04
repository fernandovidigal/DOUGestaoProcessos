const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 25,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  logger: true,
  debug: true,
});

exports.enviarEmail = async ({to, subject, text, message}) => {
  try {
    await transporter.sendMail({
      from: `DOU - Gestão de Processos <${process.env.EMAIL}>`, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: message, // html body
    });
    return true;
  } catch (error) {
    return false;
  }
};