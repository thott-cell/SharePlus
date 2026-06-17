import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
// Import the fixed api connection layer
import paystackService from '../services/paystackService'; 

export default function PaystackTopup() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const { uid, email } = useLocalSearchParams<{ uid: string; email: string }>();

  /**
   * Dispatches the topup request to generate the real, checkout card overlay window
   */
  const handleDirectTopup = async (amountInNaira: number) => {
    if (!uid || !email) {
      Alert.alert('Error', 'User authentication profile parameters are missing.');
      return;
    }

    setLoading(true);
    try {
      // Paystack expects amount parameters in Kobo (Naira * 100)
      const amountInKobo = amountInNaira * 100;

      // Contact your backend server to get the REAL payment window link
      const response = await paystackService.initializePayment({
        email: email,
        amount: amountInKobo,
        uid: uid,
      });

      // Confirm we have a clean checkout link generated before opening the browser
      if (response && response.authorization_url) {
        const targetCheckoutUrl = response.authorization_url;

        const supported = await Linking.canOpenURL(targetCheckoutUrl);
        if (supported) {
          // This opens ONLY the direct transaction payment panel (Card, Transfer, USSD)
          await Linking.openURL(targetCheckoutUrl);
          
          Alert.alert(
            'Confirm Payment',
            'Complete your transaction in the browser window, then return here to verify.',
            [{ text: 'Verify My Payment', onPress: () => verifyPayment(response.reference) }]
          );
        } else {
          Alert.alert('Browser Error', 'Cannot launch browser gateway on this device.');
        }
      } else {
        Alert.alert('Payment Error', 'Failed to retrieve a valid authorization checkout link.');
      }
    } catch (error: any) {
      Alert.alert('Payment Initialization Failed', error.message || 'Could not connect to payment gateway.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hits your backend server to process balance updates
   */
  const verifyPayment = async (reference: string) => {
    setLoading(true);
    try {
      const verifyResponse = await paystackService.verifyPayment(reference);
      if (verifyResponse.status === 'success') {
        Alert.alert(
          'Success 🎉', 
          `Wallet updated! New balance: ₦${verifyResponse.balance.toLocaleString()}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Pending', 'Payment has not been completed yet. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Could not verify transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Fund Your Wallet</Text>
      <Text style={styles.subText}>You will be redirected securely to complete this ₦5,000 transaction.</Text>

      <TouchableOpacity 
        style={[styles.button, loading && styles.disabledButton]} 
        onPress={() => handleDirectTopup(5000)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Proceed to Payment</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#070B1A', padding: 24 },
  titleText: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subText: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginBottom: 32, paddingHorizontal: 16 },
  button: { backgroundColor: '#7C3AED', padding: 16, borderRadius: 15, width: '100%', alignItems: 'center' },
  disabledButton: { backgroundColor: '#4C1D95', opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
