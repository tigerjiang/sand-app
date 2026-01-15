import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import {
    Dimensions,
    Modal,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const COLOR_WHEEL_SIZE = Math.min(SCREEN_WIDTH - 80, 300);
const COLOR_SQUARE_SIZE = COLOR_WHEEL_SIZE * 0.4;

// 预设实色
const solidColors = [
  "#FFFFFF", // 白色
  "#87CEEB", // 浅蓝色
  "#40E0D0", // 青色
  "#ADFF2F", // 浅黄绿色
  "#FF7F50", // 珊瑚色
];

// 预设渐变
const gradientPresets = [
  { colors: ["#FFB6C1", "#FFA500", "#87CEEB"] },
  { colors: ["#9370DB", "#4169E1", "#FFFFFF"] },
  { colors: ["#FFA500", "#40E0D0", "#87CEEB"] },
  { colors: ["#FFFF00", "#00FF00", "#FFFFFF"] },
  { colors: ["#FF69B4", "#9370DB", "#4169E1", "#00FF00", "#FFFF00", "#FFA500"] },
  { colors: ["#FFFFE0", "#FFFFFF"] },
  { colors: ["#FFA500", "#FFFFFF"] },
  { colors: ["#FF1493", "#00CED1"] },
];

interface ColorPickerProps {
  visible: boolean;
  onClose: () => void;
  onColorSelect: (color: string) => void;
}

export default function ColorPickerScreen({ visible, onClose, onColorSelect }: ColorPickerProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const [hue, setHue] = useState(0); // 0-360
  const [saturation, setSaturation] = useState(100); // 0-100
  const [brightness, setBrightness] = useState(100); // 0-100
  const [lightDirection, setLightDirection] = useState(false);
  const [loopMode, setLoopMode] = useState(false);
  const [ledSpeed, setLedSpeed] = useState(50);

  // 将 HSV 转换为 RGB，然后转换为十六进制
  const hsvToHex = (h: number, s: number, v: number): string => {
    const c = (v / 100) * (s / 100);
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = (v / 100) - c;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  const currentColor = hsvToHex(hue, saturation, brightness);

  // 颜色轮触摸处理
  const colorWheelPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handleColorWheelTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },
      onPanResponderMove: (evt) => {
        handleColorWheelTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },
    })
  ).current;

  const handleColorWheelTouch = (x: number, y: number) => {
    const centerX = COLOR_WHEEL_SIZE / 2;
    const centerY = COLOR_WHEEL_SIZE / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = COLOR_WHEEL_SIZE / 2;

    if (distance <= radius && distance >= radius * 0.7) {
      // 在颜色轮上
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const normalizedAngle = angle < 0 ? angle + 360 : angle;
      setHue(normalizedAngle);
    }
  };

  // 颜色方块触摸处理
  const colorSquarePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handleColorSquareTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },
      onPanResponderMove: (evt) => {
        handleColorSquareTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },
    })
  ).current;

  const handleColorSquareTouch = (x: number, y: number) => {
    const sat = Math.max(0, Math.min(100, (x / COLOR_SQUARE_SIZE) * 100));
    const bright = Math.max(0, Math.min(100, 100 - (y / COLOR_SQUARE_SIZE) * 100));
    setSaturation(sat);
    setBrightness(bright);
  };

  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    onClose();
  };

  // 计算颜色轮标记位置
  const colorWheelMarkerAngle = (hue * Math.PI) / 180;
  const colorWheelMarkerX = (COLOR_WHEEL_SIZE / 2) + (COLOR_WHEEL_SIZE / 2 - 10) * Math.cos(colorWheelMarkerAngle);
  const colorWheelMarkerY = (COLOR_WHEEL_SIZE / 2) + (COLOR_WHEEL_SIZE / 2 - 10) * Math.sin(colorWheelMarkerAngle);

  // 计算颜色方块标记位置
  const colorSquareMarkerX = (saturation / 100) * COLOR_SQUARE_SIZE;
  const colorSquareMarkerY = (1 - brightness / 100) * COLOR_SQUARE_SIZE;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: "#000000", paddingTop: insets.top }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Color Wheel Section */}
          <View style={styles.colorWheelContainer}>
            {/* Color Wheel */}
            <View
              style={styles.colorWheelWrapper}
              {...colorWheelPanResponder.panHandlers}
            >
              {/* Color Wheel Outer Ring */}
              <View style={styles.colorWheelOuter} {...colorWheelPanResponder.panHandlers}>
                <LinearGradient
                  colors={[
                    "#FF0000",
                    "#FF7F00",
                    "#FFFF00",
                    "#00FF00",
                    "#00FFFF",
                    "#0000FF",
                    "#4B0082",
                    "#9400D3",
                    "#FF0000",
                  ]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                {/* Inner Circle (cutout) */}
                <View style={styles.colorWheelInner}>
                  {/* Color Square */}
                  <View
                    style={[
                      styles.colorSquare,
                      {
                        backgroundColor: hsvToHex(hue, 100, 100),
                      },
                    ]}
                    {...colorSquarePanResponder.panHandlers}
                  >
                    <LinearGradient
                      colors={["#FFFFFF", "transparent", "#000000"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    {/* Color Square Marker */}
                    <View
                      style={[
                        styles.colorSquareMarker,
                        {
                          left: colorSquareMarkerX - 8,
                          top: colorSquareMarkerY - 8,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
              {/* Color Wheel Marker */}
              <View
                style={[
                  styles.colorWheelMarker,
                  {
                    left: colorWheelMarkerX - 8,
                    top: colorWheelMarkerY - 8,
                  },
                ]}
              />
            </View>
          </View>

          {/* Solid Color Presets */}
          <View style={styles.presetsContainer}>
            <View style={styles.presetRow}>
              {solidColors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.presetCircle, { backgroundColor: color }]}
                  onPress={() => handleColorSelect(color)}
                />
              ))}
            </View>

            {/* Add Button */}
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>

            {/* Gradient Presets */}
            <View style={styles.presetRow}>
              {gradientPresets.map((gradient, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.presetCircle}
                  onPress={() => handleColorSelect(gradient.colors[0])}
                >
                  <LinearGradient
                    colors={gradient.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientPreset}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.settingsContainer}>
            {/* Light Direction */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>灯光转向</Text>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  lightDirection && styles.toggleActive,
                ]}
                onPress={() => setLightDirection(!lightDirection)}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    lightDirection && styles.toggleThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            {/* Loop Mode */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>循环模式</Text>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  loopMode && styles.toggleActive,
                ]}
                onPress={() => setLoopMode(!loopMode)}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    loopMode && styles.toggleThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            {/* LED Speed */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>LED 速度</Text>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  value={ledSpeed}
                  onValueChange={setLedSpeed}
                  minimumTrackTintColor="#9370DB"
                  maximumTrackTintColor="#3A3A3C"
                  thumbTintColor="#D2B48C"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  colorWheelContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  colorWheelWrapper: {
    width: COLOR_WHEEL_SIZE,
    height: COLOR_WHEEL_SIZE,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  colorWheelOuter: {
    width: COLOR_WHEEL_SIZE,
    height: COLOR_WHEEL_SIZE,
    borderRadius: COLOR_WHEEL_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  colorWheelInner: {
    width: COLOR_WHEEL_SIZE * 0.6,
    height: COLOR_WHEEL_SIZE * 0.6,
    borderRadius: (COLOR_WHEEL_SIZE * 0.6) / 2,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  colorSquare: {
    width: COLOR_SQUARE_SIZE,
    height: COLOR_SQUARE_SIZE,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  colorWheelMarker: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#FF0000",
  },
  colorSquareMarker: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#000000",
  },
  presetsContainer: {
    marginBottom: 30,
  },
  presetRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  presetCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  gradientPreset: {
    width: "100%",
    height: "100%",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "300",
  },
  settingsContainer: {
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  settingLabel: {
    color: "#FFFFFF",
    fontSize: 16,
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
  sliderContainer: {
    flex: 1,
    marginLeft: 20,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  closeButton: {
    paddingVertical: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#2C2C2E",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});

