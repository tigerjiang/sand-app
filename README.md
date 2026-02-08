# MeditativeSand App

这是一个基于 Expo 的移动应用，用于控制和管理 Meditative 设备。支持蓝牙配网、MQTT 通信和设备远程控制。

## 功能特性

### 用户认证与设置

1. **启动页面** - 应用启动时的欢迎界面
2. **登录页面** - 支持邮箱密码登录和社交登录（Facebook/Google）
3. **注册界面** - 支持通过 Facebook、Google 或邮箱注册
4. **语言选择** - 注册时选择偏好语言
5. **用户信息设置** - 填写用户名、密码等个人信息
6. **注册完成页面** - 注册成功后的确认页面

### 设备管理

1. **设备扫描** - 通过蓝牙扫描附近的 Meditative 设备（以 "OM" 开头）
2. **蓝牙配网** - 通过蓝牙配置设备的 WiFi 连接
   - 自动发现蓝牙服务和特征
   - 发送 WiFi SSID 和密码
   - 监听配网状态（配网中/连接路由器/配网成功/配网失败）
3. **MQTT 连接** - 配网成功后自动连接 MQTT 服务器
   - 服务器地址：`47.92.105.156:18830`
   - 自动订阅设备主题
4. **设备状态监控** - 实时监听设备心跳和状态信息
    - 设备运行状态（待机/运行中/升级中）
    - LED 灯光状态和颜色
    - 播放进度和图案信息
    - 设备参数（速度、亮度等）

### 设备控制

1. **远程指令控制** - 通过 MQTT 发送控制指令
    - 开关机控制
    - LED 灯光控制（开关、颜色、亮度、速度、转向、循环模式）
    - 播放控制（播放/暂停）
    - 钢珠速度控制
    - 图案播放（在线图案/SD卡图案）
    - 白噪音控制
    - 设备设置（名称、睡眠时间、间隔时间等）
    - 图案管理（导入、删除、获取列表）

### 主页面

1. **主页面** - 包含 4 个标签页：
    - Device（设备管理）
    - Playlist（播放列表）
    - Community（社区）
    - Settings（设置）

## 技术栈

- **框架**: Expo Router（基于文件的路由）
- **语言**: TypeScript
- **运行时**: React Native 0.81.5
- **SDK**: Expo SDK 54
- **蓝牙**: react-native-ble-plx ^3.5.0
- **MQTT**: mqtt ^5.10.1
- **状态管理**: React Hooks
- **UI组件**: React Native 原生组件 + @expo/vector-icons

## 开始使用

1. 安装依赖

   ```bash
   npm install
   ```

2. 启动应用

   ```bash
   npx expo start
   ```

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- iOS: Xcode 14+ (macOS)
- Android: Android Studio 和 Android SDK

### 安装步骤

1. **安装依赖**

   ```bash
   npm install
   ```

2. **启动开发服务器**

   ```bash
   npx expo start
   ```

3. **运行应用**

   - **iOS**: 按 `i` 键在 iOS 模拟器中打开
   - **Android**: 按 `a` 键在 Android 模拟器中打开
   - **真机**: 使用 Expo Go 应用扫描二维码

   > ⚠️ **注意**: 蓝牙和 MQTT 功能需要在真实设备上测试，不支持 Expo Go 和模拟器。

4. **创建开发构建**（用于蓝牙和 MQTT 功能）

   ```bash
   # iOS
   npx expo prebuild
   npx expo run:ios

   # Android
   npx expo prebuild
   npx expo run:android
   ```

## 项目结构

```
sand-app/
├── app/                          # 应用页面（基于文件的路由）
│   ├── index.tsx                # 启动页面
│   ├── login.tsx                # 登录页面
│   ├── register.tsx             # 注册页面
│   ├── language.tsx             # 语言选择页面
│   ├── profile.tsx              # 用户信息设置页面
│   ├── congratulations.tsx      # 注册完成页面
│   ├── device-setup.tsx         # 设备扫描页面
│   ├── device-connect.tsx       # 设备配网页面
│   ├── color-picker.tsx         # 颜色选择器
│   ├── white-noise-picker.tsx   # 白噪音选择器
│   ├── _layout.tsx              # 根布局
│   └── (tabs)/                  # 主页面标签
│       ├── _layout.tsx          # 标签页布局
│       ├── device.tsx           # 设备管理
│       ├── playlist.tsx         # 播放列表
│       ├── community.tsx        # 社区
│       └── settings.tsx         # 设置
├── utils/                        # 工具类
│   ├── bleManager.ts            # 蓝牙管理器
│   ├── mqttManager.ts           # MQTT 管理器
│   ├── deviceManager.ts         # 设备管理器
│   └── deviceCommand.ts         # 设备指令工具类
├── contexts/                     # React Context
│   ├── I18nContext.tsx          # 国际化上下文
│   └── ThemeContext.tsx         # 主题上下文
├── assets/                       # 静态资源
│   ├── images/                  # 图片资源
│   ├── svg/                     # SVG 图案
│   └── thr/                     # THR 图案文件
├── app.json                      # Expo 配置文件
├── package.json                 # 项目依赖
└── tsconfig.json                # TypeScript 配置
```

