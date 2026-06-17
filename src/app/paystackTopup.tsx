import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Linking, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import paystackService from '../services/paystackService'; 

export default function PaystackTopup() {
  const [loading, setLoading] = useState<boolean>(false);
  const { uid, email } = useLocalSearchParams<{ uid: string; email: string }>();

  /**
   * Triggers the payment creation flow
   * @param amountInNaira Face value in Naira (e.g. 5000)
   */
  const handleTopup = async (amountInNaira: number) => {
    if (!uid || !email) {
      Alert.alert('Configuration Error', 'Missing transaction profile context variables.');
      return;
    }

    setLoading(true);
    try {
      // Paystack expects amount in Kobo (Naira * 100)
      const amountInKobo = amountInNaira * 100;

      const { authorization_url, reference } = await paystackService.initializePayment({
        email: email,
        amount: amountInKobo,
        uid: uid,
      });

      if (authorization_url) {
        // Open payment portal in the device's native browser
        const supported = await Linking.canOpenURL(authorization_url);
        if (supported) {
          await Linking.openURL(authorization_url);
          
          // Present action prompt for the user to confirm completion
          Alert.alert(
            'Confirm Payment',
            'Complete your transaction in the browser window, then return here to verify.',
            [{ text: 'Verify My Payment', onPress: () => verifyPayment(reference) }]
          );
        } else {
          Alert.alert('Error', 'Unable to open the payment link on this device.');
        }
      }
    } catch (error: any) {
      Alert.alert('Payment Failed', error.message || 'Could not connect to payment gateway.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hits your backend to verify the transaction reference code
   */
  const verifyPayment = async (reference: string) => {
    setLoading(true);
    try {
      const verifyResponse = await paystackService.verifyPayment(reference);
      
      // Strict verification status check matching Paystack response profiles
      if (verifyResponse.status === 'success' || (verifyResponse as any).data?.status === 'success') {
        Alert.alert('Success 🎉', `Wallet updated! New balance: ₦${verifyResponse.balance.toLocaleString()}`);
      } else {
        Alert.alert('Pending', 'Payment has not been completed yet. Please complete it in your browser.');
      }
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Could not verify transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, loading && styles.disabledButton]} 
        onPress={() => handleTopup(5000)} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Top Up ₦5,000</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#070B1A', 
    padding: 20 
  },
  button: { 
    backgroundColor: '#7C3AED', 
    padding: 15, 
    borderRadius: 15, 
    width: '100%', 
    alignItems: 'center' 
  },
  disabledButton: {
    backgroundColor: '#4C1D95',
    opacity: 0.6
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  }
});
