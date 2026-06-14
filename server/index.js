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

    const data = response.data.data;

    return res.json({
      authorization_url: data.authorization_url,
      reference: data.reference,
    });

  } catch (err) {
    console.log("INIT ERROR:", err.response?.data || err.message);

    return res.status(500).json({
      message: "Payment initialization failed",
    });
  }
});

/* =========================
   PAYSTACK WEBHOOK (AUTO CREDIT WALLET)
========================= */
app.post("/paystack/webhook", async (req, res) => {
  try {
    const event = req.body;

    // Always respond quickly to Paystack
    if (!event || event.event !== "charge.success") {
      return res.sendStatus(200);
    }

    const payment = event.data;

    const email = payment.customer.email;
    const amount = payment.amount / 100;
    const reference = payment.reference;

    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      console.log("User not found for email:", email);
      return res.sendStatus(200);
    }

    const userDoc = snapshot.docs[0];
    const userRef = userDoc.ref;

    const currentBalance = Number(userDoc.data().balance || 0);
    const newBalance = currentBalance + amount;

    // Update wallet
    await userRef.update({
      balance: newBalance,
    });

    // Save transaction
    await db.collection("transactions").add({
      uid: userDoc.id,
      email,
      type: "topup",
      amount,
      reference,
      balanceAfter: newBalance,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Wallet credited:", email, amount);

    return res.sendStatus(200);

  } catch (err) {
    console.log("WEBHOOK ERROR:", err.message);
    return res.sendStatus(500);
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});