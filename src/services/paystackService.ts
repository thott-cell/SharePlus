import axios from 'axios';

// Ensure there are absolutely no trailing slashes or hidden whitespaces here
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

const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (axios.isAxiosError(error)) {
    // If the server returned an explicit error response, grab it
    const serverMessage = error.response?.data?.message || error.response?.data?.error;
    if (serverMessage) return serverMessage;
    
    // Catch common proxy or network handshake issues
    if (error.code === 'ECONNABORTED') return 'Server took too long to respond. Please try again.';
    if (error.response?.status === 405) {
      return `Network Config Error (405): Make sure the endpoint matches your server setup. Details: ${error.message}`;
    }
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
        { 
          timeout: REQUEST_TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          // This tells axios to throw the real error instead of following a 301/302 mutating redirect
          validateStatus: (status) => status >= 200 && status < 300
        }
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
        { 
          timeout: REQUEST_TIMEOUT,
          headers: {
            'Accept': 'application/json'
          }
        }
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
