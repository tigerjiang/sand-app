// MQTT 服务器配置
const MQTT_HOST = "47.92.105.156";
const MQTT_PORT = 18830;

// MQTT 消息类型
export interface MQTTMessage {
  topic: string;
  payload: any;
  timestamp?: number;
}

// MQTT 状态回调类型
export type MQTTStatusCallback = (status: "connected" | "disconnected" | "error", error?: Error) => void;
export type MQTTMessageCallback = (message: MQTTMessage) => void;

class MQTTManager {
  private client: any = null;
  private isConnected: boolean = false;
  private messageCallbacks: Set<MQTTMessageCallback> = new Set();
  private statusCallbacks: Set<MQTTStatusCallback> = new Set();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private clientId: string = "";

  constructor() {
    // 生成唯一的客户端 ID
    this.clientId = `mobile_app_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  // 连接 MQTT 服务器
  async connect(options?: {
    username?: string;
    password?: string;
    topics?: string[]; // 要订阅的主题列表
  }): Promise<void> {
    if (this.isConnected && this.client) {
      console.log("MQTT 已经连接");
      return;
    }

    try {
      // 动态导入 mqtt 库
      const mqtt = await import("mqtt");

      // React Native 中使用 TCP 连接（mqtt://）
      // 注意：React Native 环境需要使用 TCP 连接，WebSocket 可能需要额外配置
      const connectOptions: any = {
        clientId: this.clientId,
        clean: true,
        keepalive: 60,
        reconnectPeriod: 5000,
        connectTimeout: 30000,
        host: MQTT_HOST,
        port: MQTT_PORT,
        protocol: "mqtt" as const,
        protocolVersion: 4, // MQTT 3.1.1
      };

      // 如果需要用户名和密码
      if (options?.username) {
        connectOptions.username = options.username;
      }
      if (options?.password) {
        connectOptions.password = options.password;
      }

      // 构建连接 URL（使用 TCP）
      const url = `mqtt://${MQTT_HOST}:${MQTT_PORT}`;

      // 创建客户端
      this.client = mqtt.connect(url, connectOptions);

      // 监听连接事件
      this.client.on("connect", () => {
        console.log("MQTT 连接成功");
        this.isConnected = true;
        this.notifyStatus("connected");

        // 订阅默认主题（如果有）
        if (options?.topics && options.topics.length > 0) {
          options.topics.forEach((topic) => {
            this.subscribe(topic);
          });
        }
      });

      // 监听重连事件
      this.client.on("reconnect", () => {
        console.log("MQTT 正在重连...");
      });

      // 监听错误事件
      this.client.on("error", (error: Error) => {
        console.error("MQTT 错误:", error);
        this.notifyStatus("error", error);
      });

      // 监听断开事件
      this.client.on("close", () => {
        console.log("MQTT 连接已关闭");
        this.isConnected = false;
        this.notifyStatus("disconnected");
      });

      // 监听离线事件
      this.client.on("offline", () => {
        console.log("MQTT 已离线");
        this.isConnected = false;
        this.notifyStatus("disconnected");
      });

      // 监听消息事件
      this.client.on("message", (topic: string, payload: Buffer) => {
        try {
          const messageStr = payload.toString();
          let messageData: any;

          // 尝试解析 JSON
          try {
            messageData = JSON.parse(messageStr);
          } catch (e) {
            // 如果不是 JSON，直接使用字符串
            messageData = messageStr;
          }

          const message: MQTTMessage = {
            topic,
            payload: messageData,
            timestamp: Date.now(),
          };

          console.log("收到 MQTT 消息:", topic, messageData);
          this.notifyMessage(message);
        } catch (error) {
          console.error("处理 MQTT 消息失败:", error);
        }
      });
    } catch (error) {
      console.error("MQTT 连接失败:", error);
      throw error;
    }
  }

  // 订阅主题
  subscribe(topic: string, qos: 0 | 1 | 2 = 0): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.isConnected) {
        reject(new Error("MQTT 未连接"));
        return;
      }

      this.client.subscribe(topic, { qos }, (error: Error | null) => {
        if (error) {
          console.error(`订阅主题 ${topic} 失败:`, error);
          reject(error);
        } else {
          console.log(`成功订阅主题: ${topic}`);
          resolve();
        }
      });
    });
  }

  // 取消订阅主题
  unsubscribe(topic: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.isConnected) {
        reject(new Error("MQTT 未连接"));
        return;
      }

      this.client.unsubscribe(topic, (error: Error | null) => {
        if (error) {
          console.error(`取消订阅主题 ${topic} 失败:`, error);
          reject(error);
        } else {
          console.log(`成功取消订阅主题: ${topic}`);
          resolve();
        }
      });
    });
  }

  // 发布消息
  publish(topic: string, message: any, qos: 0 | 1 | 2 = 0): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.isConnected) {
        reject(new Error("MQTT 未连接"));
        return;
      }

      const messageStr = typeof message === "string" ? message : JSON.stringify(message);

      this.client.publish(topic, messageStr, { qos }, (error: Error | null) => {
        if (error) {
          console.error(`发布消息到 ${topic} 失败:`, error);
          reject(error);
        } else {
          console.log(`成功发布消息到 ${topic}`);
          resolve();
        }
      });
    });
  }

  // 添加消息监听器
  onMessage(callback: MQTTMessageCallback): () => void {
    this.messageCallbacks.add(callback);
    // 返回取消监听的函数
    return () => {
      this.messageCallbacks.delete(callback);
    };
  }

  // 添加状态监听器
  onStatus(callback: MQTTStatusCallback): () => void {
    this.statusCallbacks.add(callback);
    // 返回取消监听的函数
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  // 通知消息监听器
  private notifyMessage(message: MQTTMessage): void {
    this.messageCallbacks.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error("消息回调执行失败:", error);
      }
    });
  }

  // 通知状态监听器
  private notifyStatus(status: "connected" | "disconnected" | "error", error?: Error): void {
    this.statusCallbacks.forEach((callback) => {
      try {
        callback(status, error);
      } catch (err) {
        console.error("状态回调执行失败:", err);
      }
    });
  }

  // 断开连接
  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.client) {
      return new Promise((resolve) => {
        this.client.end(false, {}, () => {
          console.log("MQTT 已断开连接");
          this.client = null;
          this.isConnected = false;
          this.messageCallbacks.clear();
          this.statusCallbacks.clear();
          resolve();
        });
      });
    }
  }

  // 获取连接状态
  getConnected(): boolean {
    return this.isConnected;
  }

  // 获取客户端 ID
  getClientId(): string {
    return this.clientId;
  }
}

// 导出单例
export const mqttManager = new MQTTManager();

