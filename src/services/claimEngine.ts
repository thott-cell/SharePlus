import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { debitWallet } from "./walletEngine";

/* ======================================================
   TYPES
====================================================== */

export interface CreateClaimProps {
  uid: string;
  service: "airtime" | "data";
  amount: number;        // amount per winner
  winners: number;       // number of winners
  claimCode: string;
}

export interface CreateClaimResult {
  id: string;
  balanceAfter: number;
  totalCost: number;
}

/* ======================================================
   CLAIM ENGINE
====================================================== */

export const createClaim = async ({
  uid,
  service,
  amount,
  winners,
  claimCode,
}: CreateClaimProps): Promise<CreateClaimResult> => {
  try {
    if (!uid) throw new Error("User not authenticated");
    if (!service) throw new Error("Service is required");
    if (amount <= 0) throw new Error("Invalid amount");
    if (winners <= 0) throw new Error("Invalid winners count");

    const totalCost = amount * winners;

    /**
     * Deduct wallet first
     */
    const balanceAfter = await debitWallet(
      uid,
      totalCost,
      "claim",
      `Giveaway (${service}) - ${claimCode}`
    );

    /**
     * Save claim record
     */
    const claimRef = await addDoc(collection(db, "claims"), {
      uid,
      service,
      amount,
      winners,
      remaining: winners,
      claimCode,
      totalCost,
      status: "active",
      claimedUsers: [],
      createdAt: serverTimestamp(),
    });

    return {
      id: claimRef.id,
      balanceAfter,
      totalCost,
    };
  } catch (error: any) {
    console.log("CLAIM ENGINE ERROR:", error);
    throw new Error(error.message || "Claim creation failed");
  }
};