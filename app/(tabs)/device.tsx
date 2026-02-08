import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import DeviceHeader from "../../components/DeviceHeader";
import { useDevice } from "../../contexts/DeviceContext";
import { useI18n } from "../../contexts/I18nContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  extractMacFromDeviceName,
  DeviceState,
  type HeartbeatData,
  type DeviceInfo as MqttDeviceInfo,
  subscribeDeviceTopics,
} from "../../utils/deviceManager";
import { mqttManager } from "../../utils/mqttManager";
import {
  convertColorsToCommandFormat,
  localPlayCommand,
  playCommand,
  powerCommand,
  lightCommand,
  setBallSpeedCommand,
  setGapTimeCommand,
  setLedBrightCommand,
  setLedColorCommand,
  setSleepTimeCommand,
  soundCommand,
} from "../../utils/deviceCommand";
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

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function percentToByte(percent: number) {
  return Math.round((clamp(percent, 0, 100) / 100) * 255);
}

function byteToPercent(byte: number) {
  return Math.round((clamp(byte, 0, 255) / 255) * 100);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "").trim();
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return { r, g, b };
}

function formatHHmm(date: Date) {
  const h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, "0");
  // 协议示例是 "9:45"（小时不强制补零）
  return `${h}:${m}`;
}

function parseMinutesToToday(minutes: number): Date {
  const d = new Date();
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  d.setHours(h, m, 0, 0);
  return d;
}

function stableSoundIdFromName(name: string): number {
  // 简单稳定 hash → 1..255（避免 0）
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return (hash % 255) + 1;
}

