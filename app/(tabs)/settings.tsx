import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import DeviceHeader from "../../components/DeviceHeader";
import { useDevice } from "../../contexts/DeviceContext";
import { useI18n } from "../../contexts/I18nContext";
import { useTheme } from "../../contexts/ThemeContext";
import { logout } from "../../utils/api";
import {
  resetCommand,
  restartCommand,
  reverseDrawCommand,
  setBallSpeedCommand,
} from "../../utils/deviceCommand";
import {
  DeviceState,
  extractMacFromDeviceName,
  type HeartbeatData,
  type DeviceInfo as MqttDeviceInfo,
  subscribeDeviceTopics,
} from "../../utils/deviceManager";
import { mqttManager } from "../../utils/mqttManager";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function percentToByte(percent: number) {
  return Math.round((clamp(percent, 0, 100) / 100) * 255);
}

function byteToPercent(byte: number) {
  return Math.round((clamp(byte, 0, 255) / 255) * 100);
}

// Tabs 下的 Settings 页面 - 已登录状态
export default function SettingsTab() {
  const router = useRouter();
  const { isDark, themeMode, setThemeMode } = useTheme();
  const { t } = useI18n();
  const { currentDevice } = useDevice();

  const [reverseDrawMode, setReverseDrawMode] = useState(false);
  const [drawingSpeed, setDrawingSpeed] = useState(82);
  const [showSpeedIndicator, setShowSpeedIndicator] = useState(false);
  const hideIndicatorTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const speedDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const deviceMac = useMemo(() => {
    if (!currentDevice) return "";
    const fromName = extractMacFromDeviceName(currentDevice.name);
    if (fromName) return fromName;
    return extractMacFromDeviceName(currentDevice.id) || currentDevice.id || "";
  }, [currentDevice]);

  const [mqttStatus, setMqttStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >(mqttManager.getConnected() ? "connected" : "disconnected");
  const [mqttError, setMqttError] = useState<string | null>(null);
  const [heartbeat, setHeartbeat] = useState<HeartbeatData | null>(null);
  const [lastHeartbeatAt, setLastHeartbeatAt] = useState<number | null>(null);
  const [reportedDeviceInfo, setReportedDeviceInfo] =
    useState<MqttDeviceInfo | null>(null);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (hideIndicatorTimeout.current) {
        clearTimeout(hideIndicatorTimeout.current);
      }
      if (speedDebounceRef.current) {
        clearTimeout(speedDebounceRef.current);
      }
    };
  }, []);

  const canSendCommand = () => {
    if (!currentDevice) {
      Alert.alert(t("error"), "未选择设备，请先完成设备配网/绑定。");
      return false;
    }
    if (!deviceMac) {
      Alert.alert(t("error"), "无法获取设备 MAC（请检查设备名称/ID）。");
      return false;
    }
    if (!mqttManager.getConnected()) {
      Alert.alert(t("error"), "MQTT 未连接，请先在设备配网页完成连接。");
      return false;
    }
    return true;
  };

  // 订阅设备 MQTT 上报（用于同步开关/滑杆的真实状态）
  useEffect(() => {
    if (!currentDevice || !deviceMac) {
      setHeartbeat(null);
      setLastHeartbeatAt(null);
      setReportedDeviceInfo(null);
      setMqttStatus(mqttManager.getConnected() ? "connected" : "disconnected");
      return;
    }

    const heartbeatTopic = `heartbeat/${deviceMac}`;
    const deviceInfoTopic = `devicelinfo/${deviceMac}`;

    setMqttStatus(mqttManager.getConnected() ? "connected" : "connecting");
    setMqttError(null);

    mqttManager
      .connect({ topics: [heartbeatTopic, deviceInfoTopic] })
      .catch((err: any) => {
        setMqttStatus("error");
        setMqttError(err?.message || "MQTT 连接失败");
      });

    const statusUnsub = mqttManager.onStatus((status, err) => {
      if (status === "connected") {
        setMqttStatus("connected");
        setMqttError(null);
      } else if (status === "disconnected") {
        setMqttStatus("disconnected");
      } else if (status === "error") {
        setMqttStatus("error");
        setMqttError(err?.message || "MQTT 错误");
      }
    });

    const unsubs = subscribeDeviceTopics(
      deviceMac,
      (hb) => {
        setHeartbeat(hb);
        setLastHeartbeatAt(Date.now());
        if (hb.reverse_draw !== undefined)
          setReverseDrawMode(hb.reverse_draw === 1);
        if (hb.ball_sp !== undefined)
          setDrawingSpeed(byteToPercent(hb.ball_sp));
      },
      (info) => setReportedDeviceInfo(info),
    );

    return () => {
      statusUnsub();
      unsubs.forEach((u) => u());
    };
  }, [currentDevice, deviceMac]);

  const handleDarkModeChange = (value: boolean) => {
    setThemeMode(value ? "dark" : "light");
  };

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const handleChangePassword = () => {
    router.push("/change-password");
  };

  const handleLogout = () => {
    // 可选：通知后端失效 token，然后清理本地 token
    logout().finally(() => {
      router.replace("/");
    });
  };

  const handleLanguage = () => {
    router.push("/language");
  };

  const handlePrivacy = () => {
    // 处理隐私设置
    console.log("Privacy");
  };

  const handleManualConnection = () => {
    // 处理手动连接
    console.log("Manual connection");
  };

  const handleRestart = () => {
    Alert.alert(t("restart"), t("restartConfirm"), [
      {
        text: t("cancel"),
        style: "cancel",
      },

      {
        text: t("confirm"),
        onPress: () => {
          if (!canSendCommand()) return;
          restartCommand(deviceMac).catch((err: any) => {
            Alert.alert(t("error"), err?.message || "发送重启指令失败");
          });
        },
        style: "destructive",
      },
    ]);
  };

  const handleFactoryReset = () => {
    Alert.alert(t("factoryReset"), t("factoryResetConfirm"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("confirm"),
        onPress: () => {
          if (!canSendCommand()) return;
          resetCommand(deviceMac).catch((err: any) => {
            Alert.alert(t("error"), err?.message || "发送恢复出厂设置指令失败");
          });
        },
        style: "destructive",
      },
    ]);
  };

  const backgroundColor = isDark ? "#000000" : "#F5F5F0";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const sectionTextColor = isDark ? "#FFFFFF" : "#000000";
  const dividerColor = isDark ? "#2C2C2E" : "#E0E0E0";
  const iconColor = isDark ? "#FFFFFF" : "#000000";
  const chevronColor = isDark ? "#8E8E93" : "#999999";
  const versionTextColor = isDark ? "#8E8E93" : "#666666";
  const sliderActiveColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const sliderTrackColor = isDark ? "#5A5A5C" : "#D0D0D0";
  const sliderBgColor = isDark ? "#1C1C1E" : "#FFFFFF";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <DeviceHeader />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Main Title */}
        <Text style={[styles.mainTitle, { color: textColor }]}>
          {t("settings")}
        </Text>

        {/* Account Section - 登录后显示 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="person"
                size={20}
                color={iconColor}
                style={styles.iconOverlay}
              />
              <Ionicons
                name="settings"
                size={14}
                color={iconColor}
                style={styles.iconUnderlay}
              />
            </View>
            <Text style={[styles.sectionTitle, { color: sectionTextColor }]}>
              {t("account")}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Edit Profile */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleEditProfile}
          >
            <Text style={[styles.settingLabel, { color: textColor }]}>
              {t("editProfile")}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Change password */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleChangePassword}
          >
            <Text style={[styles.settingLabel, { color: textColor }]}>
              {t("changePassword")}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Logout */}
          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <Text style={[styles.settingLabel, { color: textColor }]}>
              {t("logout")}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
        </View>

        {/* Device Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="hardware-chip" size={20} color={iconColor} />
            </View>
            <Text style={[styles.sectionTitle, { color: sectionTextColor }]}>
              {t("deviceSettings")}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* MQTT/设备上报状态（简版） */}
          <View
            style={[
              styles.deviceStatusCard,
              { backgroundColor: sliderBgColor, borderColor: dividerColor },
            ]}
          >
            <View style={styles.deviceStatusRow}>
              <Text
                style={[styles.deviceStatusLabel, { color: versionTextColor }]}
              >
                设备
              </Text>
              <Text
                style={[styles.deviceStatusValue, { color: textColor }]}
                numberOfLines={1}
              >
                {currentDevice?.name || "未选择"}
              </Text>
            </View>
            <View style={styles.deviceStatusRow}>
              <Text
                style={[styles.deviceStatusLabel, { color: versionTextColor }]}
              >
                MAC
              </Text>
              <Text
                style={[styles.deviceStatusValue, { color: textColor }]}
                numberOfLines={1}
              >
                {deviceMac || "-"}
              </Text>
            </View>
            <View style={styles.deviceStatusRow}>
              <Text
                style={[styles.deviceStatusLabel, { color: versionTextColor }]}
              >
                MQTT
              </Text>
              <Text
                style={[styles.deviceStatusValue, { color: textColor }]}
                numberOfLines={1}
              >
                {mqttStatus === "connected"
                  ? "已连接"
                  : mqttStatus === "connecting"
                    ? "连接中…"
                    : mqttStatus === "error"
                      ? `错误：${mqttError || "未知"}`
                      : "未连接"}
              </Text>
            </View>
            <View style={styles.deviceStatusRow}>
              <Text
                style={[styles.deviceStatusLabel, { color: versionTextColor }]}
              >
                最后心跳
              </Text>
              <Text style={[styles.deviceStatusValue, { color: textColor }]}>
                {lastHeartbeatAt
                  ? `${Math.round((Date.now() - lastHeartbeatAt) / 1000)}s 前`
                  : "-"}
              </Text>
            </View>
            {heartbeat?.fwver && (
              <View style={styles.deviceStatusRow}>
                <Text
                  style={[
                    styles.deviceStatusLabel,
                    { color: versionTextColor },
                  ]}
                >
                  固件
                </Text>
                <Text style={[styles.deviceStatusValue, { color: textColor }]}>
                  {heartbeat.fwver}
                </Text>
              </View>
            )}
            {heartbeat?.state !== undefined && (
              <View style={styles.deviceStatusRow}>
                <Text
                  style={[
                    styles.deviceStatusLabel,
                    { color: versionTextColor },
                  ]}
                >
                  状态
                </Text>
                <Text style={[styles.deviceStatusValue, { color: textColor }]}>
                  {heartbeat.state === DeviceState.STANDBY
                    ? "待机"
                    : heartbeat.state === DeviceState.RUNNING
                      ? "运行中"
                      : heartbeat.state === DeviceState.UPDATING
                        ? "升级中"
                        : "未知"}
                </Text>
              </View>
            )}
            {reportedDeviceInfo && (
              <Text
                style={[styles.deviceStatusHint, { color: versionTextColor }]}
                numberOfLines={2}
              >
                上报信息：{JSON.stringify(reportedDeviceInfo)}
              </Text>
            )}
          </View>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Reverse Draw Mode */}
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: textColor }]}>
              {t("reverseDrawMode")}
            </Text>
            <Switch
              value={reverseDrawMode}
              onValueChange={(next) => {
                setReverseDrawMode(next);
                if (!canSendCommand()) return;
                reverseDrawCommand(deviceMac, next ? 1 : 0).catch(
                  (err: any) => {
                    setReverseDrawMode(!next);
                    Alert.alert(
                      t("error"),
                      err?.message || "发送反向绘制指令失败",
                    );
                  },
                );
              }}
              trackColor={{
                false: isDark ? "#3A3A3C" : "#E0E0E0",
                true: isDark ? "#0A84FF" : "#2C2C2C",
              }}
              thumbColor="#FFF"
            />
          </View>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Drawing Speed */}
          <View style={styles.drawingSpeedContainer}>
            <View style={styles.drawingSpeedLabelRow}>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                {t("drawingSpeed")}
              </Text>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                {Math.round(drawingSpeed)}
              </Text>
            </View>
            <View
              style={[
                styles.sliderContainer,
                { backgroundColor: sliderBgColor },
              ]}
            >
              <View style={styles.sliderWrapper}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  value={drawingSpeed}
                  onValueChange={(value) => {
                    setDrawingSpeed(value);
                    // 拖动时显示指示器
                    if (!showSpeedIndicator) {
                      setShowSpeedIndicator(true);
                    }
                    // 清除之前的隐藏定时器
                    if (hideIndicatorTimeout.current) {
                      clearTimeout(hideIndicatorTimeout.current);
                    }

                    // 防抖下发（协议 ball_sp: 0-255）
                    if (!canSendCommand()) return;
                    if (speedDebounceRef.current)
                      clearTimeout(speedDebounceRef.current);
                    speedDebounceRef.current = setTimeout(() => {
                      setBallSpeedCommand(
                        deviceMac,
                        percentToByte(value),
                      ).catch((err: any) => {
                        Alert.alert(
                          t("error"),
                          err?.message || "发送速度指令失败",
                        );
                      });
                    }, 150);
                  }}
                  minimumTrackTintColor={sliderActiveColor}
                  maximumTrackTintColor={sliderTrackColor}
                  thumbTintColor={sliderActiveColor}
                />
                {/* 滑块标记点 */}
                <View style={styles.sliderDots}>
                  {[0, 20, 40, 60, 80, 100].map((dot) => (
                    <View
                      key={dot}
                      style={[
                        styles.sliderDot,
                        {
                          left: `${dot}%`,
                          backgroundColor: isDark ? "#6A6A6A" : "#C0C0C0",
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Device Settings Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="hardware-chip" size={20} color={iconColor} />
              </View>
              <Text style={[styles.sectionTitle, { color: sectionTextColor }]}>
                {t("deviceSettings")}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Reverse Draw Mode */}
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                {t("reverseDrawMode")}
              </Text>
              <Switch
                value={reverseDrawMode}
                onValueChange={setReverseDrawMode}
                trackColor={{
                  false: isDark ? "#3A3A3C" : "#E0E0E0",
                  true: isDark ? "#0A84FF" : "#2C2C2C",
                }}
                thumbColor="#FFF"
              />
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Restart */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleRestart}
            >
              <Text style={[styles.settingLabel, { color: textColor }]}>
                {t("restart")}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={chevronColor} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Factory Reset */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleFactoryReset}
            >
              <Text style={[styles.settingLabel, { color: textColor }]}>
                {t("factoryReset")}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={chevronColor} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: dividerColor }]} />
          </View>

          {/* App Settings Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="settings"
                  size={20}
                  color={iconColor}
                  style={styles.iconOverlay}
                />
                <Ionicons
                  name="settings"
                  size={16}
                  color={iconColor}
                  style={styles.iconUnderlay}
                />
              </View>
              <Text style={[styles.sectionTitle, { color: sectionTextColor }]}>
                {t("appSettings")}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Dark Mode */}
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                {t("darkMode")}
              </Text>
              <Switch
                value={themeMode === "dark"}
                onValueChange={handleDarkModeChange}
                trackColor={{
                  false: isDark ? "#3A3A3C" : "#E0E0E0",
                  true: isDark ? "#0A84FF" : "#2C2C2C",
                }}
                thumbColor="#FFF"
              />
            </View>
            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Language */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleLanguage}
            >
              <Text style={[styles.settingLabel, { color: textColor }]}>
                {t("language")}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={chevronColor} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: dividerColor }]} />
          </View>

          {/* Help Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={iconColor}
                />
              </View>
              <Text style={[styles.sectionTitle, { color: sectionTextColor }]}>
                {t("help")}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Privacy */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handlePrivacy}
            >
              <Text style={[styles.settingLabel, { color: textColor }]}>
                {t("privacy")}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={chevronColor} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Manual connection */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleManualConnection}
            >
              <Text style={[styles.settingLabel, { color: textColor }]}>
                {t("manualConnection")}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={chevronColor} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: dividerColor }]} />
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={iconColor}
                />
              </View>
              <Text style={[styles.sectionTitle, { color: sectionTextColor }]}>
                {t("about")}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* App Version */}
            <View style={styles.settingItem}>
              <Text style={[styles.versionText, { color: versionTextColor }]}>
                {t("appVersion")} : 2.0.8
              </Text>
            </View>
          </View>
        </View>
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
    padding: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    marginRight: 12,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  iconOverlay: {
    position: "absolute",
  },
  iconUnderlay: {
    position: "absolute",
    top: 4,
    left: 4,
    opacity: 0.6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 0,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  settingLabel: {
    fontSize: 16,
  },
  versionText: {
    fontSize: 14,
    paddingVertical: 16,
  },
  drawingSpeedContainer: {
    paddingVertical: 16,
  },
  drawingSpeedLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sliderContainer: {
    position: "relative",
    width: "100%",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sliderWrapper: {
    position: "relative",
    width: "100%",
    height: 40,
    justifyContent: "center",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderDots: {
    position: "absolute",
    width: "100%",
    height: 2,
    top: 19,
    left: 0,
  },
  sliderDot: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    marginLeft: -2,
  },

  valueIndicator: {
    position: "absolute",
    top: -36,
    alignItems: "center",
    zIndex: 10,
    width: 40,
    height: 32,
  },
  teardropSvg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  valueTextContainer: {
    position: "absolute",
    top: 6,
    left: 0,
    right: 0,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  valueText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  deviceStatusCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 12,
  },
  deviceStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },
  deviceStatusLabel: {
    width: 72,
    fontSize: 12,
  },
  deviceStatusValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "600",
  },
  deviceStatusHint: {
    marginTop: 6,
    fontSize: 10,
  },
});