## 核心功能详解

### 1. 蓝牙配网流程

#### 1.1 设备扫描

使用 `bleManager` 扫描附近的蓝牙设备：

```typescript
import { bleManager } from "../utils/bleManager";

// 开始扫描
bleManager.startScanning((device) => {
  if (device.name && device.name.startsWith("OM")) {
    // 找到 Meditative 设备
    console.log("发现设备:", device.name, device.id);
  }
}, "OM");

// 停止扫描
bleManager.stopScanning();
```

#### 1.2 设备连接与配网

1. **连接设备**

   ```typescript
   await bleManager.connectToDevice(deviceId);
   ```

2. **发送 WiFi 配置**

   ```typescript
   await bleManager.sendProvisionData(ssid, password);
   ```

3. **监听配网状态**

   ```typescript
   bleManager.startMonitoringProvisionStatus((response) => {
     if (response.status === 3) {
       // 配网成功，包含 IP 地址
       console.log("配网成功，设备 IP:", response.ip);
     } else if (response.status === "fail") {
       // 配网失败
       console.error("配网失败:", response.errorCode, response.message);
     }
   });
   ```

#### 1.3 配网状态说明

- `status: 1` - 配网中
- `status: 2` - 连接路由器
- `status: 3` - 配网成功（包含 `ip` 字段）
- `status: "fail"` - 配网失败（包含 `errorCode` 和 `message`）

#### 1.4 错误码

- `2001` - Wi-Fi 密码错误
- `2002` - 未找到 Wi-Fi
- `2003` - 连接超时
- `2004` - 不支持的加密方式

### 2. MQTT 通信

#### 2.1 MQTT 连接

配网成功后自动连接 MQTT 服务器：

```typescript
import { mqttManager } from "../utils/mqttManager";

// 连接 MQTT 服务器
await mqttManager.connect({
  topics: [
    `heartbeat/${deviceMac}`,
    `devicelinfo/${deviceMac}`
  ]
});

// 监听连接状态
mqttManager.onStatus((status, error) => {
  if (status === "connected") {
    console.log("MQTT 已连接");
  }
});
```

#### 2.2 MQTT 主题

- **指令下发**: `command/{设备MAC}` - 用于发送控制指令
- **心跳上报**: `heartbeat/{设备MAC}` - 设备定期上报运行状态
- **设备信息**: `devicelinfo/{设备MAC}` - 设备基础信息上报

#### 2.3 心跳数据监听

```typescript
import { subscribeDeviceTopics, HeartbeatData } from "../utils/deviceManager";

const unsubscribes = subscribeDeviceTopics(
  deviceMac,
  (heartbeat: HeartbeatData) => {
    console.log("设备状态:", heartbeat.state);
    console.log("播放进度:", heartbeat.pct);
    console.log("LED 颜色:", heartbeat.colors);
    // ... 更多字段
  },
  (info) => {
    console.log("设备信息:", info);
  }
);

// 清理时取消订阅
unsubscribes.forEach(unsub => unsub());
```

### 3. 设备指令控制

#### 3.1 基础控制指令

```typescript
import {
  powerCommand,
  lightCommand,
  playCommand,
} from "../utils/deviceCommand";

const deviceMac = "40f520a0fbf4";

// 开机
await powerCommand(deviceMac, 1);

// 开灯
await lightCommand(deviceMac, 1);

// 播放
await playCommand(deviceMac, 1);
```

#### 3.2 LED 控制指令

```typescript
import {
  setLedColorCommand,
  setLedSpeedCommand,
  setLedBrightCommand,
  setLedLSCommand,
  setLedLoopCommand,
  convertColorsToCommandFormat,
} from "../utils/deviceCommand";

// 设置 LED 颜色
const colors = convertColorsToCommandFormat([
  { r: 255, g: 100, b: 50 },
  { r: 245, g: 110, b: 50 },
]);
await setLedColorCommand(deviceMac, colors);

// 设置 LED 速度 (0-255)
await setLedSpeedCommand(deviceMac, 100);

// 设置 LED 亮度 (0-255)
await setLedBrightCommand(deviceMac, 200);

// 设置 LED 转向
await setLedLSCommand(deviceMac, 1); // 1-开启，0-关闭

// 设置 LED 循环模式
await setLedLoopCommand(deviceMac, 1); // 1-开启，0-关闭
```

#### 3.3 播放控制指令

