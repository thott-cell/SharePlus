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
app.use(express.urlencoded({ extended: true }));

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
   INIT PAYMENT
========================= */
app.post("/paystack/init", async (req, res) => {
  try {
    const { email, amount, uid } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        metadata: { uid },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json(response.data.data);
  } catch (err) {
    console.log("INIT ERROR:", err.response?.data || err.message);
    return res.status(500).json({ message: "Init failed" });
  }
});

/* =========================
   WEBHOOK ONLY (REAL CREDIT SYSTEM)
========================= */
app.post("/paystack/webhook", async (req, res) => {
  try {
    console.log("🔥 WEBHOOK RECEIVED");

    const event = req.body;

    if (event.event !== "charge.success") {
      return res.sendStatus(200);
    }

    const payment = event.data;
    const uid = payment.metadata?.uid;
    const amount = payment.amount / 100;
    const reference = payment.reference;

    if (!uid) {
      console.log("❌ UID missing");
      return res.sendStatus(200);
    }

    const userRef = db.collection("users").doc(uid);
    const txRef = db.collection("transactions").doc(reference);

    await db.runTransaction(async (t) => {
      const userSnap = await t.get(userRef);
      const txSnap = await t.get(txRef);

      if (!userSnap.exists) return;

      if (txSnap.exists) {
        console.log("⚠️ Already processed");
        return;
      }

      const current = Number(userSnap.data().balance || 0);
      const newBalance = current + amount;

      t.update(userRef, {
        balance: newBalance,
      });

      t.set(txRef, {
        uid,
        amount,
        reference,
        type: "topup",
        balanceAfter: newBalance,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("✅ CREDITED:", uid, newBalance);
    });

    return res.sendStatus(200);
  } catch (err) {
    console.log("WEBHOOK ERROR:", err.message);
    return res.sendStatus(500);
  }
});

/* =========================
   SERVER START
========================= */
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running 🚀");
});