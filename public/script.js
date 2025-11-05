document.getElementById("otpForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const phone = document.getElementById("phone").value;

  const data = {
    fullName: document.getElementById("fullName").value,
    nationalId: document.getElementById("nationalId").value,
    salary: document.getElementById("salary").value,
    workSector: document.getElementById("workSector").value,
    email: document.getElementById("email").value,
    phone
  };

  const res = await fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    document.getElementById("formSection").style.display = "none";
    document.getElementById("otpSection").style.display = "block";
  } else {
    alert("حدث خطأ أثناء إرسال الرمز.");
  }
});

document.getElementById("verifyForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const otp = document.getElementById("otp").value;

  const res = await fetch("/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otp }),
  });

  if (res.ok) {
    document.getElementById("otpSection").style.display = "none";
    document.getElementById("successSection").style.display = "block";
  } else {
    alert("رمز التحقق غير صحيح، حاول مرة أخرى.");
  }
});
