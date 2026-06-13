import { auth } from "../firebase/firebaseConfig";

const BASE_URL = "http://10.225.105.221:3000"; // change later

export const initPayment = async (amount: number) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const res = await fetch(`${BASE_URL}/paystack/init`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.email,
      amount,
      uid: user.uid,
    }),
  });

  if (!res.ok) {
    throw new Error("Payment initialization failed");
  }

  return await res.json();
};