require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* =========================
   FIREBASE INIT
========================= */
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/* =========================
   PAYSTACK KEY
========================= */
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET) {
  throw new Error("Missing PAYSTACK_SECRET_KEY");
}

/* =========================
   TEST ROUTE (IMPORTANT)
========================= */
app.get("/", (req, res) => {
  res.send("Server is LIVE 🚀");
});

/* =========================
   INIT PAYMENT (IMPORTANT FIX)
========================= */
app.post("/paystack/init", async (req, res) => {
  try {
    const { email, amount, uid } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        metadata: {
          uid: uid,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data.data);
  } catch (err) {
    console.log("INIT ERROR:", err.response?.data || err.message);
    res.status(500).json({ message: "Init failed" });
  }
});

/* =========================
   WEBHOOK (FINAL FIXED VERSION)
========================= */
app.post("/paystack/webhook", async (req, res) => {
  try {
    console.log("🔥 WEBHOOK HIT RECEIVED");
    console.log(JSON.stringify(req.body, null, 2));

    const event = req.body;

    if (event.event !== "charge.success") {
      return res.sendStatus(200);
    }

    const payment = event.data;

    const uid = payment.metadata?.uid;
    const amount = payment.amount / 100;
    const reference = payment.reference;

    if (!uid) {
      console.log("❌ UID missing in metadata");
      return res.sendStatus(200);
    }

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      console.log("❌ User not found:", uid);
      return res.sendStatus(200);
    }

    const current = Number(userSnap.data().balance || 0);
    const newBalance = current + amount;

    await userRef.update({
      balance: newBalance,
    });

    await db.collection("transactions").add({
      uid,
      type: "topup",
      amount,
      reference,
      balanceAfter: newBalance,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("✅ WALLET CREDITED:", uid, newBalance);

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
  console.log("Server running on port", PORT);
});