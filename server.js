// server.js
const express = require("express");
const fs = require("fs");
const fetch = require("node-fetch"); // install with: npm install node-fetch
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const PAYSTACK_SECRET_KEY = "sk_test_xxxxxxxxxx"; // 👉 Replace with your Paystack secret key

// Endpoint to save payment after verification
app.post("/save-payment", async (req, res) => {
  const { name, email, amount, reference } = req.body;

  try {
    // Verify payment with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    });

    const verifyData = await verifyRes.json();

    if (verifyData.status && verifyData.data.status === "success") {
      // Save to JSON file
      const paymentData = {
        name,
        email,
        amount,
        reference,
        date: new Date().toISOString()
      };

      let payments = [];
      if (fs.existsSync("payments.json")) {
        payments = JSON.parse(fs.readFileSync("payments.json"));
      }

      payments.push(paymentData);
      fs.writeFileSync("payments.json", JSON.stringify(payments, null, 2));

      res.json({ success: true, message: "Payment verified and saved!" });
    } else {
      res.json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
