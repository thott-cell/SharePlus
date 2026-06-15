import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Linking, StyleSheet } from 'react-native';
import axios from 'axios';

// Replace with your actual live Render app URL
const BACKEND_URL = 'https://onrender.com'; 

interface TopupProps {
  user: {
    uid: string;
    email: string;
  };
}

export default function PaystackTopup({ user }: TopupProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const handleTopup = async (amount: number) => {
    setLoading(true);
    try {
      // 1. Initialize payment via your backend /paystack/init route
      const initResponse = await axios.post(`${BACKEND_URL}/paystack/init`, {
        email: user.email,
        amount: amount,
        uid: user.uid,
      });

      const { authorization_url, reference } = initResponse.data;

      if (!authorization_url || !reference) {
        throw new Error('Invalid initialization details received from server.');
      }

      // 2. Launch the Paystack checkout tab
      const canOpen = await Linking.canOpenURL(authorization_url);
      if (canOpen) {
        await Linking.openURL(authorization_url);
        
        // 3. Prompt user to instantly check and verify status manually 
        Alert.alert(
          'Confirm Payment',
          'Please complete the transaction in your browser, then tap verify below.',
          [
            {
              text: 'Verify My Payment',
              onPress: () => verifyPayment(reference),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            }
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Error', 'Unable to open the checkout payment screen.');
      }
    } catch (error: any) {
      console.error('Initialization error:', error);
      const errorMsg = error.response?.data?.message || 'Please check your connection and try again.';
      Alert.alert('Payment Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    setLoading(true);
    try {
      // 4. Hits your custom app.get("/paystack/verify/:reference") backend endpoint
      const verifyResponse = await axios.get(`${BACKEND_URL}/paystack/verify/${reference}`);
      
      if (verifyResponse.data.status === 'success') {
        const updatedBalance = verifyResponse.data.balance;
        Alert.alert('Success 🎉', `Wallet updated! Your new balance is: ₦${updatedBalance}`);
      } else {
        Alert.alert('Pending', 'Payment verification was not successful. Try again.');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      const errorMsg = error.response?.data?.message || 'Could not verify transaction status.';
      Alert.alert('Verification Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={() => handleTopup(5000)} // Hardcoded for ₦5,000 topup
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Top Up ₦5,000</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#09a5db',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    backgroundColor: '#a3d9ee',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
