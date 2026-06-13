const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");
const admin = require("firebase-admin");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   FIREBASE ADMIN
========================= */

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/* =========================
   PAYSTACK
========================= */

const PAYSTACK_SECRET =
  process.env.PAYSTACK_SECRET;

/* =========================
   TEST ROUTE
========================= */

app.get("/", (req, res) => {
  res.send("SharePlus Backend Running");
});

/* =========================
   INIT PAYMENT
========================= */

app.post(
  "/paystack/init",
  async (req, res) => {
    try {
      const {
        uid,
        email,
        amount,
      } = req.body;

      const response =
        await axios.post(
          "https://api.paystack.co/transaction/initialize",
          {
            email,
            amount: amount * 100,
            metadata: {
              uid,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET}`,
              "Content-Type":
                "application/json",
            },
          }
        );

      return res.json({
        status: true,
        authorization_url:
          response.data.data
            .authorization_url,
        reference:
          response.data.data
            .reference,
      });
    } catch (error) {
      console.log(error.response?.data);

      return res.status(500).json({
        error:
          "Failed to initialize payment",
      });
    }
  }
);

/* =========================
   VERIFY PAYMENT
========================= */

app.get(
  "/paystack/verify/:reference",
  async (req, res) => {
    try {
      const reference =
        req.params.reference;

      const response =
        await axios.get(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET}`,
            },
          }
        );

      const payment =
        response.data.data;

      if (
        payment.status !==
        "success"
      ) {
        return res.status(400).json({
          error:
            "Payment not successful",
        });
      }

      const uid =
        payment.metadata.uid;

      const amount =
        payment.amount / 100;

      const userRef =
        db.collection("users").doc(uid);

      const userSnap =
        await userRef.get();

      if (!userSnap.exists) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      const currentBalance =
        Number(
          userSnap.data().balance || 0
        );

      const newBalance =
        currentBalance + amount;

      await userRef.update({
        balance: newBalance,
      });

      await db
        .collection("transactions")
        .add({
          uid,
          type: "credit",
          amount,
          reason: "wallet funding",
          balanceAfter:
            newBalance,
          reference,
          createdAt:
            admin.firestore.FieldValue.serverTimestamp(),
        });

      return res.json({
        success: true,
        balance: newBalance,
      });
    } catch (error) {
      console.log(
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        error:
          "Verification failed",
      });
    }
  }
);

/* =========================
   START SERVER
========================= */

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});