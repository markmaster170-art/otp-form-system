import { Vonage } from "@vonage/server-sdk";
import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

let generatedOtp = "";

app.post("/submit", async (req, res) => {
  const userPhone = req.body.phone.replace("+", "").trim();
  generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

  try {
    const from = "VonageOTP";
    const text = `رمز التحقق الخاص بك هو: ${generatedOtp}`;

    const response = await vonage.sms.send({ to: userPhone, from, text });

    console.log("✅ Vonage SMS response:", response);
    res.status(200).send("OTP sent");
  } catch (error) {
    console.error("❌ Vonage SMS error:", error.response?.data || error.message || error);
    res.status(500).send(error.message || "Error sending OTP");
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
