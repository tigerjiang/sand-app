import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";

export default function TabsLayout() {
  const { isDark } = useTheme();

  const tabBarBgColor = isDark ? "#000000" : "#FFFFFF";
  const tabBarBorderColor = isDark ? "#2C2C2E" : "#E0E0E0";
  const tabBarActiveColor = isDark ? "#FFFFFF" : "#2C2C2C";
  const tabBarInactiveColor = isDark ? "#666" : "#999";
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabBarActiveColor,
        tabBarInactiveTintColor: tabBarInactiveColor,
        tabBarStyle: {
          backgroundColor: tabBarBgColor,
          borderTopWidth: 1,
          borderTopColor: tabBarBorderColor,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="device"
        options={{
          title: "Device",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hardware-chip" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="playlist"
        options={{
          title: "Playlist",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="musical-notes" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

