import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";

type PlayMode = "single" | "random" | "sequential";

interface WhiteNoisePickerProps {
  visible: boolean;
  onClose: () => void;
  onMusicSelect: (musicName: string) => void;
}

// 音乐列表
const musicList = [
  "Rain Sounds",
  "Ocean Waves",
  "Forest Ambience",
  "Thunderstorm",
  "Birds Chirping",
  "Wind Through Trees",
  "Crackling Fire",
  "Waterfall",
  "City Rain",
  "Mountain Stream",
  "Desert Wind",
  "Night Crickets",
  "Coffee Shop",
  "Library Ambience",
  "Train Journey",
];

export default function WhiteNoisePickerScreen({
  visible,
  onClose,
  onMusicSelect,
}: WhiteNoisePickerProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [playMode, setPlayMode] = useState<PlayMode>("sequential");
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);

  const backgroundColor = "#000000";
  const textColor = "#FFFFFF";
  const activeColor = "#9370DB";

  const handleMusicSelect = (musicName: string) => {
    setSelectedMusic(musicName);
    // 发送命令到 IOT 设备
    onMusicSelect(musicName);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: textColor }]}>白噪音选择</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Play Mode Section */}
          <View style={styles.playModeSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>播放模式</Text>
            <View style={styles.playModeButtons}>
              <TouchableOpacity
                style={[
                  styles.playModeButton,
                  playMode === "single" && styles.playModeButtonActive,
                  playMode === "single" && { borderColor: activeColor },
                ]}
                onPress={() => setPlayMode("single")}
              >
                <Ionicons
                  name="repeat"
                  size={20}
                  color={playMode === "single" ? activeColor : textColor}
                />
                <Text
                  style={[
                    styles.playModeText,
                    { color: playMode === "single" ? activeColor : textColor },
                  ]}
                >
                  单曲循环
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.playModeButton,
                  playMode === "random" && styles.playModeButtonActive,
                  playMode === "random" && { borderColor: activeColor },
                ]}
                onPress={() => setPlayMode("random")}
              >
                <Ionicons
                  name="shuffle"
                  size={20}
                  color={playMode === "random" ? activeColor : textColor}
                />
                <Text
                  style={[
                    styles.playModeText,
                    { color: playMode === "random" ? activeColor : textColor },
                  ]}
                >
                  随机播放
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.playModeButton,
                  playMode === "sequential" && styles.playModeButtonActive,
                  playMode === "sequential" && { borderColor: activeColor },
                ]}
                onPress={() => setPlayMode("sequential")}
              >
                <Ionicons
                  name="list"
                  size={20}
                  color={playMode === "sequential" ? activeColor : textColor}
                />
                <Text
                  style={[
                    styles.playModeText,
                    { color: playMode === "sequential" ? activeColor : textColor },
                  ]}
                >
                  顺序播放
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Music List Section */}
          <View style={styles.musicListSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>音乐列表</Text>
            {musicList.map((music, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.musicItem,
                  selectedMusic === music && styles.musicItemActive,
                ]}
                onPress={() => handleMusicSelect(music)}
              >
                <View style={styles.musicItemLeft}>
                  <Ionicons
                    name="musical-note"
                    size={20}
                    color={selectedMusic === music ? activeColor : textColor}
                  />
                  <Text
                    style={[
                      styles.musicItemText,
                      {
                        color: selectedMusic === music ? activeColor : textColor,
                      },
                    ]}
                  >
                    {music}
                  </Text>
                </View>
                {selectedMusic === music && (
                  <Ionicons name="checkmark-circle" size={24} color={activeColor} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  playModeSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  playModeButtons: {
    flexDirection: "row",
    gap: 12,
  },
  playModeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3A3A3C",
    backgroundColor: "transparent",
    gap: 8,
  },
  playModeButtonActive: {
    backgroundColor: "#2C2C2E",
  },
  playModeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  musicListSection: {
    marginBottom: 20,
  },
  musicItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "transparent",
  },
  musicItemActive: {
    backgroundColor: "#2C2C2E",
  },
  musicItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  musicItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

