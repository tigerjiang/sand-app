import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";

// 常用的 Ionicons 图标列表（你可以根据需要添加更多）
const commonIcons = [
  "home", "settings", "person", "people", "musical-notes", "hardware-chip",
  "arrow-back", "arrow-forward", "chevron-forward", "menu", "close",
  "checkmark", "add", "remove", "search", "heart", "star", "share",
  "download", "upload", "trash", "pencil", "eye", "eye-off", "lock-closed",
  "unlock", "notifications", "notifications-off", "mail", "call", "camera",
  "image", "videocam", "mic", "mic-off", "volume-high", "volume-low", "volume-mute",
  "play", "pause", "stop", "skip-forward", "skip-backward", "refresh",
  "wifi", "bluetooth", "battery-full", "battery-half", "battery-dead",
  "sunny", "moon", "cloudy", "rainy", "thunderstorm", "snow",
  "location", "map", "navigate", "compass", "time", "calendar",
  "bookmark", "bookmarks", "folder", "document", "documents", "file-tray",
  "color-palette", "brush", "color-fill", "layers", "grid", "list",
  "information-circle", "help-circle", "warning", "alert-circle", "checkmark-circle",
  "close-circle", "add-circle", "remove-circle", "ellipse", "radio-button-on",
  "radio-button-off", "checkbox", "square", "triangle", "diamond",
];

export default function IconPreviewScreen() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  const backgroundColor = isDark ? "#000000" : "#F5F5F0";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const inputBgColor = isDark ? "#1C1C1E" : "#FFF";
  const placeholderColor = isDark ? "#8E8E93" : "#999";
  const cardBgColor = isDark ? "#1C1C1E" : "#FFF";
  const borderColor = isDark ? "#2C2C2E" : "#E0E0E0";

  // 过滤图标
  const filteredIcons = commonIcons.filter(icon =>
    icon.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Ionicons 预览</Text>
        <Text style={[styles.subtitle, { color: isDark ? "#8E8E93" : "#666" }]}>
          共 {filteredIcons.length} 个图标
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={placeholderColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { backgroundColor: inputBgColor, color: textColor }]}
          placeholder="搜索图标名称..."
          placeholderTextColor={placeholderColor}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={placeholderColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Selected Icon Preview */}
      {selectedIcon && (
        <View style={[styles.selectedContainer, { backgroundColor: cardBgColor, borderColor }]}>
          <Ionicons name={selectedIcon as any} size={60} color={textColor} />
          <Text style={[styles.selectedName, { color: textColor }]}>{selectedIcon}</Text>
          <Text style={[styles.codeText, { color: isDark ? "#8E8E93" : "#666" }]}>
            {`<Ionicons name="${selectedIcon}" size={24} color="#000" />`}
          </Text>
        </View>
      )}

      {/* Icons Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={true}
      >
        {filteredIcons.map((icon) => (
          <TouchableOpacity
            key={icon}
            style={[
              styles.iconCard,
              {
                backgroundColor: cardBgColor,
                borderColor: selectedIcon === icon ? (isDark ? "#0A84FF" : "#4A90E2") : borderColor,
                borderWidth: selectedIcon === icon ? 2 : 1,
              },
            ]}
            onPress={() => setSelectedIcon(icon)}
          >
            <Ionicons name={icon as any} size={32} color={textColor} />
            <Text style={[styles.iconName, { color: textColor }]} numberOfLines={1}>
              {icon}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#1C1C1E",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  selectedContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  selectedName: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 12,
    fontFamily: "monospace",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  iconCard: {
    width: "30%",
    aspectRatio: 1,
    margin: "1.5%",
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  iconName: {
    fontSize: 10,
    marginTop: 8,
    textAlign: "center",
  },
});