export default function DeviceTab() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { t } = useI18n();
  const { currentDevice } = useDevice();

  const deviceMac = useMemo(() => {
    if (!currentDevice) return "";
    // 优先从名称中提取（形如 OM + mac / 或直接 mac）
    const fromName = extractMacFromDeviceName(currentDevice.name);
    if (fromName) return fromName;
    // 兜底：如果 id 本身就是 mac（或你在测试阶段用 virtual-xxx）
    return extractMacFromDeviceName(currentDevice.id) || currentDevice.id || "";
  }, [currentDevice]);

  const [mqttStatus, setMqttStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >(mqttManager.getConnected() ? "connected" : "disconnected");
  const [mqttError, setMqttError] = useState<string | null>(null);
  const [heartbeat, setHeartbeat] = useState<HeartbeatData | null>(null);
  const [lastHeartbeatAt, setLastHeartbeatAt] = useState<number | null>(null);
  const [reportedDeviceInfo, setReportedDeviceInfo] = useState<MqttDeviceInfo | null>(null);

  const brightnessDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const volumeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // 订阅设备 MQTT 上报（心跳/设备信息）
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

    // 确保连接，并在连接成功后自动订阅 topics
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

        // 用设备上报同步 UI（避免“UI 与设备实际状态脱节”）
        if (hb.play !== undefined) setIsPlaying(hb.play === 1);
        if (hb.state !== undefined) {
          setPowerOn(
            hb.state === DeviceState.RUNNING ||
              hb.state === DeviceState.STANDBY ||
              hb.state === DeviceState.UPDATING
          );
        }
        if (hb.light !== undefined) setLedOn(hb.light === 1);
        if (hb.led_bright !== undefined) setBrightness(byteToPercent(hb.led_bright));
        if (hb.ball_sp !== undefined) setVolume(byteToPercent(hb.ball_sp));
        if (hb.gap_time !== undefined) {
          setIntervalPauseMinutes(hb.gap_time);
          setIntervalPause(hb.gap_time > 0);
        }
        if (hb.sleep_on != null) setSleepStartTime(parseMinutesToToday(hb.sleep_on));
        if (hb.sleep_off != null) setSleepEndTime(parseMinutesToToday(hb.sleep_off));
        if (hb.sound_id !== undefined) {
          setMusicEnabled(hb.sound_id > 0);
          if (hb.sound_id > 0) setSoundId(hb.sound_id);
        }
        if (hb.sound_type !== undefined) {
          const st = hb.sound_type as 1 | 2 | 3;
          if (st === 1 || st === 2 || st === 3) setSoundType(st);
        }
      },
      (info) => {
        setReportedDeviceInfo(info);
      }
    );

    return () => {
      statusUnsub();
      unsubs.forEach((u) => u());
    };
  }, [currentDevice, deviceMac, t]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [powerOn, setPowerOn] = useState(true);
  const [ledOn, setLedOn] = useState(true);
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
  // 白噪音：当前选择（WhiteNoisePicker 目前只返回 musicName，这里做稳定映射）
  const [soundId, setSoundId] = useState<number>(1);
  // 1-单曲循环，2-列表循环，3-随机播放（UI 暂未传出，先默认列表循环）
  const [soundType, setSoundType] = useState<1 | 2 | 3>(2);
  const [whiteNoisePickerVisible, setWhiteNoisePickerVisible] = useState(false);

  const backgroundColor = isDark ? "#000000" : "#F5F5F0";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const iconColor = isDark ? "#FFFFFF" : "#000000";
  const borderColor = isDark ? "#FFFFFF" : "#E0E0E0";
  const activeBgColor = isDark ? "#2C2C2E" : "#E8E8E8";
  const sliderActiveColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const sliderTrackColor = isDark ? "#5A5A5C" : "#D0D0D0";
  const sliderBgColor = isDark ? "#1C1C1E" : "#FFFFFF";
  const inactiveTextColor = isDark ? "#999" : "#999";

  const playPatternAtIndex = async (index: number) => {
    const item = playlist[index];
    setCurrentIndex(index);
    setIsPlaying(true);

    if (!canSendCommand()) return;

    try {
      // 优先使用 thrFile 作为 SD 资源名；没有时用 title
      await localPlayCommand(deviceMac, item.thrFile || item.title);
      await playCommand(deviceMac, 1);
    } catch (err: any) {
      Alert.alert(t("error"), err?.message || "发送播放指令失败");
    }
  };

  const handlePrevious = () => {
    const nextIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    void playPatternAtIndex(nextIndex);
  };

  const handleNext = () => {
    const nextIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
    void playPatternAtIndex(nextIndex);
  };

  const handlePlayPause = async () => {
    const next = !isPlaying;
    setIsPlaying(next);

    if (!canSendCommand()) return;

    try {
      await playCommand(deviceMac, next ? 1 : 0);
    } catch (err: any) {
      // 失败则回滚 UI
      setIsPlaying(!next);
      Alert.alert(t("error"), err?.message || "发送播放控制失败");
    }
  };

  const handlePlaylistItem = (index: number) => {
    void playPatternAtIndex(index);
  };

  const currentItem = playlist[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <DeviceHeader
        powered={powerOn}
        ledEnabled={ledOn}
        whiteNoiseEnabled={musicEnabled}
        onPowerPress={async (next?: boolean) => {
          const resolvedNext = typeof next === "boolean" ? next : !powerOn;
          setPowerOn(resolvedNext);
          if (!canSendCommand()) return;
          try {
            await powerCommand(deviceMac, resolvedNext ? 1 : 0);
          } catch (err: any) {
            setPowerOn(!resolvedNext);
            Alert.alert(t("error"), err?.message || "发送开关机指令失败");
          }
        }}
        onLedPress={async (next?: boolean) => {
          const resolvedNext = typeof next === "boolean" ? next : !ledOn;
          setLedOn(resolvedNext);
          if (!canSendCommand()) return;
          try {
            await lightCommand(deviceMac, resolvedNext ? 1 : 0);
          } catch (err: any) {
            setLedOn(!resolvedNext);
            Alert.alert(t("error"), err?.message || "发送灯光指令失败");
          }
        }}
        onWhiteNoisePress={async (next?: boolean) => {
          const resolvedNext = typeof next === "boolean" ? next : !musicEnabled;
          setMusicEnabled(resolvedNext);
          if (!canSendCommand()) return;
          try {
            await soundCommand(deviceMac, { sound_id: resolvedNext ? soundId : 0, sound_type: soundType });
          } catch (err: any) {
            setMusicEnabled(!resolvedNext);
            Alert.alert(t("error"), err?.message || "发送白噪音指令失败");
          }
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* MQTT/设备上报状态 */}
        <View style={[styles.statusCard, { backgroundColor: sliderBgColor, borderColor }]}>
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: inactiveTextColor }]}>设备</Text>
            <Text style={[styles.statusValue, { color: textColor }]} numberOfLines={1}>
              {currentDevice?.name || "未选择"}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: inactiveTextColor }]}>MAC</Text>
            <Text style={[styles.statusValue, { color: textColor }]} numberOfLines={1}>
              {deviceMac || "-"}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: inactiveTextColor }]}>MQTT</Text>
            <Text style={[styles.statusValue, { color: textColor }]} numberOfLines={1}>
              {mqttStatus === "connected"
                ? "已连接"
                : mqttStatus === "connecting"
                  ? "连接中…"
                  : mqttStatus === "error"
                    ? `错误：${mqttError || "未知"}`
                    : "未连接"}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: inactiveTextColor }]}>最后心跳</Text>
            <Text style={[styles.statusValue, { color: textColor }]}>
              {lastHeartbeatAt ? `${Math.round((Date.now() - lastHeartbeatAt) / 1000)}s 前` : "-"}
            </Text>
          </View>

          {heartbeat && (
            <>
              <View style={styles.statusRow}>
                <Text style={[styles.statusLabel, { color: inactiveTextColor }]}>状态</Text>
                <Text style={[styles.statusValue, { color: textColor }]}>
                  {heartbeat.state === DeviceState.STANDBY
                    ? "待机"
                    : heartbeat.state === DeviceState.RUNNING
                      ? "运行中"
                      : heartbeat.state === DeviceState.UPDATING
                        ? "升级中"
                        : "未知"}
                </Text>
              </View>
              {heartbeat.fwver && (
                <View style={styles.statusRow}>
                  <Text style={[styles.statusLabel, { color: inactiveTextColor }]}>固件</Text>
                  <Text style={[styles.statusValue, { color: textColor }]}>{heartbeat.fwver}</Text>
                </View>
              )}
              {heartbeat.pct !== undefined && (
                <View style={styles.statusRow}>
                  <Text style={[styles.statusLabel, { color: inactiveTextColor }]}>进度</Text>
                  <Text style={[styles.statusValue, { color: textColor }]}>{heartbeat.pct.toFixed(1)}%</Text>
                </View>
              )}
            </>
          )}

          {reportedDeviceInfo && (
            <Text style={[styles.statusHint, { color: inactiveTextColor }]} numberOfLines={2}>
              上报信息：{JSON.stringify(reportedDeviceInfo)}
            </Text>
          )}
        </View>

        {/* Pattern Display */}
      <View style={styles.patternContainer}>
        <View style={[styles.patternCircle, { borderColor }]}>
          <Svg width={200} height={200} viewBox="0 0 1000 1000">
            <Path
              d={svgPaths[currentItem.svgFile] || svgPaths["01_complex_mandala_rings.svg"]}
              fill="none"
              stroke={iconColor}
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
            onValueChange={(value) => {
              setBrightness(value);
              if (!canSendCommand()) return;
              if (brightnessDebounceRef.current) clearTimeout(brightnessDebounceRef.current);
              brightnessDebounceRef.current = setTimeout(() => {
                setLedBrightCommand(deviceMac, percentToByte(value)).catch((err: any) => {
                  Alert.alert(t("error"), err?.message || "发送亮度指令失败");
                });
              }, 150);
            }}
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
            onPress={() => {
              const next = !musicEnabled;
              setMusicEnabled(next);
              if (!canSendCommand()) return;
              soundCommand(deviceMac, { sound_id: next ? soundId : 0, sound_type: soundType }).catch((err: any) => {
                setMusicEnabled(!next);
                Alert.alert(t("error"), err?.message || "发送白噪音指令失败");
              });
            }}
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
            onValueChange={(value) => {
              setVolume(value);
              if (!musicEnabled) return;
              if (!canSendCommand()) return;
              if (volumeDebounceRef.current) clearTimeout(volumeDebounceRef.current);
              volumeDebounceRef.current = setTimeout(() => {
                // 协议里有 ball_sp（0-255），这里先用它承载“音量/速度”类滑杆
                setBallSpeedCommand(deviceMac, percentToByte(value)).catch((err: any) => {
                  Alert.alert(t("error"), err?.message || "发送音量/速度指令失败");
                });
              }, 150);
            }}
            minimumTrackTintColor={sliderActiveColor}
            maximumTrackTintColor={sliderTrackColor}
            thumbTintColor={sliderActiveColor}
            disabled={!musicEnabled}
          />
          <TouchableOpacity
            style={[styles.musicButton, !musicEnabled && { opacity: 0.6 }]}
            onPress={() => {
              if (!musicEnabled) setMusicEnabled(true);
              setWhiteNoisePickerVisible(true);
            }}
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
      </ScrollView>

      {/* 注意：弹层必须放在 ScrollView 外，否则 Android 裁剪会导致不显示 */}
      <ColorPickerScreen
        visible={colorPickerVisible}
        onClose={() => setColorPickerVisible(false)}
        onColorSelect={(color) => {
          setSelectedColor(color);
          const rgb = hexToRgb(color);
          if (!rgb) return;
          setLedOn(true);
          if (!canSendCommand()) return;
          // 开灯 + 设置颜色（协议为 RGB 字符串数组）
          lightCommand(deviceMac, 1).catch(() => {});
          setLedColorCommand(deviceMac, convertColorsToCommandFormat([rgb])).catch((err: any) => {
            Alert.alert(t("error"), err?.message || "发送颜色指令失败");
          });
        }}
      />

      <WhiteNoisePickerScreen
        visible={whiteNoisePickerVisible}
        onClose={() => setWhiteNoisePickerVisible(false)}
        onMusicSelect={(musicName: string) => {
          const nextSoundId = stableSoundIdFromName(musicName);
          setSoundId(nextSoundId);
          setMusicEnabled(true);
          if (!canSendCommand()) return;
          soundCommand(deviceMac, { sound_id: nextSoundId, sound_type: soundType }).catch((err: any) => {
            Alert.alert(t("error"), err?.message || "发送白噪音指令失败");
          });
        }}
      />

      <Modal
        visible={intervalPauseModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIntervalPauseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: sliderBgColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>{t("intervalPause")}</Text>
            <Text style={[styles.modalValue, { color: textColor }]}>{Math.round(tempIntervalMinutes)} min</Text>
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
                  const minutes = Math.round(tempIntervalMinutes);
                  setIntervalPauseMinutes(minutes);
                  setIntervalPause(minutes > 0);
                  setIntervalPauseModalVisible(false);

                  if (!canSendCommand()) return;
                  if (minutes > 0) {
                    setGapTimeCommand(deviceMac, minutes).catch((err: any) => {
                      Alert.alert(t("error"), err?.message || "发送间隔时间指令失败");
                    });
                  }
                }}
              >
                <Text style={[styles.modalButtonText, { color: textColor }]}>{t("confirm")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                    ? `${String(tempSleepStartTime.getHours()).padStart(2, "0")}:${String(
                        tempSleepStartTime.getMinutes()
                      ).padStart(2, "0")}`
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
                    ? `${String(tempSleepEndTime.getHours()).padStart(2, "0")}:${String(
                        tempSleepEndTime.getMinutes()
                      ).padStart(2, "0")}`
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

                    if (canSendCommand()) {
                      setSleepTimeCommand(deviceMac, {
                        on: formatHHmm(tempSleepStartTime),
                        off: formatHHmm(tempSleepEndTime),
                      }).catch((err: any) => {
                        Alert.alert(t("error"), err?.message || "发送睡眠时间指令失败");
                      });
                    }
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
  statusCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },
  statusLabel: {
    width: 72,
    fontSize: 12,
  },
  statusValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "600",
  },
  statusHint: {
    marginTop: 6,
    fontSize: 10,
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
