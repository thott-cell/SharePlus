import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Linking, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import paystackService from '../services/paystackService'; 

export default function PaystackTopup() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  
  // Extract parameters securely from Expo Router search params context
  const params = useLocalSearchParams();
  const uid = typeof params.uid === 'string' ? params.uid : '';
  const email = typeof params.email === 'string' ? params.email : '';

  // Proactively check routing context variables on component mount
  useEffect(() => {
    if (!uid || !email) {
      console.warn("⚠️ PaystackTopup mounted with missing profile parameters:", { uid, email });
    }
  }, [uid, email]);

  /**
   * Triggers the direct checkout payment flow
   * @param amountInNaira Face value in standard Naira currency (e.g. 5000)
   */
  const handleTopup = async (amountInNaira: number) => {
    if (!uid || !email) {
      Alert.alert(
        'Profile Context Error', 
        'Missing user profile variables. Please return to the previous screen and retry.',
        [{ text: 'Go Back', onPress: () => router.back() }]
      );
      return;
    }

    setLoading(true);
    try {
      // Pass the plain amount value. index.js handles the *100 Kobo conversion.
      const response = await paystackService.initializePayment({
        email: email.trim(),
        amount: amountInNaira,
        uid: uid.trim(),
      });

      // Confirm the true API returned a secure checkout gateway link
      if (response && response.authorization_url) {
        const checkoutUrl = response.authorization_url;
        
        const supported = await Linking.canOpenURL(checkoutUrl);
        if (supported) {
          // Opens ONLY the direct checkout screen (Card, Transfer, USSD)
          await Linking.openURL(checkoutUrl);
          
          // Action verification prompt modal display loop
          Alert.alert(
            'Confirm Payment',
            'Complete transaction in your browser, then return here to tap verify.',
            [
              { 
                text: 'Verify My Payment', 
                onPress: () => verifyPayment(response.reference) 
              }
            ],
            { cancelable: false }
          );
        } else {
          Alert.alert('Device Error', 'Your device native browser could not open this payment gateway link.');
        }
      } else {
        throw new Error('Server initialized payment successfully but failed to provide a checkout route.');
      }
    } catch (error: any) {
      // Displays the exact error text straight from index.js catch blocks
      Alert.alert('Payment Initialization Failed', error.message || 'Could not connect to service layer.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Contacts backend endpoint to confirm complete reference verification status code profiles
   */
  const verifyPayment = async (reference: string) => {
    if (!reference) return;
    setLoading(true);
    try {
      const verifyResponse = await paystackService.verifyPayment(reference);
      
      if (verifyResponse && verifyResponse.status === 'success') {
        Alert.alert(
          'Success 🎉', 
          `Wallet updated! New balance: ₦${Number(verifyResponse.balance).toLocaleString()}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Processing', 'Payment has not been completed yet. Please complete it in your browser window.');
      }
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Could not verify transaction reference.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Fund Your Wallet</Text>
      <Text style={styles.subText}>You will be securely routed to Paystack options portal to complete this top-up.</Text>

      <TouchableOpacity 
        style={[styles.button, (loading || !uid) && styles.disabledButton]} 
        onPress={() => handleTopup(5000)} 
        disabled={loading || !uid}
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
    padding: 24 
  },
  titleText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center'
  },
  subText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16
  },
  button: { 
    backgroundColor: '#7C3AED', 
    padding: 16, 
    borderRadius: 15, 
    width: '100%', 
    alignItems: 'center' 
  },
  disabledButton: {
    backgroundColor: '#4C1D95',
    opacity: 0.5
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  }
});
