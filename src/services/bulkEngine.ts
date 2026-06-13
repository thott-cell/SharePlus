import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { debitWallet } from "./walletEngine";

/* ============================
   TYPES
============================ */

export interface BulkTransactionProps {
  uid: string;
  service: "airtime" | "data";
  recipients: string[];
  amountPerPerson: number;
}

/* ============================
   BULK ENGINE
============================ */

export const sendBulk = async ({
  uid,
  service,
  recipients,
  amountPerPerson,
}: BulkTransactionProps) => {
  try {
    if (!uid) throw new Error("User not authenticated");
    if (!recipients.length) throw new Error("No recipients found");
    if (amountPerPerson <= 0) throw new Error("Invalid amount");

    const totalCost = recipients.length * amountPerPerson;

    // 1. debit wallet
    await debitWallet(
      uid,
      totalCost,
      "bulk",
      `Bulk ${service} to ${recipients.length} users`
    );

    // 2. save bulk transaction
    const ref = await addDoc(collection(db, "bulkTransactions"), {
      uid,
      service,
      recipients,
      amountPerPerson,
      totalRecipients: recipients.length,
      totalCost,
      status: "success",
      createdAt: serverTimestamp(),
    });

    // 3. also log in transactions (optional but good)
    await addDoc(collection(db, "transactions"), {
      uid,
      type: "bulk",
      service,
      amount: totalCost,
      recipients: recipients.length,
      status: "success",
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      id: ref.id,
      balanceAfter: "updated", // optional placeholder if walletEngine returns value
    };
  } catch (error: any) {
    console.log("BULK ENGINE ERROR:", error);
    throw new Error(error.message || "Bulk send failed");
  }
};