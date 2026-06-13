import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { auth, db } from "../firebase/firebaseConfig";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export default function KycScreen() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] =
    useState("Not Verified");

  const [fullName, setFullName] =
    useState("");

  const [bvn, setBvn] = useState("");
  const [nin, setNin] = useState("");
  const [dob, setDob] = useState("");

  useEffect(() => {
    loadKyc();
  }, []);

  const loadKyc = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const snap = await getDoc(
        doc(db, "users", user.uid)
      );

      if (snap.exists()) {
        const data = snap.data();

        setFullName(data.kycName || "");
        setBvn(data.bvn || "");
        setNin(data.nin || "");
        setDob(data.dob || "");

        if (data.kycVerified) {
          setStatus("Verified");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const submitKyc = async () => {
    try {
      if (
        !fullName ||
        !bvn ||
        !nin ||
        !dob
      ) {
        Alert.alert(
          "Error",
          "Fill all fields"
        );
        return;
      }

      setLoading(true);

      const user = auth.currentUser;

      if (!user) {
        throw new Error(
          "User not found"
        );
      }

      await updateDoc(
        doc(db, "users", user.uid),
        {
          kycName: fullName,
          bvn,
          nin,
          dob,

          kycVerified: false,
          kycSubmittedAt:
            new Date(),
        }
      );

      Alert.alert(
        "Submitted",
        "KYC submitted successfully"
      );

      setStatus("Pending Review");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={
        false
      }
    >
      <Text style={styles.header}>
        KYC Verification
      </Text>

      <LinearGradient
        colors={[
          "#7C3AED",
          "#EC4899",
        ]}
        style={styles.statusCard}
      >
        <Ionicons
          name="shield-checkmark"
          size={50}
          color="white"
        />

        <Text style={styles.statusTitle}>
          Verification Status
        </Text>

        <Text style={styles.statusValue}>
          {status}
        </Text>
      </LinearGradient>

      <Text style={styles.label}>
        Full Name
      </Text>

      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="John Doe"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>
        BVN
      </Text>

      <TextInput
        style={styles.input}
        value={bvn}
        onChangeText={setBvn}
        keyboardType="numeric"
        maxLength={11}
        placeholder="BVN"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>
        NIN
      </Text>

      <TextInput
        style={styles.input}
        value={nin}
        onChangeText={setNin}
        keyboardType="numeric"
        maxLength={11}
        placeholder="NIN"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>
        Date of Birth
      </Text>

      <TextInput
        style={styles.input}
        value={dob}
        onChangeText={setDob}
        placeholder="DD/MM/YYYY"
        placeholderTextColor="#666"
      />

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          Benefits of Verification
        </Text>

        <Text style={styles.infoText}>
          • Higher wallet limits
        </Text>

        <Text style={styles.infoText}>
          • Bulk distribution access
        </Text>

        <Text style={styles.infoText}>
          • Faster withdrawals
        </Text>

        <Text style={styles.infoText}>
          • Increased account security
        </Text>
      </View>

      <LinearGradient
        colors={[
          "#7C3AED",
          "#EC4899",
        ]}
        style={styles.button}
      >
        <TouchableOpacity
          style={styles.buttonInner}
          onPress={submitKyc}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              color="white"
            />
          ) : (
            <Text
              style={styles.buttonText}
            >
              Submit KYC
            </Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <View
        style={{ height: 50 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070B1A",
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  header: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  statusCard: {
    padding: 25,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 25,
  },

  statusTitle: {
    color: "white",
    fontSize: 18,
    marginTop: 10,
  },

  statusValue: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },

  label: {
    color: "white",
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 15,
  },

  input: {
    backgroundColor: "#111827",
    color: "white",
    borderRadius: 15,
    padding: 16,
  },

  infoCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },

  infoTitle: {
    color: "white",
    fontWeight: "bold",
    marginBottom: 12,
    fontSize: 16,
  },

  infoText: {
    color: "#D1D5DB",
    marginBottom: 8,
  },

  button: {
    borderRadius: 18,
    marginTop: 25,
  },

  buttonInner: {
    paddingVertical: 18,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});