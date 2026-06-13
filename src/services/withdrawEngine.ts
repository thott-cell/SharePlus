import axios from "axios";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { debitWallet } from "./walletEngine";

const PAYSTACK_SECRET = "sk_test_b7a769098d7b5b943d749df694b508f098e2df3d"; // we will move this later to backend

/* =========================
   CREATE RECIPIENT
========================= */
const createRecipient = async (
  bankCode: string,
  accountNumber: string,
  accountName: string
) => {
  const res = await axios.post(
    "https://api.paystack.co/transferrecipient",
    {
      type: "nuban",
      name: accountName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "NGN",
    },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.data.recipient_code;
};

/* =========================
   INIT TRANSFER
========================= */
const initiateTransfer = async (
  recipient: string,
  amount: number
) => {
  const res = await axios.post(
    "https://api.paystack.co/transfer",
    {
      source: "balance",
      amount: amount * 100, // kobo
      recipient,
      reason: "Wallet Withdrawal",
    },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
};

/* =========================
   MAIN WITHDRAW FUNCTION
========================= */
export const requestWithdrawal = async ({
  uid,
  amount,
  bankCode,
  accountNumber,
  accountName,
}: {
  uid: string;
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}) => {
  if (!uid) throw new Error("Not authenticated");
  if (amount <= 0) throw new Error("Invalid amount");

  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) throw new Error("User not found");

  const balance = Number(snap.data().balance || 0);

  if (balance < amount) {
    throw new Error("Insufficient balance");
  }

  // 1. debit wallet FIRST (lock funds)
  await debitWallet(uid, amount, "withdrawal", "Instant withdrawal");

  // 2. create recipient
  const recipientCode = await createRecipient(
    bankCode,
    accountNumber,
    accountName
  );

  // 3. send money
  const transfer = await initiateTransfer(
    recipientCode,
    amount
  );

  return {
    success: true,
    transfer,
  };
};