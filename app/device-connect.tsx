import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { bleManager, ProvisionResponse } from "../utils/bleManager";
import {
  DeviceState,
  extractMacFromDeviceName as extractMac,
  HeartbeatData,
  LEDColor,
  sendCommandToDevice
} from "../utils/deviceManager";
import { mqttManager, MQTTMessage } from "../utils/mqttManager";

// 错误码映射
const ERROR_MESSAGES: Record<number, string> = {
  2001: "Wi-Fi 密码错误",
  2002: "未找到 Wi-Fi",
  2003: "连接超时",
  2004: "不支持的加密方式",
};

export default function DeviceConnectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useI18n();
  const { setCurrentDevice } = useDevice();
  const deviceId = params.deviceId as string;
  const deviceName = params.deviceName as string;

  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provisionStatus, setProvisionStatus] = useState<string>("");
  const [provisionStatusText, setProvisionStatusText] = useState<string>("");
  const [mqttStatus, setMqttStatus] = useState<string>("");
  const [deviceMac, setDeviceMac] = useState<string>(""); // 设备 MAC 地址
  const [deviceInfo, setDeviceInfo] = useState<any>(null); // 设备基础信息
  const [heartbeatData, setHeartbeatData] = useState<HeartbeatData | null>(null); // 心跳数据
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null); // 最后心跳时间
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mqttUnsubscribeRef = useRef<(() => void)[]>([]);

  // 组件卸载时清理连接
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (isConnecting) {
        bleManager.stopMonitoring();
        bleManager.disconnect().catch(console.error);
      }
      // 清理 MQTT 监听
      mqttUnsubscribeRef.current.forEach((unsubscribe) => unsubscribe());
      mqttUnsubscribeRef.current = [];
    };
  }, [isConnecting]);

  const handleConnect = async () => {
    if (!ssid || !password) {
      Alert.alert("错误", "请输入 WiFi SSID 和密码");
      return;
    }

    setIsConnecting(true);
    setProvisionStatus("");
    setProvisionStatusText("");

    try {
      // 连接设备
      setProvisionStatusText("正在连接设备...");
      await bleManager.connectToDevice(deviceId);

      // 开始监听配网状态
      bleManager.startMonitoringProvisionStatus((response: ProvisionResponse) => {
        handleProvisionStatus(response);
      });

      // 发送配网数据
      setProvisionStatusText("正在发送 WiFi 配置...");
      await bleManager.sendProvisionData(ssid, password);
      setProvisionStatusText("等待设备响应...");

      // 设置超时（30秒）
      timeoutRef.current = setTimeout(() => {
        setIsConnecting(false);
        bleManager.stopMonitoring();
        bleManager.disconnect().catch(console.error);
        Alert.alert("超时", "配网超时，请重试");
        setProvisionStatusText("配网超时");
        setProvisionStatus("fail");
      }, 30000);
    } catch (error: any) {
      console.error("配网错误:", error);
      
      // 清除超时定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      setIsConnecting(false);
      bleManager.stopMonitoring();
      bleManager.disconnect().catch(console.error);
      
      const errorMessage = error?.message || "配网失败，请重试";
      Alert.alert("错误", errorMessage);
      setProvisionStatusText("");
      setProvisionStatus("fail");
    }
  };

  const handleProvisionStatus = (response: ProvisionResponse) => {
    // 清除超时定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (response.status === 1) {
      setProvisionStatus("provisioning");
      setProvisionStatusText("配网中...");
    } else if (response.status === 2) {
      setProvisionStatus("connecting");
      setProvisionStatusText("正在连接路由器...");
    } else if (response.status === 3) {
      // 配网成功
      setProvisionStatus("success");
      setProvisionStatusText(`配网成功！设备 IP: ${response.ip || "未知"}`);
      setIsConnecting(false);
      
      // 停止监听并断开蓝牙连接
      bleManager.stopMonitoring();
      bleManager.disconnect().catch(console.error);

      // 提取设备 MAC 地址
      // 设备名称可能就是 MAC 地址，或者需要从其他来源获取
      // 这里使用设备名称作为 MAC（如果设备名称格式符合 MAC 地址格式）
      const mac = extractMac(deviceName) || deviceId;
      setDeviceMac(mac);

      // 连接 MQTT 服务器并开始监听
      connectToMQTT(mac);

      Alert.alert(
        "配网成功",
        `设备已成功连接到 WiFi！\n设备 IP: ${response.ip || "未知"}`,
        [
          {
            text: "确定",
            onPress: () => router.replace("/(tabs)/device"),
          },
        ]
      );
    } else if (response.status === "fail") {
      // 配网失败
      setProvisionStatus("fail");
      const errorCode = response.errorCode || 0;
      const errorMessage = response.message || ERROR_MESSAGES[errorCode] || "配网失败";
      setProvisionStatusText(`配网失败: ${errorMessage}`);
      setIsConnecting(false);

      // 停止监听并断开连接
      bleManager.stopMonitoring();
      bleManager.disconnect().catch(console.error);

      Alert.alert("配网失败", errorMessage, [{ text: "确定" }]);
    }
  };


  // 连接 MQTT 服务器
  const connectToMQTT = async (mac: string) => {
    try {
      setMqttStatus("正在连接 MQTT 服务器...");
      
      // 根据协议规范构建主题
      // 1. 远程指令下发：command/[设备 MAC] - 用于发送指令到设备
      const commandTopic = `command/${mac}`;
      // 2. 设备心跳上报：heartbeat/[设备 MAC] - 监听设备心跳
      const heartbeatTopic = `heartbeat/${mac}`;
      // 3. 设备基础信息上报：devicelinfo/[设备 MAC] - 监听设备信息
      const deviceInfoTopic = `devicelinfo/${mac}`;

      const topicsToSubscribe = [
        commandTopic,    // 指令主题（虽然我们不会订阅，但可以用于发布）
        heartbeatTopic,  // 心跳主题
        deviceInfoTopic, // 设备信息主题
      ];

      // 连接 MQTT
      await mqttManager.connect({
        topics: [heartbeatTopic, deviceInfoTopic], // 只订阅监听类主题
      });

      setMqttStatus("MQTT 已连接，正在监听设备消息...");

      // 监听 MQTT 状态变化
      const statusUnsubscribe = mqttManager.onStatus((status, error) => {
        if (status === "connected") {
          setMqttStatus("MQTT 已连接，正在监听设备消息...");
        } else if (status === "disconnected") {
          setMqttStatus("MQTT 已断开");
        } else if (status === "error") {
          setMqttStatus(`MQTT 错误: ${error?.message || "未知错误"}`);
        }
      });
      mqttUnsubscribeRef.current.push(statusUnsubscribe);

      // 监听 MQTT 消息
      const messageUnsubscribe = mqttManager.onMessage((message: MQTTMessage) => {
        console.log("收到 MQTT 消息:", message.topic, message.payload);
        
        // 根据主题类型处理不同的消息
        if (message.topic === heartbeatTopic) {
          // 处理心跳消息
          handleHeartbeatMessage(message.payload);
        } else if (message.topic === deviceInfoTopic) {
          // 处理设备信息消息
          handleDeviceInfoMessage(message.payload);
        } else if (message.topic.startsWith("command/")) {
          // 处理指令响应（如果有）
          console.log("收到指令响应:", message.payload);
        }
      });
      mqttUnsubscribeRef.current.push(messageUnsubscribe);

    } catch (error: any) {
      console.error("MQTT 连接失败:", error);
      setMqttStatus(`MQTT 连接失败: ${error?.message || "未知错误"}`);
      // MQTT 连接失败不影响配网成功，只记录错误
    }
  };

  // 处理心跳消息
  const handleHeartbeatMessage = (payload: any) => {
    try {
      // 解析心跳数据
      let data: HeartbeatData;
      if (typeof payload === "object" && payload !== null) {
        data = payload as HeartbeatData;
      } else {
        // 如果不是对象，尝试解析 JSON
        data = JSON.parse(payload as string) as HeartbeatData;
      }

      console.log("收到设备心跳:", data);
      
      // 更新心跳数据
      setHeartbeatData(data);
      setLastHeartbeat(new Date());
      
      // 如果心跳数据中包含 ID（MAC地址），更新设备 MAC
      if (data.ID && !deviceMac) {
        setDeviceMac(data.ID);
      }
      
      // 可以在这里更新设备在线状态
      // 例如：更新设备列表中的设备状态、保存到本地存储等
    } catch (error) {
      console.error("处理心跳消息失败:", error);
    }
  };

  // 处理设备信息消息
  const handleDeviceInfoMessage = (payload: any) => {
    console.log("收到设备信息:", payload);
    
    if (payload && typeof payload === "object") {
      setDeviceInfo(payload);
      
      // 如果消息中包含 MAC 地址，更新设备 MAC
      if (payload.mac && !deviceMac) {
        setDeviceMac(payload.mac);
      }
      
      // 可以在这里保存设备信息到本地存储或更新设备列表
    }
  };

  // 发送指令到设备（使用工具函数）
  const handleSendCommand = async (command: any) => {
    if (!deviceMac) {
      Alert.alert("错误", "设备 MAC 地址未设置，无法发送指令");
      return;
    }

    try {
      await sendCommandToDevice(deviceMac, command);
      Alert.alert("成功", "指令已发送");
    } catch (error: any) {
      Alert.alert("错误", `发送指令失败: ${error?.message || "未知错误"}`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.title}>{t("deviceSetup")}</Text>
        <Text style={styles.subtitle}>
          {t("welcome")} zehu. {t("nowLetsSetup")}
        </Text>

        {/* Device Info */}
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceInfoText}>{t("device")}: {deviceName}</Text>
        </View>

        {/* WiFi SSID Input */}
        <Text style={styles.label}>{t("wifiSSID24GHz")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("enterWiFiSSID")}
          placeholderTextColor="#999"
          value={ssid}
          onChangeText={setSsid}
          autoCapitalize="none"
        />

        {/* WiFi Password Input */}
        <Text style={styles.label}>{t("wifiPassword")}</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder={t("enterWiFiPassword")}
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Provision Status */}
        {provisionStatusText && (
          <View style={styles.statusContainer}>
            {isConnecting && (
              <ActivityIndicator size="small" color="#2C2C2C" style={styles.statusIndicator} />
            )}
            <Text style={[
              styles.statusText,
              provisionStatus === "success" && styles.statusTextSuccess,
              provisionStatus === "fail" && styles.statusTextError,
            ]}>
              {provisionStatusText}
            </Text>
          </View>
        )}

        {/* MQTT Status */}
        {mqttStatus && provisionStatus === "success" && (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#2C2C2C" style={styles.statusIndicator} />
            <Text style={styles.statusText}>
              {mqttStatus}
            </Text>
          </View>
        )}

        {/* Device MAC Address */}
        {deviceMac && provisionStatus === "success" && (
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>设备 MAC 地址:</Text>
            <Text style={styles.infoValue}>{deviceMac}</Text>
          </View>
        )}

        {/* Device Info */}
        {deviceInfo && provisionStatus === "success" && (
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>设备信息:</Text>
            <Text style={styles.infoValue}>
              {JSON.stringify(deviceInfo, null, 2)}
            </Text>
          </View>
        )}

        {/* Heartbeat Data */}
        {heartbeatData && provisionStatus === "success" && (
          <View style={styles.heartbeatContainer}>
            <Text style={styles.heartbeatTitle}>设备运行状态</Text>
            
            {/* 基本信息 */}
            <View style={styles.heartbeatRow}>
              <Text style={styles.heartbeatLabel}>设备状态:</Text>
              <Text style={styles.heartbeatValue}>
                {heartbeatData.state === DeviceState.STANDBY ? "待机" :
                 heartbeatData.state === DeviceState.RUNNING ? "运行中" :
                 heartbeatData.state === DeviceState.UPDATING ? "升级中" : "未知"}
              </Text>
            </View>

            {heartbeatData.fwver && (
              <View style={styles.heartbeatRow}>
                <Text style={styles.heartbeatLabel}>固件版本:</Text>
                <Text style={styles.heartbeatValue}>{heartbeatData.fwver}</Text>
              </View>
            )}

            {/* 播放状态 */}
            <View style={styles.heartbeatRow}>
              <Text style={styles.heartbeatLabel}>播放状态:</Text>
              <Text style={styles.heartbeatValue}>
                {heartbeatData.play === 1 ? "播放中" : "已停止"}
              </Text>
            </View>

            {/* 灯光状态 */}
            <View style={styles.heartbeatRow}>
              <Text style={styles.heartbeatLabel}>灯光:</Text>
              <Text style={styles.heartbeatValue}>
                {heartbeatData.light === 1 ? "开启" : "关闭"}
              </Text>
            </View>

            {/* LED 亮度 */}
            {heartbeatData.led_bright !== undefined && (
              <View style={styles.heartbeatRow}>
                <Text style={styles.heartbeatLabel}>LED 亮度:</Text>
                <Text style={styles.heartbeatValue}>
                  {heartbeatData.led_bright}/255
                </Text>
              </View>
            )}

            {/* LED 颜色 */}
            {heartbeatData.colors && heartbeatData.colors.length > 0 && (
              <View style={styles.heartbeatRow}>
                <Text style={styles.heartbeatLabel}>LED 颜色:</Text>
                <View style={styles.colorContainer}>
                  {heartbeatData.colors.map((color: LEDColor, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.colorDot,
                        {
                          backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
                          marginRight: index < heartbeatData.colors!.length - 1 ? 8 : 0,
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* 进度信息 */}
            {heartbeatData.pct !== undefined && (
              <View style={styles.heartbeatRow}>
                <Text style={styles.heartbeatLabel}>播放进度:</Text>
                <Text style={styles.heartbeatValue}>
                  {heartbeatData.pct.toFixed(1)}%
                </Text>
              </View>
            )}

            {heartbeatData.idx !== undefined && (
              <View style={styles.heartbeatRow}>
                <Text style={styles.heartbeatLabel}>当前行索引:</Text>
                <Text style={styles.heartbeatValue}>{heartbeatData.idx}</Text>
              </View>
            )}

            {/* 角度和半径 */}
            {heartbeatData.t !== undefined && (
              <View style={styles.heartbeatRow}>
                <Text style={styles.heartbeatLabel}>角度 (Theta):</Text>
                <Text style={styles.heartbeatValue}>
                  {heartbeatData.t.toFixed(2)} rad
                </Text>
              </View>
            )}

            {heartbeatData.r !== undefined && (
              <View style={styles.heartbeatRow}>
                <Text style={styles.heartbeatLabel}>半径 (Rho):</Text>
                <Text style={styles.heartbeatValue}>
                  {heartbeatData.r.toFixed(2)}
                </Text>
              </View>
            )}

            {/* 速度设置 */}
            {heartbeatData.led_sp !== undefined && (
              <View style={styles.heartbeatRow}>
                <Text style={styles.heartbeatLabel}>LED 速度:</Text>
                <Text style={styles.heartbeatValue}>
                  {heartbeatData.led_sp}/255
                </Text>
              </View>
            )}

            {heartbeatData.ball_sp !== undefined && (
              <View style={styles.heartbeatRow}>
                <Text style={styles.heartbeatLabel}>钢珠速度:</Text>
                <Text style={styles.heartbeatValue}>
                  {heartbeatData.ball_sp}/255
                </Text>
              </View>
            )}

            {/* 图案和音频 */}
            {heartbeatData.pattern_id !== null && heartbeatData.pattern_id !== undefined && (
              <View style={styles.heartbeatRow}>
                <Text style={styles.heartbeatLabel}>图案 ID:</Text>
                <Text style={styles.heartbeatValue}>{heartbeatData.pattern_id}</Text>
              </View>
            )}

            {heartbeatData.sound_id !== undefined && (
              <View style={styles.heartbeatRow}>
                <Text style={styles.heartbeatLabel}>音频 ID:</Text>
                <Text style={styles.heartbeatValue}>{heartbeatData.sound_id}</Text>
              </View>
            )}

            {/* 错误码 */}
            {heartbeatData.err !== undefined && heartbeatData.err !== 0 && (
              <View style={styles.heartbeatRow}>
                <Text style={[styles.heartbeatLabel, styles.errorText]}>错误码:</Text>
                <Text style={[styles.heartbeatValue, styles.errorText]}>
                  {heartbeatData.err}
                </Text>
              </View>
            )}

            {/* 最后心跳时间 */}
            {lastHeartbeat && (
              <View style={styles.heartbeatRow}>
                <Text style={styles.heartbeatLabel}>最后心跳:</Text>
                <Text style={styles.heartbeatValue}>
                  {lastHeartbeat.toLocaleTimeString()}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Connect Button */}
        <TouchableOpacity
          style={[styles.connectButton, isConnecting && styles.connectButtonDisabled]}
          onPress={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <Text style={styles.connectButtonText}>配网中...</Text>
          ) : (
            <Text style={styles.connectButtonText}>开始配网</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          注意：请确保设备处于配对模式，并且手机的蓝牙已开启。
        </Text>
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
    flexGrow: 1,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
    lineHeight: 20,
  },
  deviceInfo: {
    backgroundColor: "#E8E8E8",
    borderRadius: 8,
    padding: 16,
    marginBottom: 30,
  },
  deviceInfoText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  label: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 14,
  },
  connectButton: {
    backgroundColor: "#2C2C2C",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  connectButtonDisabled: {
    opacity: 0.6,
  },
  connectButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  note: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 18,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusIndicator: {
    marginRight: 10,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },
  statusTextSuccess: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  statusTextError: {
    color: "#F44336",
    fontWeight: "600",
  },
  infoBox: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#000",
    fontFamily: "monospace",
  },
  heartbeatContainer: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  heartbeatTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  heartbeatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  heartbeatLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  heartbeatValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  colorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  errorText: {
    color: "#F44336",
  },
});

