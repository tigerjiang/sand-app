import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CommunityTab() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 20 }]}
    >
      <Text style={styles.title}>Community</Text>
      <Text style={styles.subtitle}>Connect with other Oasis Control users</Text>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Community</Text>
        <Text style={styles.placeholderSubtext}>Share patterns and connect with others</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F0",
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

