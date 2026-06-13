import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { auth, db } from "../firebase/firebaseConfig";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export default function SecurityScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    loadPinStatus();
  }, []);

  const loadPinStatus = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const snap = await getDoc(
        doc(db, "users", user.uid)
      );

      if (snap.exists()) {
        const data = snap.data();
        setHasPin(!!data.transactionPin);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const savePin = async () => {
    try {
      if (newPin.length !== 4) {
        Alert.alert(
          "Error",
          "PIN must be 4 digits"
        );
        return;
      }

      if (newPin !== confirmPin) {
        Alert.alert(
          "Error",
          "PINs do not match"
        );
        return;
      }

      setSaving(true);

      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not found");
      }

      const userRef = doc(
        db,
        "users",
        user.uid
      );

      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        throw new Error("User not found");
      }

      const data = snap.data();

      if (
        data.transactionPin &&
        currentPin !== data.transactionPin
      ) {
        throw new Error(
          "Current PIN is incorrect"
        );
      }

      await updateDoc(userRef, {
        transactionPin: newPin,
      });

      Alert.alert(
        "Success",
        hasPin
          ? "PIN updated successfully"
          : "PIN created successfully"
      );

      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");

      setHasPin(true);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color="#7C3AED"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="white"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Security
        </Text>

        <View style={{ width: 24 }} />
      </View>

      <LinearGradient
        colors={["#7C3AED", "#EC4899"]}
        style={styles.card}
      >
        <Ionicons
          name="shield-checkmark"
          size={50}
          color="white"
        />

        <Text style={styles.cardTitle}>
          Transaction PIN
        </Text>

        <Text style={styles.cardSub}>
          Secure purchases, claims and
          transfers.
        </Text>
      </LinearGradient>

      {hasPin && (
        <>
          <Text style={styles.label}>
            Current PIN
          </Text>

          <TextInput
            style={styles.input}
            secureTextEntry
            keyboardType="numeric"
            maxLength={4}
            value={currentPin}
            onChangeText={setCurrentPin}
            placeholder="****"
            placeholderTextColor="#666"
          />
        </>
      )}

      <Text style={styles.label}>
        New PIN
      </Text>

      <TextInput
        style={styles.input}
        secureTextEntry
        keyboardType="numeric"
        maxLength={4}
        value={newPin}
        onChangeText={setNewPin}
        placeholder="****"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>
        Confirm PIN
      </Text>

      <TextInput
        style={styles.input}
        secureTextEntry
        keyboardType="numeric"
        maxLength={4}
        value={confirmPin}
        onChangeText={setConfirmPin}
        placeholder="****"
        placeholderTextColor="#666"
      />

      <LinearGradient
        colors={["#7C3AED", "#EC4899"]}
        style={styles.button}
      >
        <TouchableOpacity
          style={styles.buttonInner}
          onPress={savePin}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator
              color="white"
            />
          ) : (
            <Text style={styles.buttonText}>
              {hasPin
                ? "Update PIN"
                : "Create PIN"}
            </Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <View style={{ height: 40 }} />
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

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#070B1A",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

  card: {
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
    marginBottom: 25,
  },

  cardTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
  },

  cardSub: {
    color: "#F3E8FF",
    textAlign: "center",
    marginTop: 5,
  },

  label: {
    color: "white",
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    backgroundColor: "#111827",
    color: "white",
    borderRadius: 15,
    padding: 16,
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