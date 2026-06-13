import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
} from "@expo/vector-icons";

export default function SupportScreen() {
  const openWhatsApp = () => {
    Linking.openURL(
      "https://wa.me/2347033250416"
    );
  };

  const sendEmail = () => {
    Linking.openURL(
      "mailto:support@shareplus.com"
    );
  };

  const callSupport = () => {
    Linking.openURL(
      "tel:+2347033250416"
    );
  };

  const reportIssue = () => {
    Alert.alert(
      "Report Issue",
      "Report transaction feature coming soon."
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>
        Help & Support
      </Text>

      <LinearGradient
        colors={["#7C3AED", "#EC4899"]}
        style={styles.heroCard}
      >
        <Ionicons
          name="headset"
          size={60}
          color="white"
        />

        <Text style={styles.heroTitle}>
          Need Help?
        </Text>

        <Text style={styles.heroText}>
          Our support team is always
          available to assist you.
        </Text>
      </LinearGradient>

      <TouchableOpacity
        style={styles.card}
        onPress={openWhatsApp}
      >
        <View style={styles.iconBox}>
          <FontAwesome
            name="whatsapp"
            size={24}
            color="#25D366"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            WhatsApp Support
          </Text>

          <Text style={styles.subtitle}>
            Chat with our support team
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={22}
          color="#9CA3AF"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={sendEmail}
      >
        <View style={styles.iconBox}>
          <MaterialIcons
            name="email"
            size={24}
            color="#60A5FA"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            Email Support
          </Text>

          <Text style={styles.subtitle}>
            support@shareplus.com
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={22}
          color="#9CA3AF"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={callSupport}
      >
        <View style={styles.iconBox}>
          <Ionicons
            name="call"
            size={24}
            color="#10B981"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            Call Support
          </Text>

          <Text style={styles.subtitle}>
            24/7 customer service
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={22}
          color="#9CA3AF"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={reportIssue}
      >
        <View style={styles.iconBox}>
          <MaterialIcons
            name="report-problem"
            size={24}
            color="#F59E0B"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            Report Transaction
          </Text>

          <Text style={styles.subtitle}>
            Report failed or pending
            transactions
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={22}
          color="#9CA3AF"
        />
      </TouchableOpacity>

      <View style={styles.faqCard}>
        <Text style={styles.faqTitle}>
          Frequently Asked Questions
        </Text>

        <Text style={styles.faqQuestion}>
          • How do I fund my wallet?
        </Text>

        <Text style={styles.faqQuestion}>
          • Why is my transaction pending?
        </Text>

        <Text style={styles.faqQuestion}>
          • How do I redeem a claim?
        </Text>

        <Text style={styles.faqQuestion}>
          • How do I create bulk transfers?
        </Text>

        <Text style={styles.faqQuestion}>
          • How do I verify my account?
        </Text>
      </View>

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

  header: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  heroCard: {
    padding: 25,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 25,
  },

  heroTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
  },

  heroText: {
    color: "#F3E8FF",
    marginTop: 10,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flex: 1,
    marginLeft: 15,
  },

  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#9CA3AF",
    marginTop: 5,
  },

  faqCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
  },

  faqTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  faqQuestion: {
    color: "#D1D5DB",
    marginBottom: 12,
    lineHeight: 22,
  },
});