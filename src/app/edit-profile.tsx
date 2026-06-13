import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
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

export default function EditProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();

        setFullName(data.fullName || data.name || "");
        setUsername(data.username || "");
        setPhone(data.phone || "");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      if (!fullName.trim()) {
        Alert.alert(
          "Error",
          "Full name is required"
        );
        return;
      }

      setSaving(true);

      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not found");
      }

      await updateDoc(
        doc(db, "users", user.uid),
        {
          fullName: fullName.trim(),
          username: username.trim(),
          phone: phone.trim(),
          updatedAt: new Date(),
        }
      );

      Alert.alert(
        "Success",
        "Profile updated successfully"
      );

      router.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
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
      {/* HEADER */}
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
          Edit Profile
        </Text>

        <View style={{ width: 24 }} />
      </View>

      {/* PROFILE CARD */}
      <LinearGradient
        colors={["#7C3AED", "#EC4899"]}
        style={styles.profileCard}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {fullName
              ? fullName.charAt(0).toUpperCase()
              : "U"}
          </Text>
        </View>

        <Text style={styles.profileName}>
          {fullName || "User"}
        </Text>

        <Text style={styles.profileSub}>
          Manage your account details
        </Text>
      </LinearGradient>

      {/* FORM */}
      <Text style={styles.label}>
        Full Name
      </Text>

      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="John Doe"
        placeholderTextColor="#6B7280"
      />

      <Text style={styles.label}>
        Username
      </Text>

      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="johndoe"
        placeholderTextColor="#6B7280"
      />

      <Text style={styles.label}>
        Phone Number
      </Text>

      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="08012345678"
        placeholderTextColor="#6B7280"
      />

      <LinearGradient
        colors={["#7C3AED", "#EC4899"]}
        style={styles.saveButton}
      >
        <TouchableOpacity
          style={styles.saveButtonInner}
          onPress={saveProfile}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator
              color="white"
            />
          ) : (
            <Text style={styles.saveText}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <View style={{ height: 50 }} />
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

  loaderContainer: {
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

  profileCard: {
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
    marginBottom: 30,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
  },

  profileName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
  },

  profileSub: {
    color: "#F3E8FF",
    marginTop: 5,
  },

  label: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 15,
  },

  input: {
    backgroundColor: "#111827",
    color: "white",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },

  saveButton: {
    borderRadius: 18,
    marginTop: 30,
  },

  saveButtonInner: {
    paddingVertical: 18,
    alignItems: "center",
  },

  saveText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
  },
});