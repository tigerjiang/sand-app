import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "../../contexts/ThemeContext";
import ColorPickerScreen from "../color-picker";
import WhiteNoisePickerScreen from "../white-noise-picker";

// 播放列表数据
const playlist = [
  {
    id: "01",
    svgFile: "01_complex_mandala_rings.svg",
    thrFile: "01_complex_mandala_rings.thr",
    title: "Complex Mandala Rings",
  },
  {
    id: "02",
    svgFile: "02_islamic_star_pattern.svg",
    thrFile: "02_islamic_star_pattern.thr",
    title: "Islamic Star Pattern",
  },
  {
    id: "03",
    svgFile: "03_double_spiral_continuous.svg",
    thrFile: "03_double_spiral_continuous.thr",
    title: "Double Spiral Continuous",
  },
  {
    id: "04",
    svgFile: "04_dragon_curve.svg",
    thrFile: "04_dragon_curve.thr",
    title: "Dragon Curve",
  },
  {
    id: "05",
    svgFile: "05_lotus_mandala_complex.svg",
    thrFile: "05_lotus_mandala_complex.thr",
    title: "Lotus Mandala Complex",
  },
];

// 当前播放的图案（示例）
const currentPattern = {
  svgFile: "01_complex_mandala_rings.svg",
  title: "Ancient Geometry",
  progress: 16,
};

// SVG 路径数据
const svgPaths: Record<string, string> = {
  "01_complex_mandala_rings.svg": "M500 160 C650 220 760 360 760 500 C760 640 650 780 500 840 C350 780 240 640 240 500 C240 360 350 220 500 160 C620 260 620 740 500 840 C380 740 380 260 500 160",
  "02_islamic_star_pattern.svg": "M500 150 L610 390 L870 390 L650 550 L740 820 L500 660 L260 820 L350 550 L130 390 L390 390 Z",
  "03_double_spiral_continuous.svg": "M500 500 C600 450 650 550 550 600 C450 650 350 550 450 450 C600 300 800 500 600 700 C400 900 100 600 300 400",
  "04_dragon_curve.svg": "M200 600 C260 480 340 520 380 460 C420 400 520 420 560 360 C600 300 700 340 740 300 C780 260 820 300 840 340 C780 380 760 440 700 460 C640 480 600 560 540 580 C480 600 420 680 340 660 C280 640 240 620 200 600",
  "05_lotus_mandala_complex.svg": "M500 300 C560 260 640 300 660 360 C620 380 580 420 500 460 C420 420 380 380 340 360 C360 300 440 260 500 300 C580 360 580 540 500 620 C420 540 420 360 500 300",
};

