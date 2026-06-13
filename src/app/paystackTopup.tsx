import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";

import { auth } from "../firebase/firebaseConfig";

export default function PaystackTopup() {
  const [checkoutUrl, setCheckoutUrl] = useState("");

  useEffect(() => {
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const response = await fetch(
        "http://10.225.105.225:3000/paystack/init",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            amount: 5000,
          }),
        }
      );

      const data = await response.json();

      setCheckoutUrl(data.authorization_url);
    } catch (error: any) {
  console.log("PAYSTACK ERROR:", error);

  Alert.alert(
    "Payment Error",
    JSON.stringify(error?.message || error)
  );
}
  };

  if (!checkoutUrl) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: checkoutUrl }}
      startInLoadingState={true}
    />
  );
}