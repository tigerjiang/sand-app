import { mqttManager } from "./mqttManager";

// 设备指令接口
export interface DeviceCommand {
  cmd: string;
  [key: string]: any;
}

// 设备信息接口
export interface DeviceInfo {
  mac: string;
  name?: string;
  ip?: string;
  status?: string;
  [key: string]: any;
}

// LED 颜色接口
export interface LEDColor {
  r: number;
  g: number;
  b: number;
}

// 设备状态枚举
export enum DeviceState {
  STANDBY = 1,    // 待机
  RUNNING = 2,    // 开机
  UPDATING = 3,   // 升级中
}

// 设备心跳数据接口
export interface HeartbeatData {
  ID: string;                    // 设备唯一标识（MAC地址）
  ver?: number;                  // version number
  fwver?: string;                // 固件版本号
  state?: DeviceState;           // 设备状态（1-待机，2-开机，3-升级中）
  light?: number;                // 灯光，取值范围：0-1
  play?: number;                 // 播放状态，取值范围：0-1
  colors?: LEDColor[];           // Led colors数组
  led_sp?: number;               // Led速度，取值范围：0-255
  led_ls?: number;               // 灯光转向：0-1
  led_lp?: number;               // led循环模式 0-1
  led_bright?: number;           // Led 灯亮度 0-255
  ball_sp?: number;              // 钢珠速度 0-255
  reverse_draw?: number;         // 反向绘制模式 0-1
  sleep_on?: number | null;     // 睡眠开启时间
  sleep_off?: number | null;     // 睡眠关闭时间
  gap_time?: number;             // 间隔时间 取值1-59
  pattern_id?: number | null;    // 当前播放图案id，本地保持为null
  sound_id?: number;             // 白噪音音频id
  sound_type?: number;           // 音频播放模式
  t?: number;                    // 当前角度 (Theta): 机器人此刻的绝对弧度值
  r?: number;                    // 当前半径 (Rho): 0.0 到 1.0
  idx?: number;                  // 当前行索引: 对应 .thr 文件中的第几行
  pct?: number;                  // 进度百分比: 方便手机端直接显示进度条
  ts?: number;                   // 时间戳: 用于计算延迟或校准
  err?: number;                  // 错误码
}

/**
 * 发送指令到设备（已废弃，请使用 deviceCommand.ts 中的具体指令函数）
 * @deprecated 请使用 deviceCommand.ts 中的具体指令函数，如 powerCommand, lightCommand 等
 */
export async function sendCommandToDevice(mac: string, command: DeviceCommand): Promise<void> {
  console.warn("sendCommandToDevice 已废弃，请使用 deviceCommand.ts 中的具体指令函数");
  
  if (!mac) {
    throw new Error("设备 MAC 地址不能为空");
  }

  if (!mqttManager.getConnected()) {
    throw new Error("MQTT 未连接，请先连接 MQTT 服务器");
  }

  try {
    const commandTopic = `command/${mac}`;
    await mqttManager.publish(commandTopic, command);
    console.log("指令已发送:", commandTopic, command);
  } catch (error) {
    console.error("发送指令失败:", error);
    throw error;
  }
}

/**
 * 订阅设备主题
 * @param mac 设备 MAC 地址
 * @param onHeartbeat 心跳消息回调
 * @param onDeviceInfo 设备信息回调
 * @returns 取消订阅的函数数组
 */
export function subscribeDeviceTopics(
  mac: string,
  onHeartbeat?: (data: HeartbeatData) => void,
  onDeviceInfo?: (info: DeviceInfo) => void
): (() => void)[] {
  const unsubscribes: (() => void)[] = [];

  if (!mac) {
    console.warn("设备 MAC 地址为空，无法订阅主题");
    return unsubscribes;
  }

  const heartbeatTopic = `heartbeat/${mac}`;
  const deviceInfoTopic = `devicelinfo/${mac}`;

  // 订阅心跳主题
  mqttManager.subscribe(heartbeatTopic).catch((error) => {
    console.error(`订阅心跳主题失败: ${heartbeatTopic}`, error);
  });

  // 订阅设备信息主题
  mqttManager.subscribe(deviceInfoTopic).catch((error) => {
    console.error(`订阅设备信息主题失败: ${deviceInfoTopic}`, error);
  });

  // 监听消息
  const messageUnsubscribe = mqttManager.onMessage((message) => {
    if (message.topic === heartbeatTopic && onHeartbeat) {
      // 解析心跳数据
      let heartbeatData: HeartbeatData;
      if (typeof message.payload === "object" && message.payload !== null) {
        heartbeatData = message.payload as HeartbeatData;
      } else {
        // 如果不是对象，尝试解析 JSON
        try {
          heartbeatData = JSON.parse(message.payload as string) as HeartbeatData;
        } catch (e) {
          console.error("解析心跳数据失败:", e);
          return;
        }
      }
      
      // 确保 ID 字段存在（使用 MAC 地址）
      if (!heartbeatData.ID) {
        heartbeatData.ID = mac;
      }
      
      onHeartbeat(heartbeatData);
    } else if (message.topic === deviceInfoTopic && onDeviceInfo) {
      const info: DeviceInfo = {
        mac,
        ...(typeof message.payload === "object" ? message.payload : {}),
      };
      onDeviceInfo(info);
    }
  });

  unsubscribes.push(messageUnsubscribe);

  return unsubscribes;
}

/**
 * 取消订阅设备主题
 * @param mac 设备 MAC 地址
 */
export async function unsubscribeDeviceTopics(mac: string): Promise<void> {
  if (!mac) {
    return;
  }

  const heartbeatTopic = `heartbeat/${mac}`;
  const deviceInfoTopic = `devicelinfo/${mac}`;

  try {
    await mqttManager.unsubscribe(heartbeatTopic);
    await mqttManager.unsubscribe(deviceInfoTopic);
    console.log(`已取消订阅设备主题: ${mac}`);
  } catch (error) {
    console.error(`取消订阅设备主题失败: ${mac}`, error);
  }
}

/**
 * 从设备名称中提取 MAC 地址
 * @param deviceName 设备名称
 * @returns MAC 地址（如果找到）
 */
export function extractMacFromDeviceName(deviceName: string): string {
  if (!deviceName) return "";

  // 移除可能的空格和特殊字符，转换为小写
  const cleaned = deviceName.replace(/[:\s-]/g, "").toLowerCase();

  // 检查是否是有效的 MAC 地址格式（12 位十六进制字符）
  if (/^[0-9a-f]{12}$/.test(cleaned)) {
    return cleaned;
  }

  // 如果设备名称以 "OM" 开头，可能是设备型号+MAC，尝试提取后面的部分
  if (deviceName.startsWith("OM")) {
    const macPart = deviceName.substring(2).replace(/[:\s-]/g, "").toLowerCase();
    if (/^[0-9a-f]{12}$/.test(macPart)) {
      return macPart;
    }
  }

  return "";
}

