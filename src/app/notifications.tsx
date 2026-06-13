import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function NotificationsScreen() {
  const router = useRouter();

  const notifications = [
    {
      id: "1",
      title: "Wallet Funded",
      message: "₦5,000 was added to your wallet.",
      time: "2 mins ago",
      icon: "wallet",
    },
    {
      id: "2",
      title: "Airtime Purchase",
      message: "₦500 airtime sent successfully.",
      time: "1 hour ago",
      icon: "call",
    },
    {
      id: "3",
      title: "Data Purchase",
      message: "1GB purchased successfully.",
      time: "Yesterday",
      icon: "wifi",
    },
    {
      id: "4",
      title: "Claim Giveaway",
      message: "Your giveaway is now active.",
      time: "2 days ago",
      icon: "gift",
    },
  ];

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="white"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Notifications
        </Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((item) => (
          <View
            key={item.id}
            style={styles.notificationCard}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name={item.icon as any}
                size={22}
                color="white"
              />
            </View>

            <View style={styles.content}>
              <Text style={styles.notificationTitle}>
                {item.title}
              </Text>

              <Text style={styles.message}>
                {item.message}
              </Text>

              <Text style={styles.time}>
                {item.time}
              </Text>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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

  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

  notificationCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    marginBottom: 15,
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  content: {
    flex: 1,
  },

  notificationTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  message: {
    color: "#D1D5DB",
    marginTop: 4,
  },

  time: {
    color: "#9CA3AF",
    marginTop: 8,
    fontSize: 12,
  },
});