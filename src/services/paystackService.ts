import { auth } from "../firebase/firebaseConfig";

const BASE_URL = "https://shareplus-server.onrender.com";

/* =========================
   INIT PAYMENT
========================= */
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
    }),
  });

  const data = await res.json();

  console.log("INIT RESPONSE:", data); // 👈 IMPORTANT DEBUG

  if (!res.ok) {
    throw new Error(data.message || "Init failed");
  }

  return data; // ✅ MUST return directly
};

/* =========================
   VERIFY PAYMENT
========================= */
export const verifyPayment = async (reference: string) => {
  const res = await fetch(
    `${BASE_URL}/paystack/verify/${reference}`
  );

  const data = await res.json();

  console.log("VERIFY RESPONSE:", data); // 👈 IMPORTANT DEBUG

  if (!res.ok) {
    throw new Error(data.message || "Verify failed");
  }

  return data;
};