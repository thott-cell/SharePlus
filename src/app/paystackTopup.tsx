import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Paste your permanent Paystack Dashboard link here
const PAYSTACK_PAYMENT_PAGE_URL = 'https://paystack.com'; 

export default function PaystackTopup() {
  const router = useRouter();
  const { uid, email } = useLocalSearchParams<{ uid: string; email: string }>();

  // Open the page directly when they press top up
  const handleDirectTopup = async () => {
    if (!uid || !email) {
      Alert.alert('Error', 'User authentication profile parameters are missing.');
      return;
    }

    // Append customer email as a query parameter so they don't have to retype it on Paystack
    const finalCheckoutUrl = `${PAYSTACK_PAYMENT_PAGE_URL}?email=${encodeURIComponent(email)}`;

    try {
      const supported = await Linking.canOpenURL(finalCheckoutUrl);
      if (supported) {
        // This opens the browser straight to the secure Paystack site
        await Linking.openURL(finalCheckoutUrl);
      } else {
        Alert.alert('Browser Error', 'Cannot launch browser gateway.');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to redirect to Paystack website.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Fund Your Wallet</Text>
      <Text style={styles.subText}>You will be redirected securely to Paystack to complete this transaction.</Text>

      <TouchableOpacity style={styles.button} onPress={handleDirectTopup}>
        <Text style={styles.buttonText}>Proceed to Paystack</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#070B1A', padding: 24 },
  titleText: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subText: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginBottom: 32, paddingHorizontal: 16 },
  button: { backgroundColor: '#7C3AED', padding: 16, borderRadius: 15, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