```typescript
import {
  setBallSpeedCommand,
  onlinePlayCommand,
  localPlayCommand,
} from "../utils/deviceCommand";

// 设置钢珠速度 (0-255)
await setBallSpeedCommand(deviceMac, 150);

// 播放在线图案
await onlinePlayCommand(deviceMac, {
  pattern_id: 221,
  url: "http://xxx.com/playlist_03.thr",
  list: [
    { url: "http://xxx.com/playlist_01.thr" },
    { url: "http://xxx.com/playlist_02.thr" },
  ],
});

// 播放 SD 卡图案
await localPlayCommand(deviceMac, "local-01");
```

#### 3.4 设备设置指令

```typescript
import {
  setNameCommand,
  setSleepTimeCommand,
  setGapTimeCommand,
  reverseDrawCommand,
} from "../utils/deviceCommand";

// 设置设备名称
await setNameCommand(deviceMac, "我的沙画设备");

// 设置睡眠时间
await setSleepTimeCommand(deviceMac, {
  on: "9:45",
  off: "23:59",
});

// 设置间隔时间 (1-59 分钟)
await setGapTimeCommand(deviceMac, 5);

// 反向绘制模式
await reverseDrawCommand(deviceMac, 1); // 1-开启，0-关闭
```

#### 3.5 音频控制指令

```typescript
import { soundCommand } from "../utils/deviceCommand";

// 播放白噪音
await soundCommand(deviceMac, {
  sound_id: 123,
  sound_type: 1, // 1-单曲循环，2-列表循环，3-随机播放
});
```

#### 3.6 图案管理指令

```typescript
import {
  importCommand,
  deleteCommand,
  getLocalResCommand,
} from "../utils/deviceCommand";

// 导入图案到 SD 卡
await importCommand(deviceMac, {
  name: "Spinning star",
  url: "http://xxxx.thr",
});

// 删除 SD 卡图案
await deleteCommand(deviceMac, "my-pattern");

// 获取 SD 卡图案列表
await getLocalResCommand(deviceMac);
```

#### 3.7 系统指令

```typescript
import { restartCommand, resetCommand } from "../utils/deviceCommand";

// 重启设备
await restartCommand(deviceMac);

// 恢复出厂设置
await resetCommand(deviceMac);
```

#### 3.8 监听指令响应

```typescript
import { listenCommandResponse } from "../utils/deviceCommand";

const unsubscribe = listenCommandResponse(deviceMac, (response) => {
  if (response.state === 1) {
    console.log("指令执行成功:", response.cmdid);
  } else {
    console.log("指令执行失败:", response.cmdid);
  }
  
  // getLocalRes 响应包含列表
  if (response.list) {
    console.log("图案列表:", response.list);
  }
});

// 清理时取消监听
unsubscribe();
```

### 4. 工具类说明

#### 4.1 bleManager.ts

蓝牙管理器，负责：

- 蓝牙状态检查
- 设备扫描
- 设备连接与断开
- 发送配网数据
- 监听配网响应

#### 4.2 mqttManager.ts

MQTT 管理器，负责：

- MQTT 连接管理
- 主题订阅/取消订阅
- 消息发布
- 消息监听
- 连接状态管理

#### 4.3 deviceManager.ts

设备管理器，提供：

- 设备主题订阅
- MAC 地址提取
- 心跳数据监听
- 设备信息监听

#### 4.4 deviceCommand.ts

设备指令工具类，提供：

- 21 种设备控制指令的封装函数
- 指令响应监听
- 颜色格式转换工具

## Android 构建问题解决

如果遇到 CMake 相关的构建错误，请按照以下步骤解决：

### 方法 1：使用安装脚本（推荐）

```bash
./install-cmake.sh
```

### 方法 2：通过 Android Studio 安装

1. 打开 Android Studio
2. 进入 Preferences > Appearance & Behavior > System Settings > Android SDK
3. 切换到 "SDK Tools" 标签
4. 勾选 "CMake" 并选择版本 3.31.6 或更高
5. 点击 "Apply" 安装

### 方法 3：使用命令行工具

```bash
# 找到你的 Android SDK 路径（通常是 ~/Library/Android/sdk 或 $ANDROID_HOME）
export ANDROID_HOME=~/Library/Android/sdk

# 使用 sdkmanager 安装 CMake
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "cmake;3.31.6"
```

安装完成后，重新运行构建命令。

## 开发指南

### 蓝牙权限配置

应用已配置必要的蓝牙权限：

**iOS** (`app.json`):

```json
{
  "ios": {
    "infoPlist": {
      "NSBluetoothAlwaysUsageDescription": "This app needs Bluetooth to connect to your Meditative devices.",
      "NSBluetoothPeripheralUsageDescription": "This app needs Bluetooth to connect to your Meditative devices."
    }
  }
}
```

