import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

interface NotificationProps {
  uid: string;
  title: string;
  message: string;
}

export const createNotification = async ({
  uid,
  title,
  message,
}: NotificationProps) => {
  try {
    await addDoc(
      collection(db, "notifications"),
      {
        uid,
        title,
        message,
        read: false,
        createdAt: serverTimestamp(),
      }
    );
  } catch (error) {
    console.log(
      "NOTIFICATION ENGINE ERROR:",
      error
    );
  }
};