import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";

import { initPayment, verifyPayment } from "../services/paystackService";

export default function PaystackTopup() {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reference, setReference] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    startPayment();
  }, []);

  const startPayment = async () => {
    try {
      const data = await initPayment(5000);

      if (!data?.authorization_url) {
        throw new Error("Authorization URL missing");
      }

      setUrl(data.authorization_url);
      setReference(data.reference);

      console.log("PAYSTACK INIT OK:", data);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavChange = async (navState: any) => {
    const currentUrl = navState.url;

    // only verify once
    if (verified) return;

    // Paystack success usually contains reference
    if (currentUrl.includes("reference=")) {
      try {
        setVerified(true);

        const refFromUrl = currentUrl.split("reference=")[1];
        const finalRef = refFromUrl || reference;

        if (!finalRef) {
          throw new Error("No payment reference found");
        }

        const res = await verifyPayment(finalRef);

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
      onNavigationStateChange={handleNavChange}
    />
  );
}