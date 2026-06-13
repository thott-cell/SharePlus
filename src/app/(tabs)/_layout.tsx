import { Tabs } from "expo-router";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "#111827",
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },

        tabBarActiveTintColor: "#7C3AED",
        tabBarInactiveTintColor: "#9CA3AF",

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >

        {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",

          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home"
              size={size}
              color={color}
            />
          ),
        }}
      />
    
      {/* CLAIM */}
      <Tabs.Screen
        name="claim"
        options={{
          title: "Claim",

          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="gift"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* HISTORY */}
      <Tabs.Screen
        name="transactions"
        options={{
          title: "History",

          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name="history"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",

          tabBarIcon: ({ color, size }) => (
            <FontAwesome5
              name="user"
              size={size}
              color={color}
            />
          ),
        }}
      />

      

    </Tabs>
  );
}