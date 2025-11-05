import express from "express";
import bodyParser from "body-parser";
import twilio from "twilio";

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const accountSid = "AC0452ce9d33fc4fb54ca57b33bd4deb08"; // استبدل بقيمتك من Twilio
const authToken = "7640ee31188aaf902dbfc01bb6209b89";   // استبدل بقيمتك من Twilio
const client = twilio(accountSid, authToken);

let generatedOtp = "";
let userPhone = "";

// إرسال OTP
app.post("/submit", async (req, res) => {
  userPhone = req.body.phone;
  generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

  try {
 await client.messages.create({
  body: `رمز التحقق الخاص بك هو: ${generatedOtp}`,
  from: "whatsapp:+14155238886",
  to: "whatsapp:+966592307185"  // رقمك المسجل
});

    res.status(200).send("OTP sent");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending OTP");
  }
});

// التحقق من OTP
app.post("/verify", (req, res) => {
  if (req.body.otp === generatedOtp) {
    res.status(200).send("Verified");
  } else {
    res.status(400).send("Invalid OTP");
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
