import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const router = useRouter();

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
  }: any) => (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
    >
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <Ionicons
            name={icon}
            size={22}
            color="#fff"
          />
        </View>

        <View>
          <Text style={styles.title}>
            {title}
          </Text>

          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color="#9CA3AF"
      />
    </TouchableOpacity>
  );

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
          Settings
        </Text>

        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        <SettingItem
          icon="person-outline"
          title="Account"
          subtitle="Profile information"
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Account settings coming soon"
            )
          }
        />

        <SettingItem
          icon="wallet-outline"
          title="Wallet Settings"
          subtitle="Manage wallet preferences"
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Wallet settings coming soon"
            )
          }
        />

        <SettingItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Manage alerts and updates"
          onPress={() =>
            router.push("/notifications")
          }
        />

        <SettingItem
          icon="shield-checkmark-outline"
          title="Security"
          subtitle="PIN, password and protection"
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Security settings coming soon"
            )
          }
        />

        <SettingItem
          icon="moon-outline"
          title="Appearance"
          subtitle="Theme and display"
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Appearance settings coming soon"
            )
          }
        />

        <SettingItem
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="Contact support team"
          onPress={() =>
            Alert.alert(
              "Support",
              "support@shareplus.com"
            )
          }
        />

        <SettingItem
          icon="information-circle-outline"
          title="About"
          subtitle="App version information"
          onPress={() =>
            Alert.alert(
              "SharePlus",
              "Version 1.0.0"
            )
          }
        />
      </View>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() =>
          Alert.alert(
            "Logout",
            "Logout feature will be connected later"
          )
        }
      >
        <Ionicons
          name="log-out-outline"
          size={22}
          color="#fff"
        />

        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        SharePlus v1.0.0
      </Text>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070B1A",
    paddingTop: 60,
    paddingHorizontal: 20,
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
    backgroundColor: "#111827",
    borderRadius: 20,
    overflow: "hidden",
  },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  subtitle: {
    color: "#9CA3AF",
    marginTop: 3,
    fontSize: 12,
  },

  logoutBtn: {
    backgroundColor: "#EF4444",
    borderRadius: 16,
    padding: 16,
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },

  footer: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 20,
  },
});