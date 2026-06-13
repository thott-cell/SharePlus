import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOHTJlisxngswCvlVfqvGySO8UTbXOK-g",
  authDomain: "shareplus-22263.firebaseapp.com",
  projectId: "shareplus-22263",
  storageBucket: "shareplus-22263.firebasestorage.app",
  messagingSenderId: "216194676243",
  appId: "1:216194676243:web:8407174a793138bd93b1e6",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export default app;