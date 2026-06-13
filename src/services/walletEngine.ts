import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/* =========================
   GET BALANCE
========================= */
export const getWalletBalance = async (uid: string) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("User not found");

  return Number(snap.data().balance || 0);
};

/* =========================
   CREDIT WALLET
========================= */
export const creditWallet = async (
  uid: string,
  amount: number,
  reason: string = "credit"
) => {
  if (amount <= 0) throw new Error("Invalid credit amount");

  const userRef = doc(db, "users", uid);

  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("User not found");

  const currentBalance = Number(snap.data().balance || 0);
  const newBalance = currentBalance + amount;

  await updateDoc(userRef, {
    balance: newBalance,
  });

  await addDoc(collection(db, "transactions"), {
    uid,
    type: "credit",
    amount,
    reason,
    balanceAfter: newBalance,
    createdAt: serverTimestamp(),
  });

  return newBalance;
};

/* =========================
   DEBIT WALLET (SAFE)
========================= */
export const debitWallet = async (
  uid: string,
  amount: number,
  type: string,
  reason: string = "debit"
) => {
  if (amount <= 0) throw new Error("Invalid debit amount");

  const userRef = doc(db, "users", uid);

  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("User not found");

  const currentBalance = Number(snap.data().balance || 0);

  if (currentBalance < amount) {
    throw new Error("Insufficient balance");
  }

  const newBalance = currentBalance - amount;

  await updateDoc(userRef, {
    balance: newBalance,
  });

  await addDoc(collection(db, "transactions"), {
    uid,
    type: "debit",
    serviceType: type,
    amount,
    reason,
    balanceAfter: newBalance,
    createdAt: serverTimestamp(),
  });

  return newBalance;
};