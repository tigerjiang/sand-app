import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDevice } from "../contexts/DeviceContext";
import { useTheme } from "../contexts/ThemeContext";

interface DeviceHeaderProps {
  deviceName?: string;
  powered?: boolean;
  ledEnabled?: boolean;
  whiteNoiseEnabled?: boolean;
  onPowerPress?: (next?: boolean) => void;
  onLedPress?: (next?: boolean) => void;
  onWhiteNoisePress?: (next?: boolean) => void;
}

export default function DeviceHeader({
  deviceName,
  powered,
  ledEnabled,
  whiteNoiseEnabled,
  onPowerPress,
  onLedPress,
  onWhiteNoisePress,
}: DeviceHeaderProps) {
  const { currentDevice } = useDevice();
  const displayDeviceName =
    deviceName || currentDevice?.name || "Meditation Device";
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const [isPoweredState, setIsPoweredState] = useState(true);
  const [ledEnabledState, setLedEnabledState] = useState(true);
  const [whiteNoiseEnabledState, setWhiteNoiseEnabledState] = useState(false);

  const isPowered = powered ?? isPoweredState;
  const isLedEnabled = ledEnabled ?? ledEnabledState;
  const isWhiteNoiseEnabled = whiteNoiseEnabled ?? whiteNoiseEnabledState;

  const iconColor = isDark ? "#FFFFFF" : "#000000";
  const textColor = isDark ? "#FFFFFF" : "#000000";

  const handlePowerPress = () => {
    const next = !isPowered;
    if (powered === undefined) setIsPoweredState(next);
    onPowerPress?.(next);
  };

  const handleLedPress = () => {
    const next = !isLedEnabled;
    if (ledEnabled === undefined) setLedEnabledState(next);
    onLedPress?.(next);
  };

  const handleWhiteNoisePress = () => {
    const next = !isWhiteNoiseEnabled;
    if (whiteNoiseEnabled === undefined) setWhiteNoiseEnabledState(next);
    onWhiteNoisePress?.(next);
  };

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + 10,
          paddingBottom: 10,
        },
      ]}
    >
      {/* 左边：开关机按钮 */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={handlePowerPress}
        activeOpacity={0.7}
      >
        <Ionicons
          name="power"
          size={24}
          color={isPowered ? iconColor : iconColor}
          style={{ opacity: isPowered ? 1 : 0.5 }}
        />
      </TouchableOpacity>

      {/* 中间：设备名称 */}
      <Text style={[styles.deviceName, { color: textColor }]}>
        {displayDeviceName}
      </Text>

      {/* 右边：LED灯开关和白噪音开关 */}
      <View style={styles.rightButtons}>
        {/* 音乐/白噪音图标 */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleWhiteNoisePress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="musical-notes-outline"
            size={24}
            color={whiteNoiseEnabled ? iconColor : iconColor}
            style={{ opacity: whiteNoiseEnabled ? 1 : 0.5 }}
          />
        </TouchableOpacity>

        {/* LED灯开关按钮 */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleLedPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="bulb-outline"
            size={24}
            color={isLedEnabled ? iconColor : iconColor}
            style={{ opacity: isLedEnabled ? 1 : 0.5 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  iconButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  powerIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  powerIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    position: "absolute",
    top: 0,
  },
  powerIconLine: {
    width: 2,
    height: 10,
    position: "absolute",
    top: -2,
  },
  deviceName: {
    fontSize: 20,
    fontWeight: "400",
    fontFamily: "serif",
    letterSpacing: 1,
  },
  rightButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
});