**Android** (`app.json`):

```json
{
  "android": {
    "permissions": [
      "android.permission.BLUETOOTH",
      "android.permission.BLUETOOTH_ADMIN",
      "android.permission.BLUETOOTH_SCAN",
      "android.permission.BLUETOOTH_CONNECT",
      "android.permission.ACCESS_FINE_LOCATION"
    ]
  }
}
```

### MQTT 服务器配置

MQTT 服务器配置在 `utils/mqttManager.ts` 中：

```typescript
const MQTT_HOST = "47.92.105.156";
const MQTT_PORT = 18830;
```

如需修改，请编辑该文件。

### 设备 MAC 地址提取

设备 MAC 地址可以从设备名称中提取：

```typescript
import { extractMacFromDeviceName } from "../utils/deviceManager";

const mac = extractMacFromDeviceName("OM251100104");
// 返回: "251100104" (如果符合 MAC 格式)
```

### 错误处理

所有工具函数都包含错误处理，建议使用 try-catch：

```typescript
try {
  await powerCommand(deviceMac, 1);
} catch (error) {
  console.error("发送指令失败:", error);
  // 显示错误提示给用户
}
```

### 最佳实践

1. **资源清理**: 组件卸载时记得取消订阅和断开连接

   ```typescript
   useEffect(() => {
     return () => {
       // 清理 MQTT 监听
       unsubscribes.forEach(unsub => unsub());
       // 断开蓝牙连接
       bleManager.disconnect();
     };
   }, []);
   ```

2. **状态管理**: 使用 React Hooks 管理设备状态

   ```typescript
   const [deviceMac, setDeviceMac] = useState("");
   const [heartbeatData, setHeartbeatData] = useState<HeartbeatData | null>(null);
   ```

3. **指令 ID**: 可以自定义指令 ID 用于跟踪

   ```typescript
   const customId = "my-custom-id-" + Date.now();
   await powerCommand(deviceMac, 1, customId);
   ```

## 注意事项

- ⚠️ **蓝牙功能**: 需要在实际设备上测试，模拟器不支持蓝牙
- ⚠️ **MQTT 连接**: 需要网络连接，确保设备已连接到 WiFi
- ⚠️ **开发构建**: 蓝牙和 MQTT 功能需要开发构建，不支持 Expo Go
- ⚠️ **权限**: Android 需要位置权限才能扫描蓝牙设备
- ⚠️ **社交登录**: Facebook/Google 登录需要配置相应的 OAuth 凭据
- ⚠️ **用户认证**: 用户认证功能目前为演示实现，需要集成后端 API
- ⚠️ **CMake**: Android 构建需要 CMake 3.31.6 或更高版本（用于 react-native-worklets）

## 常见问题

### Q: 为什么扫描不到蓝牙设备？

A: 请检查：

1. 设备蓝牙已开启
2. 应用已获得蓝牙权限
3. Android 设备需要位置权限
4. 设备处于可发现模式
5. 设备名称以 "OM" 开头

### Q: MQTT 连接失败怎么办？

A: 请检查：

1. 设备已成功配网并连接到 WiFi
2. 网络连接正常
3. MQTT 服务器地址和端口正确
4. 防火墙未阻止连接

### Q: 指令发送后没有响应？

A: 请检查：

1. MQTT 连接状态正常
2. 设备 MAC 地址正确
3. 指令格式正确
4. 使用 `listenCommandResponse` 监听响应

### Q: 如何调试蓝牙问题？

A: 查看控制台日志：

```typescript
// 在 bleManager.ts 中已包含详细日志
console.log("蓝牙状态:", await bleManager.checkBluetoothState());
console.log("设备连接:", device);
```

## 协议说明

### 蓝牙配网协议

- **发送格式**: JSON over BLE

  ```json
  {
    "cmd": "PROVISION",
    "ssid": "WiFi名称",
    "password": "WiFi密码"
  }
  ```

- **响应格式**: 通过 BLE Notify 特征返回

  ```json
  {
    "status": 3,
    "ip": "192.168.1.25"
  }
  ```

### MQTT 协议

- **指令格式**: JSON

  ```json
  {
    "scmd": "power",
    "data": { "state": 1 },
    "cmdid": "1647840542895",
    "mac": "40f520a0fbf4"
  }
  ```

- **响应格式**: JSON

  ```json
  {
    "state": 1,
    "cmdid": "1647840542895"
  }
  ```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目为私有项目。

## 相关资源

- [Expo 文档](https://docs.expo.dev/)
- [React Native 文档](https://reactnative.dev/)
- [react-native-ble-plx 文档](https://github.com/dotintent/react-native-ble-plx)
- [MQTT.js 文档](https://github.com/mqttjs/MQTT.js)
