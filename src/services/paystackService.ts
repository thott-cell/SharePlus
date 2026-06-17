import axios, { AxiosError } from 'axios';

// Render free tier requires a long timeout (60s) to handle server cold starts
const BACKEND_URL = 'https://shareplus-server.onrender.com';
const REQUEST_TIMEOUT = 60000; 

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

/**
 * Extracts a clean error message from Axios responses
 */
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message || error.response?.data?.error;
    if (serverMessage) return serverMessage;
    if (error.code === 'ECONNABORTED') return 'Server took too long to respond. Please try again.';
    return error.message;
  }
  return error instanceof Error ? error.message : defaultMessage;
};

const paystackService = {
  /**
   * Initializes payment transaction with the backend gateway
   */
  initializePayment: async (payload: InitPaymentPayload): Promise<InitPaymentResponse> => {
    try {
      const response = await axios.post<InitPaymentResponse>(
        `${BACKEND_URL}/paystack/init`,
        payload,
        { timeout: REQUEST_TIMEOUT }
      );
      return response.data;
    } catch (error) {
      const cleanError = getErrorMessage(error, 'Failed to initialize payment gateway.');
      console.error('[PaystackService] Init Error:', cleanError);
      throw new Error(cleanError);
    }
  },

  /**
   * Verifies payment status on the backend after transaction completion
   */
  verifyPayment: async (reference: string): Promise<VerifyPaymentResponse> => {
    try {
      const response = await axios.get<VerifyPaymentResponse>(
        `${BACKEND_URL}/paystack/verify/${reference}`,
        { timeout: REQUEST_TIMEOUT }
      );
      return response.data;
    } catch (error) {
      const cleanError = getErrorMessage(error, 'Failed to verify payment transaction.');
      console.error('[PaystackService] Verify Error:', cleanError);
      throw new Error(cleanError);
    }
  },
};

export default paystackService;
