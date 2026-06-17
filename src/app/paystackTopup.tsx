import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Linking, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import paystackService from '../services/paystackService'; 

export default function PaystackTopup() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  
  // Safe extraction of parameters from Expo Router context
  const params = useLocalSearchParams();
  const uid = typeof params.uid === 'string' ? params.uid : '';
  const email = typeof params.email === 'string' ? params.email : '';

  // 1. Instantly validate parameters on mount to catch setup errors early
  useEffect(() => {
    if (!uid || !email) {
      console.warn("❌ Paystack Popup mounted with missing params:", { uid, email });
      Alert.alert(
        'Profile Error',
        'Your user profile context could not be loaded. Please try again.',
        [{ text: 'Go Back', onPress: () => router.back() }]
      );
    }
  }, [uid, email]);

  /**
   * Triggers the payment creation flow
   */
  const handleTopup = async (amountInNaira: number) => {
    if (!uid || !email) {
      Alert.alert('Error', 'Cannot proceed without profile authentication variables.');
      return;
    }

    setLoading(true);
    try {
      // Convert Naira face value directly to Kobo (Naira * 100)
      const amountInKobo = Math.round(amountInNaira * 100);

      const response = await paystackService.initializePayment({
        email: email.trim(),
        amount: amountInKobo,
        uid: uid.trim(),
      });

      // Secure handling of the initialization response object
      if (response && response.authorization_url) {
        const url = response.authorization_url;
        
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
          
          Alert.alert(
            'Confirm Payment',
            'Complete your transaction in the browser window, then tap below to update your wallet.',
            [
              { 
                text: 'Verify My Payment', 
                onPress: () => verifyPayment(response.reference) 
              }
            ],
            { cancelable: false }
          );
        } else {
          Alert.alert('Browser Error', 'Your device configuration cannot open this payment link.');
        }
      } else {
        throw new Error('Invalid server initialization payload.');
      }
    } catch (error: any) {
      // Safe extraction of the exact backend error text string
      const failureReason = error.response?.data?.error || error.message || 'Initialization failed.';
      Alert.alert('Payment Initialization Failed', failureReason);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Contacts backend to verify the completion reference code
   */
  const verifyPayment = async (reference: string) => {
    if (!reference) return;
    setLoading(true);
    try {
      const verifyResponse = await paystackService.verifyPayment(reference);
      
      if (verifyResponse && (verifyResponse.status === 'success' || (verifyResponse as any).data?.status === 'success')) {
        Alert.alert(
          'Success 🎉', 
          `Wallet updated! New balance: ₦${Number(verifyResponse.balance).toLocaleString()}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Processing', 'Payment authorization is pending or incomplete. Please finish the process.');
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
      <Text style={styles.subText}>Securely credit your account via Paystack gateway infrastructure.</Text>

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
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  disabledButton: {
    backgroundColor: '#4C1D95',
    opacity: 0.5,
    elevation: 0
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  }
});
