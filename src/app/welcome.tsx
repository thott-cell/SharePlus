import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#050816", "#0B1220", "#050816"]}
      style={styles.container}
    >
      {/* Glow Circle */}
      <View style={styles.glow} />

      <View style={styles.content}>
        <Text style={styles.brand}>SharePlus</Text>

        <Text style={styles.title}>
          Fast. Secure. Smart {"\n"}Digital Payments
        </Text>

        <Text style={styles.subtitle}>
          Buy airtime, data, pay bills and manage your wallet seamlessly in one place.
        </Text>

        {/* Buttons */}
        <TouchableOpacity
          onPress={() => router.push("/register")}
          style={styles.primaryBtn}
        >
          <Text style={styles.primaryText}>Create Account</Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={styles.secondaryBtn}
        >
          <Text style={styles.secondaryText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
  },

  glow: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#7C3AED",
    opacity: 0.25,
  },

  content: {
    marginTop: 40,
  },

  brand: {
    color: "#7C3AED",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },

  title: {
    color: "white",
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 44,
  },

  subtitle: {
    color: "#9CA3AF",
    fontSize: 15,
    marginTop: 18,
    lineHeight: 22,
  },

  primaryBtn: {
    flexDirection: "row",
    backgroundColor: "#7C3AED",
    padding: 16,
    borderRadius: 14,
    marginTop: 40,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  primaryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryBtn: {
    marginTop: 18,
    padding: 12,
    alignItems: "center",
  },

  secondaryText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
});