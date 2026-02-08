import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import DeviceHeader from "../../components/DeviceHeader";
import { useI18n } from "../../contexts/I18nContext";
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
  const { t } = useI18n();

  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalPause, setIntervalPause] = useState(false);
  const [intervalPauseMinutes, setIntervalPauseMinutes] = useState(0);
  const [intervalPauseModalVisible, setIntervalPauseModalVisible] = useState(false);
  const [tempIntervalMinutes, setTempIntervalMinutes] = useState(0);
  const [autoSleep, setAutoSleep] = useState(false);
  const [sleepStartTime, setSleepStartTime] = useState<Date | null>(null);
  const [sleepEndTime, setSleepEndTime] = useState<Date | null>(null);
  const [autoSleepModalVisible, setAutoSleepModalVisible] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [tempSleepStartTime, setTempSleepStartTime] = useState<Date | null>(null);
  const [tempSleepEndTime, setTempSleepEndTime] = useState<Date | null>(null);
  const [brightness, setBrightness] = useState(100);
  // selectedColor 保留用于将来发送蓝牙指令，目前不在 UI 中使用
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [volume, setVolume] = useState(50);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [whiteNoisePickerVisible, setWhiteNoisePickerVisible] = useState(false);

  const backgroundColor = isDark ? "#000000" : "#F5F5F0";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const iconColor = isDark ? "#FFFFFF" : "#000000";
  const activeBgColor = isDark ? "#2C2C2E" : "#E8E8E8";
  // 绘制进度：已绘制 vs 未绘制
  const drawnStrokeColor = "#4CAF50"; // 已绘制 - 绿色
  const undrawnStrokeColor = isDark ? "#3A3A3C" : "#E0E0E0"; // 未绘制 - 灰
  const sliderActiveColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const sliderTrackColor = isDark ? "#5A5A5C" : "#D0D0D0";
  const sliderBgColor = isDark ? "#1C1C1E" : "#FFFFFF";
  const inactiveTextColor = isDark ? "#999" : "#999";

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
    <View style={[styles.container, { backgroundColor }]}>
      <DeviceHeader
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* Pattern Display */}
      <View style={styles.patternContainer}>
        <View style={[styles.patternCircle, styles.patternCircleBorderNone]}>
          <Svg width={200} height={200} viewBox="0 0 1000 1000">
            {/* 圆环边框：未绘制部分为灰色（整圈） */}
            <Circle
              cx={500}
              cy={500}
              r={495}
              fill="none"
              stroke={undrawnStrokeColor}
              strokeWidth={10}
              {...({ pathLength: 100 } as object)}
            />
            {/* 圆环边框：已绘制部分顺时针 progress% 为绿色 */}
            <Circle
              cx={500}
              cy={500}
              r={495}
              fill="none"
              stroke={drawnStrokeColor}
              strokeWidth={10}
              strokeDasharray={`${currentPattern.progress} ${100}`}
              {...({ pathLength: 100 } as object)}
            />
            {/* 图案：未绘制部分用灰色 */}
            <Path
              d={svgPaths[currentItem.svgFile] || svgPaths["01_complex_mandala_rings.svg"]}
              fill="none"
              stroke={undrawnStrokeColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              {...({ pathLength: 100 } as object)}
            />
            {/* 图案：已绘制部分用绿色 */}
            <Path
              d={svgPaths[currentItem.svgFile] || svgPaths["01_complex_mandala_rings.svg"]}
              fill="none"
              stroke={drawnStrokeColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${currentPattern.progress} ${100}`}
              {...({ pathLength: 100 } as object)}
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
          style={[
            styles.featureButton,
            intervalPause && { backgroundColor: activeBgColor },
          ]}
          onPress={() => {
            setTempIntervalMinutes(intervalPauseMinutes);
            setIntervalPauseModalVisible(true);
          }}
        >
          <Ionicons name="pause-circle-outline" size={24} color={iconColor} />
          <Text style={[styles.featureText, { color: textColor }]}>
            {t("intervalPause")}
            {intervalPause && intervalPauseMinutes > 0 && ` (${intervalPauseMinutes} min)`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.featureButton,
            autoSleep && { backgroundColor: activeBgColor },
          ]}
          onPress={() => {
            setTempSleepStartTime(sleepStartTime);
            setTempSleepEndTime(sleepEndTime);
            setAutoSleepModalVisible(true);
          }}
        >
          <Ionicons name="time-outline" size={24} color={iconColor} />
          <Text style={[styles.featureText, { color: textColor }]}>
            {t("autoSleep")}
            {autoSleep && sleepStartTime && sleepEndTime && ` (${String(sleepStartTime.getHours()).padStart(2, "0")}:${String(sleepStartTime.getMinutes()).padStart(2, "0")} - ${String(sleepEndTime.getHours()).padStart(2, "0")}:${String(sleepEndTime.getMinutes()).padStart(2, "0")})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Brightness Control */}
      <View style={styles.brightnessContainer}>
        <Text style={[styles.brightnessLabel, { color: textColor }]}>{t("brightness")}</Text>
        <View style={[styles.brightnessSliderContainer, { backgroundColor: sliderBgColor }]}>
          <Slider
            style={styles.brightnessSlider}
            minimumValue={0}
            maximumValue={100}
            value={brightness}
            onValueChange={setBrightness}
            minimumTrackTintColor={sliderActiveColor}
            maximumTrackTintColor={sliderTrackColor}
            thumbTintColor={sliderActiveColor}
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
          <Text style={[styles.volumeLabel, { color: textColor }]}>{t("volume")}</Text>
          <TouchableOpacity
            style={[
              styles.toggle,
              { backgroundColor: sliderTrackColor },
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
        <View style={[styles.volumeSliderContainer, { backgroundColor: sliderBgColor }]}>
          <Slider
            style={styles.volumeSlider}
            minimumValue={0}
            maximumValue={100}
            value={volume}
            onValueChange={setVolume}
            minimumTrackTintColor={sliderActiveColor}
            maximumTrackTintColor={sliderTrackColor}
            thumbTintColor={sliderActiveColor}
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
              color={musicEnabled ? sliderActiveColor : sliderTrackColor}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Playlist */}
      <View style={styles.playlistContainer}>
        <Text style={[styles.playlistTitle, { color: textColor }]}>{t("playlist")}</Text>
        {playlist.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.playlistItem,
              index === currentIndex && { backgroundColor: activeBgColor },
            ]}
            onPress={() => handlePlaylistItem(index)}
          >
            <View style={styles.playlistItemIcon}>
              <Svg width={128} height={128} viewBox="0 0 1000 1000">
                <Path
                  d={svgPaths[item.svgFile] || svgPaths["01_complex_mandala_rings.svg"]}
                  fill="none"
                  stroke={iconColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <Text
              style={[
                styles.playlistItemText,
                { color: textColor },
              ]}
            >
              {item.title}
            </Text>
            {index === currentIndex && (
              <Ionicons name="play-circle" size={20} color={iconColor} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Color Picker Modal */}
      <ColorPickerScreen
        visible={colorPickerVisible}
        onClose={() => setColorPickerVisible(false)}
        onColorSelect={(color) => {
          setSelectedColor(color);
          // TODO: 发送颜色指令到蓝牙沙盘
          // 例如: bluetoothService.sendColorCommand(color);
        }}
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

      {/* Interval Pause Modal */}
      <Modal
        visible={intervalPauseModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIntervalPauseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: sliderBgColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>{t("intervalPause")}</Text>
            <Text style={[styles.modalValue, { color: textColor }]}>
              {Math.round(tempIntervalMinutes)} min
            </Text>
            <View style={styles.modalSliderContainer}>
              <Slider
                style={styles.modalSlider}
                minimumValue={0}
                maximumValue={59}
                value={tempIntervalMinutes}
                onValueChange={setTempIntervalMinutes}
                step={1}
                minimumTrackTintColor={sliderActiveColor}
                maximumTrackTintColor={sliderTrackColor}
                thumbTintColor={sliderActiveColor}
              />
              <View style={styles.modalSliderLabels}>
                <Text style={[styles.modalSliderLabel, { color: inactiveTextColor }]}>0</Text>
                <Text style={[styles.modalSliderLabel, { color: inactiveTextColor }]}>59</Text>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setIntervalPauseModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: textColor }]}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: activeBgColor }]}
                onPress={() => {
                  setIntervalPauseMinutes(Math.round(tempIntervalMinutes));
                  setIntervalPause(Math.round(tempIntervalMinutes) > 0);
                  setIntervalPauseModalVisible(false);
                }}
              >
                <Text style={[styles.modalButtonText, { color: textColor }]}>{t("confirm")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Auto Sleep Modal */}
      <Modal
        visible={autoSleepModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAutoSleepModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.autoSleepModalContent, { backgroundColor: sliderBgColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>{t("autoSleep")}</Text>
            
            {/* Sleep Start Time */}
            <View style={styles.timePickerSection}>
              <Text style={[styles.timePickerLabel, { color: textColor }]}>{t("sleepStartTime")}</Text>
              <TouchableOpacity
                style={styles.timePickerButton}
                onPress={() => {
                  if (!tempSleepStartTime) {
                    const now = new Date();
                    setTempSleepStartTime(now);
                  }
                  setShowStartTimePicker(true);
                }}
              >
                <Text style={[styles.timePickerValue, { color: textColor }]}>
                  {tempSleepStartTime
                    ? `${String(tempSleepStartTime.getHours()).padStart(2, "0")}:${String(tempSleepStartTime.getMinutes()).padStart(2, "0")}`
                    : "--"}
                </Text>
              </TouchableOpacity>
              {showStartTimePicker && (
                <DateTimePicker
                  value={tempSleepStartTime || new Date()}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedTime) => {
                    setShowStartTimePicker(Platform.OS === "ios");
                    if (selectedTime && event.type !== "dismissed") {
                      setTempSleepStartTime(selectedTime);
                    }
                  }}
                />
              )}
            </View>

            {/* Sleep End Time */}
            <View style={styles.timePickerSection}>
              <Text style={[styles.timePickerLabel, { color: textColor }]}>{t("sleepEndTime")}</Text>
              <TouchableOpacity
                style={styles.timePickerButton}
                onPress={() => {
                  if (!tempSleepEndTime) {
                    const now = new Date();
                    setTempSleepEndTime(now);
                  }
                  setShowEndTimePicker(true);
                }}
              >
                <Text style={[styles.timePickerValue, { color: textColor }]}>
                  {tempSleepEndTime
                    ? `${String(tempSleepEndTime.getHours()).padStart(2, "0")}:${String(tempSleepEndTime.getMinutes()).padStart(2, "0")}`
                    : "--"}
                </Text>
              </TouchableOpacity>
              {showEndTimePicker && (
                <DateTimePicker
                  value={tempSleepEndTime || new Date()}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedTime) => {
                    setShowEndTimePicker(Platform.OS === "ios");
                    if (selectedTime && event.type !== "dismissed") {
                      setTempSleepEndTime(selectedTime);
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setAutoSleepModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: textColor }]}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: activeBgColor }]}
                onPress={() => {
                  if (tempSleepStartTime && tempSleepEndTime) {
                    setSleepStartTime(tempSleepStartTime);
                    setSleepEndTime(tempSleepEndTime);
                    setAutoSleep(true);
                  }
                  setAutoSleepModalVisible(false);
                }}
              >
                <Text style={[styles.modalButtonText, { color: textColor }]}>{t("confirm")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  patternCircleBorderNone: {
    borderWidth: 0,
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
    // Will be set dynamically
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
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
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
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
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
    // Will be set dynamically
  },
  playlistItemIcon: {
    width: 128,
    height: 128,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  playlistItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 24,
  },
  modalValue: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 32,
  },
  modalSliderContainer: {
    width: "100%",
    marginBottom: 32,
  },
  modalSlider: {
    width: "100%",
    height: 40,
  },
  modalSliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  modalSliderLabel: {
    fontSize: 12,
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonCancel: {
    backgroundColor: "transparent",
  },
  modalButtonConfirm: {
    // backgroundColor will be set dynamically
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  autoSleepModalContent: {
    maxWidth: 450,
  },
  timePickerSection: {
    width: "100%",
    marginBottom: 32,
  },
  timePickerLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  timePickerValue: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  timePickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "transparent",
  },
});
