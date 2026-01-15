import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Device {
  id: string;
  name: string;
}

// 模拟的蓝牙设备数据
// 在实际应用中，您需要使用 react-native-ble-plx 或类似的库来扫描真实的蓝牙设备
const MOCK_DEVICES: Device[] = [
  { id: "1", name: "OM251100104" },
  { id: "2", name: "OM251100105" },
  { id: "3", name: "OM251100106" },
];

export default function DeviceSetupScreen() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);

  // 模拟蓝牙扫描
  const startScanning = async () => {
    setIsScanning(true);
    setDevices([]);

    // 模拟扫描过程
    setTimeout(() => {
      // 模拟找到设备
      setDevices(MOCK_DEVICES);
      setIsScanning(false);
    }, 2000);

    /* 
    实际蓝牙扫描代码示例（需要安装 react-native-ble-plx）:
    
    import { BleManager } from 'react-native-ble-plx';
    const manager = new BleManager();
    
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        return;
      }
      if (device && device.name && device.name.startsWith('OM')) {
        setDevices(prevDevices => {
          const exists = prevDevices.some(d => d.id === device.id);
          if (!exists) {
            return [...prevDevices, { id: device.id, name: device.name }];
          }
          return prevDevices;
        });
      }
    });
    
    setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
    */
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const handleConnect = (device: Device) => {
    router.push({
      pathname: "/device-connect",
      params: { deviceId: device.id, deviceName: device.name },
    });
  };

  const handleAddNewDevice = () => {
    if (!bluetoothEnabled) {
      // 提示用户开启蓝牙
      alert("Please enable Bluetooth first");
      return;
    }
    if (!isScanning) {
      startScanning();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>DEVICES</Text>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="menu" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Welcome to Oasis Control</Text>
        <Text style={styles.subtitle}>
          We'll guide you through your device setup...
        </Text>

        {isScanning && (
          <View style={styles.searchingContainer}>
            <ActivityIndicator size="small" color="#2C2C2C" />
            <Text style={styles.searchingText}>Searching your devices</Text>
          </View>
        )}

        {devices.length > 0 && (
          <View style={styles.devicesSection}>
            <Text style={styles.devicesTitle}>Available Devices</Text>
            <Text style={styles.devicesSubtitle}>Select the device you want to connect:</Text>

            {devices.map((device) => (
              <View key={device.id} style={styles.deviceItem}>
                <Text style={styles.deviceName}>{device.name}</Text>
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
            <Text style={styles.infoText}>
              Your Oasis Device requires an internet connection to control the device and add patterns
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add New Device Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddNewDevice}>
          <Text style={styles.addButtonText}>ADD NEW DEVICE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F0",
  },
  header: {
    backgroundColor: "#2C2C2C",
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
    color: "#000",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
  },
  searchingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
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
    color: "#000",
  },
  devicesSection: {
    marginTop: 20,
  },
  devicesTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  devicesSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#000",
  },
  deviceName: {
    flex: 1,
    fontSize: 16,
    color: "#000",
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
    color: "#666",
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
});

