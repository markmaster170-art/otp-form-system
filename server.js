import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { Vonage } from "@vonage/server-sdk";

const app = express();
app.use(bodyParser.json());

// إعداد المسار الكامل لمجلد المشروع
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// عرض الملفات الثابتة (النموذج)
app.use(express.static(path.join(__dirname, "public")));

// عند فتح الصفحة الرئيسية، يتم عرض index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// تهيئة Vonage باستخدام المفاتيح من بيئة Render
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

let generatedOtp = "";

// إرسال رمز التحقق
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

// التحقق من الرمز
app.post("/verify", (req, res) => {
  if (req.body.otp === generatedOtp) {
    res.status(200).send("Verified");
  } else {
    res.status(400).send("Invalid OTP");
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
