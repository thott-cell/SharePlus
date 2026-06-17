require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const admin = require("firebase-admin");
const fs = require("fs"); // Node built-in file system tool

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* =========================
   FIREBASE INIT (FIXED PATH FOR RENDER)
========================= */
if (!admin.apps.length) {
  // Render saves Secret Files strictly inside the '/etc/secrets/' directory path
  const renderSecretPath = "/etc/secrets/serviceAccountKey.json";
  const localSecretPath = "./serviceAccountKey.json";
  
  let chosenPath = "";

  if (fs.existsSync(renderSecretPath)) {
    chosenPath = renderSecretPath;
    console.log("🔒 Initializing Firebase via Render Secure Secret File path...");
  } else if (fs.existsSync(localSecretPath)) {
    chosenPath = localSecretPath;
    console.log("💻 Initializing Firebase via Local Development File path...");
  } else {
    console.error("❌ CRITICAL ERROR: serviceAccountKey.json could not be found anywhere on this machine!");
    process.exit(1);
  }

  try {
    const serviceAccount = require(chosenPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin successfully initialized and live!");
  } catch (err) {
    console.error("❌ CRITICAL ERROR: Could not parse or execute the credentials file:");
    console.error(err.message);
    process.exit(1);
  }
}

const db = admin.firestore();

/* =========================
   PAYSTACK KEY
========================= */
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET) {
  throw new Error("Missing PAYSTACK_SECRET_KEY");
}

function extractUid(paymentObject) {
  if (paymentObject.metadata?.uid) {
    return paymentObject.metadata.uid;
  }
  if (paymentObject.metadata?.custom_fields) {
    const uidField = paymentObject.metadata.custom_fields.find(f => f.variable_name === 'uid');
    if (uidField) return uidField.value;
  }
  return null;
}

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("Server is LIVE and connected safely! 🚀");
});

/* =========================
   INIT PAYMENT
========================= */
app.post("/paystack/init", async (req, res) => {
  try {
    const { email, amount, uid } = req.body;

    const response = await axios.post(
      "https://paystack.co",
      {
        email,
        amount: amount * 100,
        metadata: {
          uid: uid,
          custom_fields: [
            {
              display_name: "User UID",
              variable_name: "uid",
              value: uid
            }
          ]
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
   VERIFY PAYMENT
========================= */
app.get("/paystack/verify/:reference", async (req, res) => {
  try {
    const { reference } = req.params;

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

    const uid = extractUid(payment);
    const amount = payment.amount / 100;

    if (!uid) {
      return res.status(400).json({ message: "UID missing in metadata" });
    }

    const userRef = db.collection("users").doc(uid);
    
    const result = await db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists) {
        throw new Error("User not found");
      }

      const txRef = db.collection("transactions").doc(reference);
      const txSnap = await transaction.get(txRef);
      
      if (txSnap.exists) {
        return { status: "already_processed", balance: userSnap.data().balance };
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

      return { status: "success", balance: newBalance };
    });

    console.log(`✅ WALLET CREDITED VIA API: ${uid}, Balance: ${result.balance}`);
    return res.status(200).json({ status: "success", balance: result.balance });

  } catch (err) {
    console.log("VERIFY ERROR:", err.message);
    return res.status(500).json({ message: err.message || "Verification failed" });
  }
});

/* =========================
   WEBHOOK
========================= */
app.post("/paystack/webhook", async (req, res) => {
  try {
    console.log("🔥 WEBHOOK HIT RECEIVED");
    const event = req.body;

    if (event.event !== "charge.success") {
      return res.sendStatus(200);
    }

    const payment = event.data;
    const uid = extractUid(payment);
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
        console.log("⚠️ Transaction already processed.");
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
