import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Device } from "react-native-ble-plx";
import { useTheme } from "../contexts/ThemeContext";
import { bleManager } from "../utils/bleManager";

interface DeviceInfo {
  id: string;
  name: string;
}

export default function DeviceSetupScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 检查蓝牙状态
  useEffect(() => {
    checkBluetoothState();
    return () => {
      // 组件卸载时清理
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      bleManager.stopScanning();
    };
  }, []);

  const checkBluetoothState = async () => {
    const enabled = await bleManager.checkBluetoothState();
    setBluetoothEnabled(enabled);
    if (!enabled) {
      Alert.alert(
        "蓝牙未开启",
        "请先开启蓝牙功能",
        [{ text: "确定" }]
      );
    }
  };

  // 开始蓝牙扫描
  const startScanning = async () => {
    if (!bluetoothEnabled) {
      Alert.alert("错误", "请先开启蓝牙功能");
      return;
    }

    setIsScanning(true);
    setDevices([]);

    // 使用 Set 来去重
    const foundDevices = new Map<string, DeviceInfo>();

    // 开始扫描
    bleManager.startScanning((device: Device) => {
      if (device.name) {
        foundDevices.set(device.id, {
          id: device.id,
          name: device.name,
        });
        // 更新设备列表
        setDevices(Array.from(foundDevices.values()));
      }
    }, "OM");

    // 10秒后停止扫描
    scanTimeoutRef.current = setTimeout(() => {
      bleManager.stopScanning();
      setIsScanning(false);
    }, 10000);
  };

  const stopScanning = () => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    bleManager.stopScanning();
    setIsScanning(false);
  };

  const handleConnect = (device: DeviceInfo) => {
    router.push({
      pathname: "/device-connect",
      params: { deviceId: device.id, deviceName: device.name },
    });
  };

  const handleAddNewDevice = () => {
    if (!bluetoothEnabled) {
      Alert.alert("错误", "请先开启蓝牙功能");
      return;
    }
    if (!isScanning) {
      startScanning();
    } else {
      stopScanning();
    }
  };

  const backgroundColor = isDark ? "#000000" : "#F5F5F0";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const subtitleColor = isDark ? "#8E8E93" : "#666";
  const headerBgColor = isDark ? "#1C1C1E" : "#2C2C2C";
  const searchingBgColor = isDark ? "#1C1C1E" : "#FFF";
  const deviceItemBgColor = isDark ? "#1C1C1E" : "#FFF";
  const deviceItemBorderColor = isDark ? "#3A3A3C" : "#000";
  const indicatorColor = isDark ? "#FFFFFF" : "#2C2C2C";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBgColor }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>DEVICES</Text>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="menu" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.title, { color: textColor }]}>Welcome to Oasis Control</Text>
        <Text style={[styles.subtitle, { color: subtitleColor }]}>
          We'll guide you through your device setup...
        </Text>

        {isScanning && (
          <View style={[styles.searchingContainer, { backgroundColor: searchingBgColor }]}>
            <ActivityIndicator size="small" color={indicatorColor} />
            <Text style={[styles.searchingText, { color: textColor }]}>Searching your devices</Text>
          </View>
        )}

        {devices.length > 0 && (
          <View style={styles.devicesSection}>
            <Text style={[styles.devicesTitle, { color: textColor }]}>Available Devices</Text>
            <Text style={[styles.devicesSubtitle, { color: subtitleColor }]}>Select the device you want to connect:</Text>

            {devices.map((device) => (
              <View key={device.id} style={[styles.deviceItem, { backgroundColor: deviceItemBgColor, borderColor: deviceItemBorderColor }]}>
                <Text style={[styles.deviceName, { color: textColor }]}>{device.name}</Text>
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={() => handleConnect(device)}
                >
                  <Text style={styles.connectButtonText}>CONNECT</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {!isScanning && devices.length === 0 && (
          <View style={styles.infoContainer}>
            <Text style={[styles.infoText, { color: subtitleColor }]}>
              点击"ADD NEW DEVICE"按钮开始扫描附近的 Oasis 设备
            </Text>
            <Text style={[styles.infoText, { color: subtitleColor }]}>
              Your Oasis Device requires an internet connection to control the device and add patterns
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add New Device Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addButton, (!bluetoothEnabled || isScanning) && styles.addButtonDisabled]}
          onPress={handleAddNewDevice}
          disabled={!bluetoothEnabled}
        >
          <Text style={styles.addButtonText}>
            {isScanning ? "停止扫描" : "ADD NEW DEVICE"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E0E0E0",
    letterSpacing: 1,
  },
  menuButton: {
    padding: 8,
  },
  mainContent: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 30,
  },
  searchingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchingText: {
    marginLeft: 10,
    fontSize: 16,
  },
  devicesSection: {
    marginTop: 20,
  },
  devicesTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  devicesSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  deviceName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  connectButton: {
    backgroundColor: "#2C2C2C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  connectButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  infoContainer: {
    marginTop: 20,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  addButton: {
    backgroundColor: "#2C2C2C",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
});

