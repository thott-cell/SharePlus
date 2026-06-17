import axios from 'axios';

// Replace with your actual live Render app URL
const BACKEND_URL = 'https://shareplus-server.onrender.com';

export interface InitPaymentPayload {
  email: string;
  amount: number;
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
   * Hits: POST /paystack/init
   */
  initializePayment: async (payload: InitPaymentPayload): Promise<InitPaymentResponse> => {
    try {
      const response = await axios.post<InitPaymentResponse>(
        `${BACKEND_URL}/paystack/init`,
        payload
      );
      return response.data;
    } catch (error: any) {
      console.error('paystackService.initializePayment Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initialize payment gateway.');
    }
  },

  /**
   * 2. Verify payment with the Node.js backend after completion
   * Hits: GET /paystack/verify/:reference
   */
  verifyPayment: async (reference: string): Promise<VerifyPaymentResponse> => {
    try {
      const response = await axios.get<VerifyPaymentResponse>(
        `${BACKEND_URL}/paystack/verify/${reference}`
      );
      return response.data;
    } catch (error: any) {
      console.error('paystackService.verifyPayment Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to verify payment transaction.');
    }
  },
};

export default paystackService;
