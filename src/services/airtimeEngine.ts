import { doc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

import { debitWallet } from "./walletEngine";

/* ======================================================
   TYPES
====================================================== */

export interface AirtimePurchaseProps {
  uid: string;
  network: "MTN" | "AIRTEL" | "GLO" | "9MOBILE" | string;
  phone: string;
  amount: number;
  description?: string;
}

/* ======================================================
   AIRTIME ENGINE
====================================================== */

export const purchaseAirtime = async ({
  uid,
  network,
  phone,
  amount,
  description,
}: AirtimePurchaseProps) => {
  try {
    if (!uid) throw new Error("User not authenticated");
    if (!phone) throw new Error("Phone number is required");
    if (!amount || amount <= 0) throw new Error("Invalid airtime amount");

    // 1. Debit wallet (this already creates transaction + notification)
    const newBalance = await debitWallet(
      uid,
      amount,
      "airtime",
      description || `Airtime purchase for ${phone}`
    );

    // 2. Save airtime-specific record
    const airtimeRef = await addDoc(collection(db, "airtimePurchases"), {
      uid,
      network,
      phone,
      amount,
      status: "success",
      balanceAfter: newBalance,
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      id: airtimeRef.id,
      balanceAfter: newBalance,
    };
  } catch (error: any) {
    console.log("AIRTIME ENGINE ERROR:", error);
    throw new Error(error.message || "Airtime purchase failed");
  }
};