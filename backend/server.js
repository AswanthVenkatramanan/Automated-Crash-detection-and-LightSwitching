// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { SerialPort } = require("serialport");
const nodemailer = require("nodemailer");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // allow all origins
});

// ✅ Open SerialPort (update COM port if needed)
const port = new SerialPort({
  path: "COM6", // <-- update if different
  baudRate: 9600,
});

// ✅ Configure Gmail transporter (App Password required)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "itizashu@gmail.com",        // your Gmail
    pass: "rntyewnzyhnkpqhw",          // Google App Password
  },
});

// ✅ Fixed crash location (change if needed)
const FIXED_LAT = 12.8659531;
const FIXED_LONG = 80.217333;
const FIXED_MAPS_LINK = `https://www.google.com/maps?q=${FIXED_LAT},${FIXED_LONG}`;

// ✅ Cooldown timer (avoid spamming multiple emails)
let lastEmailTime = 0;
const EMAIL_COOLDOWN = 2 * 60 * 1000; // 2 minutes

// ✅ Send backup email (software fallback)
function sendCrashAlert() {
  const now = Date.now();
  if (now - lastEmailTime < EMAIL_COOLDOWN) {
    console.log("⏳ Email not sent (cooldown active)");
    return;
  }

  const mailOptions = {
    from: "itizashu@gmail.com",
    to: "aswanthvenki@gmail.com", // your email (or SMS gateway email)
    subject: "🚨 Crash Detected!",
    text: `Dikssha met with an accident\n\nLocation: ${FIXED_MAPS_LINK}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Email error:", error);
      io.emit("arduino:data", { type: "email", status: "failed" });
    } else {
      console.log("📩 Backup Email sent:", info.response);
      io.emit("arduino:data", { type: "email", status: "sent" });
      lastEmailTime = now;
    }
  });
}

// ✅ Handle Arduino data
port.on("data", (data) => {
  const message = data.toString().trim();
  console.log("📟 Data from Arduino:", message);

  // Crash detected
  if (message.toLowerCase().includes("crash detected")) {
    console.log("🚨 Crash detected, triggering backup email...");
    io.emit("arduino:data", { type: "crash", message, location: FIXED_MAPS_LINK });
    sendCrashAlert();
  }

  // GSM confirms SMS sent
  else if (message.toLowerCase().includes("sos sms sent")) {
    console.log("📲 GSM SMS confirmed");
    io.emit("arduino:data", { type: "gsm", status: "sent" });
  }

  // Forward any other info
  else {
    io.emit("arduino:data", { type: "info", message });
  }
});

// ✅ Frontend connection
io.on("connection", (socket) => {
  console.log("✅ Frontend connected");
  socket.on("disconnect", () => console.log("❌ Frontend disconnected"));
});

// ✅ Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
