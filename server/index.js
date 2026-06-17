require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const admin = require("firebase-admin");
const fs = require("fs"); 

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
if (!admin.apps.length) {
  const renderSecretPath = "/etc/secrets/serviceAccountKey.json";
  const localSecretPath = "./serviceAccountKey.json";
  let chosenPath = "";

  if (fs.existsSync(renderSecretPath)) {
    chosenPath = renderSecretPath;
    console.log("🔒 Initializing Firebase via Render Path...");
  } else if (fs.existsSync(localSecretPath)) {
    chosenPath = localSecretPath;
    console.log("💻 Initializing Firebase via Local Path...");
  } else {
    console.error("❌ CRITICAL ERROR: serviceAccountKey.json missing!");
    process.exit(1);
  }

  try {
    const serviceAccount = require(chosenPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin successfully initialized!");
  } catch (err) {
    console.error("❌ CRITICAL ERROR: Could not parse firebase json:", err.message);
    process.exit(1);
  }
}

const db = admin.firestore();

/* =========================
   PAYSTACK KEY CHECK
========================= */
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
if (!PAYSTACK_SECRET) {
  console.error("❌ CRITICAL SETUP ERROR: PAYSTACK_SECRET_KEY is undefined inside environment setups!");
}

function extractUid(paymentObject) {
  if (paymentObject.metadata?.uid) return paymentObject.metadata.uid;
  if (paymentObject.metadata?.custom_fields) {
    const uidField = paymentObject.metadata.custom_fields.find(f => f.variable_name === 'uid');
    if (uidField) return uidField.value;
  }
  return null;
}

/* =========================
   INIT PAYMENT (GUARANTEES CARD/USSD OVERLAY ONLY)
========================= */
app.post("/paystack/init", async (req, res) => {
  try {
    const { email, amount, uid } = req.body;

    // Strict structure checks to avoid passing incomplete payloads to Paystack
    if (!email || !amount || !uid) {
      return res.status(400).json({ 
        success: false, 
        message: `Incomplete parameters. Received Email: ${email}, Amount: ${amount}, UID: ${uid}` 
      });
    }

    // Direct endpoint connection string 
    const response = await axios.post(
      "https://paystack.co",
      {
        email: email.trim(),
        amount: Math.round(amount), // Passed directly in Kobo units from your UI screen
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
          Authorization: `Bearer ${PAYSTACK_SECRET.trim()}`,
          "Content-Type": "application/json",
        },
      }
    );

    // CRUCIAL SAFETY RULE: Ensure authorization_url exists before responding
    if (response.data && response.data.data && response.data.data.authorization_url) {
      return res.json(response.data.data);
    } else {
      throw new Error("Paystack did not return a valid checkout gateway link window URL.");
    }

  } catch (err) {
    // Surface the actual validation breakdown message to your console logs
    const detailedMessage = err.response?.data?.message || err.message;
    console.error("❌ PAYSTACK GATEWAY REJECTION ENGINE LOG:", err.response?.data || err.message);
    
    return res.status(400).json({ 
      success: false, 
      message: "Could not initialize checkout form.", 
      debugReason: detailedMessage 
    });
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
      return res.status(400).json({ message: "Transaction incomplete" });
    }

    const uid = extractUid(payment);
    const amount = payment.amount / 100;

    if (!uid) {
      return res.status(400).json({ message: "UID parameter missing in metadata properties" });
    }

    const userRef = db.collection("users").doc(uid);
    const result = await db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists) throw new Error("User record target doc not found");

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

    return res.status(200).json({ status: "success", balance: result.balance });

  } catch (err) {
    console.error("VERIFY FAULT:", err.message);
    return res.status(500).json({ message: err.message || "Verification routine failed" });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running smoothly on port", PORT);
});
