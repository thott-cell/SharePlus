require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

/* =========================
   FIREBASE INIT (SAFE)
========================= */
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("SharePlus Paystack Server Running 🚀");
});

/* =========================
   INIT PAYMENT
========================= */
app.post("/paystack/init", async (req, res) => {
  try {
    const { email, amount } = req.body;

    if (!email || !amount) {
      return res.status(400).json({
        message: "Email and amount required",
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

    return res.json(response.data);
  } catch (err) {
    console.log("INIT ERROR:", err.message);

    return res.status(500).json({
      message: "Payment init failed",
    });
  }
});

/* =========================
   VERIFY + CREDIT WALLET
========================= */
app.get("/paystack/verify/:reference", async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    const payment = response.data.data;

    if (payment.status !== "success") {
      return res.status(400).json({
        message: "Payment not successful",
      });
    }

    const email = payment.customer.email;
    const amount = payment.amount / 100;

    // =========================
    // FIND USER + UPDATE WALLET
    // =========================
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(404).json({
        message: "User not found",
      });
    }

   const doc = snapshot.docs[0];

const userRef = doc.ref;

const userData = await userRef.get();

const current = Number(userData.data().balance || 0);

const newBalance = current + amount;

await userRef.update({
  balance: newBalance,
});

await db.collection("transactions").add({
  uid: userRef.id,
  type: "credit",
  amount,
  reason: "Paystack funding",
  balanceAfter: newBalance,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
});

return res.json({
  message: "Wallet credited successfully",
  amount,
  newBalance,
});
  } catch (err) {
    console.log("VERIFY ERROR:", err.message);

    return res.status(500).json({
      message: "Verification failed",
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