import axios from "axios";

const API_KEY = process.env.EXPO_PUBLIC_VTPASS_API_KEY;
const PUBLIC_KEY = process.env.EXPO_PUBLIC_VTPASS_PUBLIC_KEY;
const SECRET_KEY = process.env.EXPO_PUBLIC_VTPASS_SECRET_KEY;

// Base URL (we will adjust if your dashboard shows different one later)
const BASE_URL = "https://sandbox.vtpass.com/api/";

const headers = {
  "Content-Type": "application/json",
  "api-key": API_KEY,
  "public-key": PUBLIC_KEY,
  "secret-key": SECRET_KEY,
};

/**
 * BUY AIRTIME
 */
export const buyAirtime = async (
  phone: string,
  amount: number,
  network: string
) => {
  try {
    const response = await axios.post(
      `${BASE_URL}pay`,
      {
        request_id: Date.now().toString(),
        serviceID: network, // mtn, airtel, glo, 9mobile
        amount,
        phone,
      },
      { headers }
    );

    return response.data;
  } catch (error: any) {
    console.log("Airtime Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * BUY DATA
 */
export const buyData = async (
  phone: string,
  plan: string
) => {
  try {
    const response = await axios.post(
      `${BASE_URL}pay`,
      {
        request_id: Date.now().toString(),
        serviceID: plan,
        billersCode: phone,
        variation_code: plan,
      },
      { headers }
    );

    return response.data;
  } catch (error: any) {
    console.log("Data Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * CHECK TRANSACTION STATUS
 */
export const checkTransaction = async (request_id: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}requery`,
      {
        request_id,
      },
      { headers }
    );

    return response.data;
  } catch (error: any) {
    console.log("Check Error:", error.response?.data || error.message);
    throw error;
  }
};