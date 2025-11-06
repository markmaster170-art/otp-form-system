import express from "express";
import bodyParser from "body-parser";
import { Vonage } from "@vonage/server-sdk";

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

console.log("🔍 Checking Vonage environment variables...");
console.log("VONAGE_API_KEY:", process.env.VONAGE_API_KEY ? process.env.VONAGE_API_KEY.slice(0, 6) + "..." : "❌ Not found");
console.log("VONAGE_API_SECRET:", process.env.VONAGE_API_SECRET ? "✅ Found" : "❌ Not found");

let generatedOtp = "";
let userPhone = "";

app.post("/submit", async (req, res) => {
  userPhone = req.body.phone;
  generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

  const from = "Verify";
  const to = userPhone;
  const text = `رمز التحقق الخاص بك هو: ${generatedOtp}`;

  try {
    const response = await vonage.sms.send({ to, from, text });
    console.log("✅ Vonage SMS sent:", response);
    res.status(200).send("OTP sent successfully");
  } catch (error) {
    console.error("❌ Vonage SMS error:", error);
    res.status(500).send("Error sending OTP");
  }
});

app.post("/verify", (req, res) => {
  if (req.body.otp === generatedOtp) {
    res.status(200).send("Verified ✅");
  } else {
    res.status(400).send("Invalid OTP ❌");
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
