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

// تقديم ملفات الواجهة (public)
app.use(express.static(path.join(__dirname, "public")));

// عرض الصفحة الرئيسية
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// إعداد مفاتيح Vonage من متغيرات البيئة
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

let generatedOtp = "";

// إرسال رمز التحقق
app.post("/submit", async (req, res) => {
  try {
    // تجهيز الرقم والتحقق من صحته
    const userPhone = req.body.phone.replace("+", "").trim();
    if (!userPhone) throw new Error("رقم الهاتف مفقود!");

    generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const from = process.env.VONAGE_VIRTUAL_NUMBER || "VonageOTP";
    const text = `رمز التحقق الخاص بك هو: ${generatedOtp}`;

    console.log("📤 Sending SMS via Vonage...");
    console.log("To:", userPhone, "| From:", from);

    // إرسال الرسالة
    const response = await vonage.sms.send({ to: userPhone, from, text });

    console.log("✅ Vonage SMS response:", JSON.stringify(response, null, 2));

    // التحقق من حالة الإرسال
    if (response.messages[0].status !== "0") {
      const errText = response.messages[0]["error-text"];
      throw new Error(`فشل الإرسال: ${errText}`);
    }

    res.status(200).send("OTP sent");
  } catch (error) {
    console.error("❌ Vonage SMS error:", JSON.stringify(error, null, 2));
    res.status(500).send(error.message || "Error sending OTP");
  }
});

// التحقق من رمز الـ OTP
app.post("/verify", (req, res) => {
  if (req.body.otp === generatedOtp) {
    res.status(200).send("Verified");
  } else {
    res.status(400).send("Invalid OTP");
  }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
