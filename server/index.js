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
   INIT PAYMENT
========================= */
app.post("/paystack/init", async (req, res) => {
  try {
    const { email, amount, uid } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Convert to kobo
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
   VERIFY PAYMENT (FRONTEND FALLBACK)
========================= */
app.get("/paystack/verify/:reference", async (req, res) => {
  try {
    const { reference } = req.params;

    // Verify transaction directly with Paystack API
    const response = await axios.get(
      `https://paystack.co{reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
      }
    );

    const payment = response.data.data;

    if (payment.status !== "success") {
      return res.status(400).json({ message: "Transaction was not successful" });
    }

    const uid = payment.metadata?.uid;
    const amount = payment.amount / 100; // Convert from kobo back to Naira

    if (!uid) {
      return res.status(400).json({ message: "UID missing in metadata" });
    }

    // Process wallet update atomically using a Firestore transaction
    const userRef = db.collection("users").doc(uid);
    
    const result = await db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists) {
        throw new Error("User not found");
      }

      // Check if this transaction reference was already processed to avoid double crediting
      const txRef = db.collection("transactions").doc(reference);
      const txSnap = await transaction.get(txRef);
      
      if (txSnap.exists) {
        return { status: "already_processed", balance: userSnap.data().balance };
      }

      const current = Number(userSnap.data().balance || 0);
      const newBalance = current + amount;

      // Update wallet balance
      transaction.update(userRef, {
        balance: newBalance,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Write transaction history using reference as the document ID
      transaction.set(txRef, {
        uid,
        type: "topup",
        amount,
        reference,
        balanceAfter: newBalance,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { status: "success", balance: newBalance };
    });

    console.log(`✅ WALLET VERIFIED & CREDITED VIA API: ${uid}, New Balance: ${result.balance}`);
    return res.status(200).json({ status: "success", balance: result.balance });

  } catch (err) {
    console.log("VERIFY ERROR:", err.message);
    return res.status(500).json({ message: err.message || "Verification failed" });
  }
});

/* =========================
   WEBHOOK (BACKEND AUTOMATION)
========================= */
app.post("/paystack/webhook", async (req, res) => {
  try {
    console.log("🔥 WEBHOOK HIT RECEIVED");
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
    
    await db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists) {
        console.log("❌ User not found:", uid);
        return;
      }

      const txRef = db.collection("transactions").doc(reference);
      const txSnap = await transaction.get(txRef);

      if (txSnap.exists) {
        console.log("⚠️ Transaction already processed via Verify endpoint.");
        return;
      }

      const current = Number(userSnap.data().balance || 0);
      const newBalance = current + amount;

      transaction.update(userRef, {
        balance: newBalance,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      transaction.set(txRef, {
        uid,
        type: "topup",
        amount,
        reference,
        balanceAfter: newBalance,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("✅ WALLET CREDITED VIA WEBHOOK:", uid, newBalance);
    });

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
