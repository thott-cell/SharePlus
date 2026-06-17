import axios from 'axios';

const BACKEND_URL = 'https://shareplus-server.onrender.com';
const TIMEOUT_LIMIT = 60000; // 60-second limit to handle server cold-starts

export interface InitPaymentPayload {
  email: string;
  amount: number; // Passed as face-value Naira (e.g. 5000), backend converts to Kobo
  uid: string;
}

export interface InitPaymentResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface VerifyPaymentResponse {
  status: string;
  balance: number;
}

const paystackService = {
  /**
   * 1. Initialize payment with the Node.js backend
   */
  initializePayment: async (payload: InitPaymentPayload): Promise<InitPaymentResponse> => {
    try {
      const response = await axios.post<InitPaymentResponse>(
        `${BACKEND_URL}/paystack/init`,
        payload,
        { timeout: TIMEOUT_LIMIT }
      );
      return response.data;
    } catch (error: any) {
      const fallbackMsg = error.response?.data?.error || error.response?.data?.message || error.message;
      console.error('paystackService.initializePayment Error:', fallbackMsg);
      throw new Error(fallbackMsg || 'Failed to initialize payment gateway.');
    }
  },

  /**
   * 2. Verify payment with the Node.js backend after completion
   */
  verifyPayment: async (reference: string): Promise<VerifyPaymentResponse> => {
    try {
      const response = await axios.get<VerifyPaymentResponse>(
        `${BACKEND_URL}/paystack/verify/${reference}`,
        { timeout: TIMEOUT_LIMIT }
      );
      return response.data;
    } catch (error: any) {
      const fallbackMsg = error.response?.data?.message || error.message;
      console.error('paystackService.verifyPayment Error:', fallbackMsg);
      throw new Error(fallbackMsg || 'Failed to verify payment transaction.');
    }
  },
};

export default paystackService;
