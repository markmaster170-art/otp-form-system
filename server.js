import express from "express";
import bodyParser from "body-parser";
import twilio from "twilio";

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

// ✅ استخدم متغيرات البيئة بدل القيم المباشرة
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsApp = process.env.TWILIO_PHONE_NUMBER;

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
      from: fromWhatsApp, // رقم Twilio من المتغير البيئي
      to: `whatsapp:${userPhone}`, // رقم المستخدم من الطلب
    });

    res.status(200).send("OTP sent");
  } catch (error) {
    console.error("❌ Twilio error:", error.message);
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
