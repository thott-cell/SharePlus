import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { initPayment, verifyPayment } from "../services/paystackService";

export default function PaystackTopup() {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    startPayment();
  }, []);

  const startPayment = async () => {
    try {
      const res = await initPayment(5000);

      console.log("PAYSTACK INIT:", res);

      setUrl(res.data.authorization_url); // 👈 IMPORTANT FIX
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavChange = async (navState: any) => {
    const currentUrl = navState.url;

    console.log("WEBVIEW URL:", currentUrl);

    if (currentUrl.includes("reference=") && !verified) {
      try {
        setVerified(true);

        const reference = currentUrl.split("reference=")[1];

        const res = await verifyPayment(reference);

        Alert.alert(
          "Success",
          `Wallet credited: ₦${res.amount}`
        );
      } catch (err: any) {
        Alert.alert("Error", err.message);
      }
    }
  };

  if (loading || !url) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: url }}
      startInLoadingState={true}
      onNavigationStateChange={handleNavChange}
    />
  );
}