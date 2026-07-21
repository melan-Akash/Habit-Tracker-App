const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Habit Tracker'} <${emailUser || 'noreply@habittracker.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);
  console.log('✉️ Email sent: %s', info.messageId);
};

module.exports = sendEmail;
