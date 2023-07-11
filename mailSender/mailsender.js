const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

require("dotenv").config();

const emailTemplateSource = fs.readFileSync(
  path.join(__dirname, "/template.hbs"),
  "utf8"
);

const mailgunAuth = {
  auth: {
    api_key: API_KEY,
    domain: MAILGUN_DOMAIN,
  },
};

const smtpTransport = nodemailer.createTransport(mg(mailgunAuth));

const template = handlebars.compile(emailTemplateSource);

const sendVerificationEmail = async (email, verificationToken) => {
  const htmlToSend = template({
    message: `localhost:3000/api/users/verify/${verificationToken}`,
  });

  const mailOptions = {
    from: `bombel@sandboxe4ffaf363ecf47a89c7b7c57580df647.mailgun.org`,
    to: "siemankomichal11@gmail.com",
    subject: "Verify your email",
    html: htmlToSend,
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log("Successfully sent email.");
    }
  });
};

module.exports = { sendVerificationEmail };
