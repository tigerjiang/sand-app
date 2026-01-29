import { BleManager, Characteristic, Device, State } from "react-native-ble-plx";

// 配网响应状态类型
export interface ProvisionResponse {
  status: number | "fail";
  ip?: string;
  errorCode?: number;
  message?: string;
}

// 配网状态回调类型
export type ProvisionStatusCallback = (response: ProvisionResponse) => void;

class BLEManager {
  private manager: BleManager;
  private connectedDevice: Device | null = null;
  private scanSubscription: any = null;
  private monitorSubscription: any = null;

  constructor() {
    this.manager = new BleManager();
  }

  // 检查蓝牙状态
  async checkBluetoothState(): Promise<boolean> {
    try {
      const state = await this.manager.state();
      return state === State.PoweredOn;
    } catch (error) {
      console.error("检查蓝牙状态失败:", error);
      return false;
    }
  }

  // 开始扫描设备
  startScanning(
    onDeviceFound: (device: Device) => void,
    deviceNamePrefix: string = "OM"
  ): void {
    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error("扫描错误:", error);
        return;
      }

      if (device && device.name && device.name.startsWith(deviceNamePrefix)) {
        onDeviceFound(device);
      }
    });
  }

  // 停止扫描
  stopScanning(): void {
    if (this.scanSubscription) {
      this.scanSubscription.remove();
      this.scanSubscription = null;
    }
    this.manager.stopDeviceScan();
  }

  // 连接到设备
  async connectToDevice(deviceId: string): Promise<Device> {
    try {
      // 如果已连接其他设备，先断开
      if (this.connectedDevice) {
        await this.disconnect();
      }

      const device = await this.manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      this.connectedDevice = device;
      return device;
    } catch (error) {
      console.error("连接设备失败:", error);
      throw error;
    }
  }

  // 断开连接
  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      try {
        // 停止监听
        if (this.monitorSubscription) {
          this.monitorSubscription.remove();
          this.monitorSubscription = null;
        }

        await this.connectedDevice.cancelConnection();
        this.connectedDevice = null;
      } catch (error) {
        console.error("断开连接失败:", error);
        throw error;
      }
    }
  }

  // 发送配网信息
  async sendProvisionData(ssid: string, password: string): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error("设备未连接");
    }

    try {
      // 构建配网数据
      const provisionData = {
        cmd: "PROVISION",
        ssid: ssid,
        password: password,
      };

      const jsonString = JSON.stringify(provisionData);
      // 在 React Native 中使用 btoa 进行 base64 编码
      // 如果 btoa 不可用，可以直接发送 JSON 字符串（根据设备要求）
      let base64String: string;
      try {
        base64String = btoa(unescape(encodeURIComponent(jsonString)));
      } catch (e) {
        // 如果 btoa 不可用，直接使用 JSON 字符串
        base64String = jsonString;
      }

      // 动态查找可写的特征（用于发送配网数据）
      // 根据特征的属性来识别，而不是硬编码 UUID
      const services = await this.connectedDevice.services();
      let writeCharacteristic: Characteristic | null = null;

      // 遍历所有服务和特征，查找可写的特征
      for (const service of services) {
        const characteristics = await service.characteristics();
        // 优先查找支持 writeWithResponse 的特征
        writeCharacteristic = characteristics.find(
          (char) => char.isWritableWithResponse || char.isWritableWithoutResponse
        ) || null;
        if (writeCharacteristic) break;
      }

      if (!writeCharacteristic) {
        throw new Error("未找到可写的特征，请确保设备已正确连接并发现服务");
      }

      // 发送数据
      if (writeCharacteristic.isWritableWithResponse) {
        await writeCharacteristic.writeWithResponse(base64String);
      } else if (writeCharacteristic.isWritableWithoutResponse) {
        await writeCharacteristic.writeWithoutResponse(base64String);
      } else {
        throw new Error("特征不支持写入");
      }
    } catch (error) {
      console.error("发送配网数据失败:", error);
      throw error;
    }
  }

  // 监听配网响应
  startMonitoringProvisionStatus(
    onStatusUpdate: ProvisionStatusCallback
  ): void {
    if (!this.connectedDevice) {
      throw new Error("设备未连接");
    }

    // 动态查找可通知的特征（用于接收配网响应）
    // 根据特征的属性来识别，而不是硬编码 UUID
    this.connectedDevice
      .services()
      .then(async (services) => {
        let notifyCharacteristic: Characteristic | null = null;

        // 遍历所有服务和特征，查找可通知的特征
        for (const service of services) {
          const characteristics = await service.characteristics();
          notifyCharacteristic = characteristics.find(
            (char) => char.isNotifiable
          ) || null;
          if (notifyCharacteristic) break;
        }

        if (!notifyCharacteristic) {
          throw new Error("未找到可通知的特征，请确保设备已正确连接并发现服务");
        }

        // 开始监听
        this.monitorSubscription = notifyCharacteristic.monitor(
          (error, characteristic) => {
            if (error) {
              console.error("监听错误:", error);
              return;
            }

            if (characteristic && characteristic.value) {
              try {
                // 解码 base64 数据（react-native-ble-plx 返回的 value 已经是 base64 字符串）
                let jsonString: string;
                try {
                  // 尝试解码 base64
                  jsonString = decodeURIComponent(escape(atob(characteristic.value)));
                } catch (e) {
                  // 如果不是 base64，直接使用原始值
                  jsonString = characteristic.value;
                }
                const response: ProvisionResponse = JSON.parse(jsonString);
                onStatusUpdate(response);
              } catch (parseError) {
                console.error("解析响应失败:", parseError);
              }
            }
          }
        );
      })
      .catch((error) => {
        console.error("开始监听失败:", error);
        throw error;
      });
  }

  // 停止监听
  stopMonitoring(): void {
    if (this.monitorSubscription) {
      this.monitorSubscription.remove();
      this.monitorSubscription = null;
    }
  }

  // 销毁管理器
  destroy(): void {
    this.stopScanning();
    this.stopMonitoring();
    if (this.connectedDevice) {
      this.connectedDevice.cancelConnection().catch(console.error);
    }
  }
}

// 导出单例
export const bleManager = new BLEManager();

