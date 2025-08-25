// testMail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
   user: "itizashu@gmail.com",        // your Gmail
    pass: "rntyewnzyhnkpqhw",    // <-- replace with 16-char App Password
  },
});

const mailOptions = {
  from: "itiazshu@gmail.com",
  to: "aswanthvenki@gmail.com",            // <-- replace with your other Gmail
  subject: "✅ Test Email",
  text: "This is a test email from Node.js",
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.error("❌ Email error:", error);
  }
  console.log("📩 Test Email sent:", info.response);
});
