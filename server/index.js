require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");


const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   FIREBASE INIT (CLEAN + SAFE)
========================= */
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


const db = admin.firestore();

/* =========================
   PAYSTACK SECRET
========================= */
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET) {
  throw new Error("PAYSTACK_SECRET_KEY missing in environment variables");
}

/* =========================
   SERVER HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("SharePlus API Running 🚀");
});

/* =========================
   INIT PAYMENT
========================= */
app.post("/paystack/init", async (req, res) => {
  try {
    const { email, amount } = req.body;

    console.log("👉 INIT REQUEST:", req.body);
    console.log("👉 PAYSTACK KEY EXISTS:", !!PAYSTACK_SECRET);

    if (!PAYSTACK_SECRET) {
      return res.status(500).json({
        message: "PAYSTACK_SECRET_KEY is missing in environment",
      });
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("👉 PAYSTACK SUCCESS:", response.data);

    return res.json(response.data.data);

  } catch (err) {
    console.log("👉 REAL ERROR:", err.response?.data || err.message);

    return res.status(500).json({
      message: "Payment initialization failed",
      error: err.response?.data || err.message,
    });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});