export default function DeviceTab() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalPause, setIntervalPause] = useState(false);
  const [autoSleep, setAutoSleep] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [volume, setVolume] = useState(50);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [whiteNoisePickerVisible, setWhiteNoisePickerVisible] = useState(false);

  const backgroundColor = isDark ? "#000000" : "#000000";
  const textColor = isDark ? "#FFFFFF" : "#FFFFFF";
  const iconColor = isDark ? "#FFFFFF" : "#FFFFFF";

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : playlist.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < playlist.length - 1 ? prev + 1 : 0));
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePlaylistItem = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const currentItem = playlist[currentIndex];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
      ]}
    >
      {/* Pattern Display */}
      <View style={styles.patternContainer}>
        <View style={styles.patternCircle}>
          <Svg width={200} height={200} viewBox="0 0 1000 1000">
            <Path
              d={svgPaths[currentItem.svgFile] || svgPaths["01_complex_mandala_rings.svg"]}
              fill="none"
              stroke={selectedColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <Text style={[styles.progressText, { color: textColor }]}>
          {currentPattern.progress}% - {currentItem.title}
        </Text>
      </View>

      {/* Playback Controls */}
      <View style={styles.playbackControls}>
        <TouchableOpacity onPress={handlePrevious} style={styles.controlButton}>
          <Ionicons name="chevron-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPause} style={styles.playPauseButton}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={32}
            color={iconColor}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
          <Ionicons name="chevron-forward" size={24} color={iconColor} />
        </TouchableOpacity>
      </View>

      {/* Feature Buttons */}
      <View style={styles.featureButtons}>
        <TouchableOpacity
          style={[styles.featureButton, intervalPause && styles.featureButtonActive]}
          onPress={() => setIntervalPause(!intervalPause)}
        >
          <Ionicons name="pause-circle-outline" size={24} color={iconColor} />
          <Text style={[styles.featureText, { color: textColor }]}>间隔暂停</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.featureButton, autoSleep && styles.featureButtonActive]}
          onPress={() => setAutoSleep(!autoSleep)}
        >
          <Ionicons name="time-outline" size={24} color={iconColor} />
          <Text style={[styles.featureText, { color: textColor }]}>自动睡眠</Text>
        </TouchableOpacity>
      </View>

      {/* Brightness Control */}
      <View style={styles.brightnessContainer}>
        <Text style={[styles.brightnessLabel, { color: textColor }]}>亮度</Text>
        <View style={styles.brightnessSliderContainer}>
          <Slider
            style={styles.brightnessSlider}
            minimumValue={0}
            maximumValue={100}
            value={brightness}
            onValueChange={setBrightness}
            minimumTrackTintColor={selectedColor}
            maximumTrackTintColor="#3A3A3C"
            thumbTintColor={selectedColor}
          />
          <TouchableOpacity
            style={styles.colorPickerButton}
            onPress={() => setColorPickerVisible(true)}
          >
            <LinearGradient
              colors={["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.colorGradient}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Volume Control */}
      <View style={styles.volumeContainer}>
        <View style={styles.volumeHeader}>
          <Text style={[styles.volumeLabel, { color: textColor }]}>音量</Text>
          <TouchableOpacity
            style={[
              styles.toggle,
              musicEnabled && styles.toggleActive,
            ]}
            onPress={() => setMusicEnabled(!musicEnabled)}
          >
            <View
              style={[
                styles.toggleThumb,
                musicEnabled && styles.toggleThumbActive,
              ]}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.volumeSliderContainer}>
          <Slider
            style={styles.volumeSlider}
            minimumValue={0}
            maximumValue={100}
            value={volume}
            onValueChange={setVolume}
            minimumTrackTintColor={selectedColor}
            maximumTrackTintColor="#3A3A3C"
            thumbTintColor={selectedColor}
            disabled={!musicEnabled}
          />
          <TouchableOpacity
            style={styles.musicButton}
            onPress={() => setWhiteNoisePickerVisible(true)}
            disabled={!musicEnabled}
          >
            <Ionicons
              name="musical-note"
              size={24}
              color={musicEnabled ? selectedColor : "#3A3A3C"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Playlist */}
      <View style={styles.playlistContainer}>
        <Text style={[styles.playlistTitle, { color: textColor }]}>Playlist</Text>
        {playlist.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.playlistItem,
              index === currentIndex && styles.playlistItemActive,
            ]}
            onPress={() => handlePlaylistItem(index)}
          >
            <View style={styles.playlistItemIcon}>
              <Svg width={40} height={40} viewBox="0 0 1000 1000">
                <Path
                  d={svgPaths[item.svgFile] || svgPaths["01_complex_mandala_rings.svg"]}
                  fill="none"
                  stroke={index === currentIndex ? selectedColor : iconColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <Text
              style={[
                styles.playlistItemText,
                { color: index === currentIndex ? selectedColor : textColor },
              ]}
            >
              {item.title}
            </Text>
            {index === currentIndex && (
              <Ionicons name="play-circle" size={20} color={selectedColor} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Color Picker Modal */}
      <ColorPickerScreen
        visible={colorPickerVisible}
        onClose={() => setColorPickerVisible(false)}
        onColorSelect={(color) => setSelectedColor(color)}
      />

      {/* White Noise Picker Modal */}
      <WhiteNoisePickerScreen
        visible={whiteNoisePickerVisible}
        onClose={() => setWhiteNoisePickerVisible(false)}
        onMusicSelect={(musicName: string) => {
          // 发送命令到 IOT 设备播放音乐
          console.log("Play music:", musicName);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  patternContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  patternCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  playbackControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    gap: 30,
  },
  controlButton: {
    padding: 8,
  },
  playPauseButton: {
    padding: 8,
  },
  featureButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  featureButton: {
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  featureButtonActive: {
    backgroundColor: "#2C2C2E",
  },
  featureText: {
    fontSize: 12,
    marginTop: 4,
  },
  brightnessContainer: {
    marginBottom: 30,
  },
  brightnessLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  brightnessSliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brightnessSlider: {
    flex: 1,
    height: 40,
  },
  colorPickerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  colorGradient: {
    width: "100%",
    height: "100%",
  },
  volumeContainer: {
    marginBottom: 30,
  },
  volumeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  volumeLabel: {
    fontSize: 14,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#3A3A3C",
    padding: 3,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: "#9370DB",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  volumeSliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
  },
  musicButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  playlistContainer: {
    marginTop: 20,
  },
  playlistTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "transparent",
  },
  playlistItemActive: {
    backgroundColor: "#2C2C2E",
  },
  playlistItemIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  playlistItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
});
