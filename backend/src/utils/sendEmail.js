const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  const mailUser = process.env.Mail_User || process.env.MAIL_USER;
  const mailPass = process.env.Mail_Pass || process.env.MAIL_PASS;
  const mailHost = process.env.Mail_Host || process.env.MAIL_HOST || "smtp.gmail.com";

  if (!mailUser || !mailPass) {
    throw new Error("Mail_User or Mail_Pass not configured in .env");
  }

  const transporter = nodemailer.createTransport({
    host: mailHost,
    port: 587,
    secure: false,
    auth: {
      user: mailUser,
      pass: mailPass,
    },
  });

  const info = await transporter.sendMail({
    from: `"Magic Mistry" <${mailUser}>`,
    to: email,
    subject: title,
    html: body,
  });

  console.log(`✉️  OTP email sent to ${email} (MessageID: ${info.messageId})`);
  return info;
};

module.exports = mailSender;