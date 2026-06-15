

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Linking, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router'; // Add this import
import paystackService from '../services/paystackService'; 

export default function PaystackTopup() {
  const [loading, setLoading] = useState<boolean>(false);
  
  // Captures the uid and email passed during routing from home screen
  const { uid, email } = useLocalSearchParams<{ uid: string; email: string }>();

  const handleTopup = async (amount: number) => {
    if (!uid || !email) {
      Alert.alert('Error', 'Missing transaction profile context variables.');
      return;
    }

    setLoading(true);
    try {
      const { authorization_url, reference } = await paystackService.initializePayment({
        email: email,
        amount: amount,
        uid: uid,
      });

      if (authorization_url) {
        await Linking.openURL(authorization_url);
        
        Alert.alert(
          'Confirm Payment',
          'Complete transaction in your browser, then tap verify.',
          [{ text: 'Verify My Payment', onPress: () => verifyPayment(reference) }]
        );
      }
    } catch (error: any) {
      Alert.alert('Payment Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    setLoading(true);
    try {
      const verifyResponse = await paystackService.verifyPayment(reference);
      if (verifyResponse.status === 'success') {
        Alert.alert('Success 🎉', `Wallet updated! New balance: ₦${verifyResponse.balance}`);
      }
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => handleTopup(5000)} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Top Up ₦5,000</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#070B1A', padding: 20 },
  button: { backgroundColor: '#09a5db', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
