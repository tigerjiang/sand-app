import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// 注意：实际蓝牙配网需要使用 react-native-ble-plx 或类似库
// 这里提供的是模拟实现

export default function DeviceConnectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const deviceId = params.deviceId as string;
  const deviceName = params.deviceName as string;

  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!ssid || !password) {
      Alert.alert("Error", "Please enter both SSID and password");
      return;
    }

    setIsConnecting(true);

    try {
      // 模拟配网过程
      await new Promise((resolve) => setTimeout(resolve, 2000));

      /* 
      实际蓝牙配网代码示例（需要安装 react-native-ble-plx）:
      
      import { BleManager } from 'react-native-ble-plx';
      const manager = new BleManager();
      
      const device = await manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      
      // 找到配网服务特征
      const service = await device.services();
      const characteristic = await service[0].characteristics();
      
      // 发送WiFi配置数据
      const configData = JSON.stringify({ ssid, password });
      await characteristic[0].writeWithResponse(configData);
      
      await device.cancelConnection();
      */

      // 配网成功后跳转到主页面
      Alert.alert("Success", "Device configured successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/device"),
        },
      ]);
    } catch (error) {
      console.error("Connection error:", error);
      Alert.alert("Error", "Failed to configure device. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.title}>Device Setup</Text>
        <Text style={styles.subtitle}>
          Welcome zehu. Now let's set up your new Oasis Kinetic device:
        </Text>

        {/* Device Info */}
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceInfoText}>Device: {deviceName}</Text>
        </View>

        {/* WiFi SSID Input */}
        <Text style={styles.label}>WiFi SSID (2.4GHz)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter WiFi SSID"
          placeholderTextColor="#999"
          value={ssid}
          onChangeText={setSsid}
          autoCapitalize="none"
        />

        {/* WiFi Password Input */}
        <Text style={styles.label}>WiFi Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter WiFi Password"
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

        {/* Connect Button */}
        <TouchableOpacity
          style={[styles.connectButton, isConnecting && styles.connectButtonDisabled]}
          onPress={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <Text style={styles.connectButtonText}>CONNECTING...</Text>
          ) : (
            <Text style={styles.connectButtonText}>CONNECT</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          Note: Make sure your device is in pairing mode and your phone's Bluetooth is enabled.
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
});

