const nodemailer = require("nodemailer");
const mailConfig = require("../../config/mail.js");

class MailService {
  async send(message) {
    const trasnporter = nodemailer.createTransport(mailConfig);

    return trasnporter.sendMail(message);
  }
}

module.exports = new MailService();
