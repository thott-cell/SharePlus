import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

import { debitWallet } from "./walletEngine";

/* ======================================================
   TYPES
====================================================== */

export interface DataPurchaseProps {
  uid: string;
  network: "MTN" | "AIRTEL" | "GLO" | "9MOBILE" | string;
  phone: string;
  plan: string; // e.g. "1GB - 1 Day", "2GB - 7 Days"
  amount: number;
  description?: string;
}

/* ======================================================
   DATA ENGINE
====================================================== */

export const purchaseData = async ({
  uid,
  network,
  phone,
  plan,
  amount,
  description,
}: DataPurchaseProps) => {
  try {
    if (!uid) throw new Error("User not authenticated");
    if (!phone) throw new Error("Phone number is required");
    if (!plan) throw new Error("Data plan is required");
    if (!amount || amount <= 0) throw new Error("Invalid data amount");

    // 1. Debit wallet (handles transaction + notification internally)
    const newBalance = await debitWallet(
      uid,
      amount,
      "data",
      description || `Data purchase: ${plan} for ${phone}`
    );

    // 2. Save data-specific record
    const dataRef = await addDoc(collection(db, "dataPurchases"), {
      uid,
      network,
      phone,
      plan,
      amount,
      status: "success",
      balanceAfter: newBalance,
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      id: dataRef.id,
      balanceAfter: newBalance,
    };
  } catch (error: any) {
    console.log("DATA ENGINE ERROR:", error);
    throw new Error(error.message || "Data purchase failed");
  }
};