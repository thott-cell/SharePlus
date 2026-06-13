import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

interface TransactionProps {
  uid: string;
  type: string;
  amount: number;
  status?: string;
  description?: string;
  phone?: string;
  metadata?: any;
}

export const createTransaction = async ({
  uid,
  type,
  amount,
  status = "success",
  description = "",
  phone = "",
  metadata = {},
}: TransactionProps) => {
  try {
    const ref = await addDoc(
      collection(db, "transactions"),
      {
        uid,
        type,
        amount,
        status,
        description,
        phone,
        metadata,
        createdAt: serverTimestamp(),
      }
    );

    return ref.id;
  } catch (error) {
    console.log(
      "TRANSACTION ENGINE ERROR:",
      error
    );

    throw error;
  }
};