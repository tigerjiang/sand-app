# MeditativeSand App

这是一个基于 Expo 的移动应用，用于控制和管理 Oasis 设备。

## 功能特性

1. **启动页面** - 应用启动时的欢迎界面
2. **登录页面** - 支持邮箱密码登录和社交登录（Facebook/Google）
3. **注册界面** - 支持通过 Facebook、Google 或邮箱注册
4. **语言选择** - 注册时选择偏好语言
5. **用户信息设置** - 填写用户名、密码等个人信息
6. **注册完成页面** - 注册成功后的确认页面
7. **设备设置页面** - 扫描并列出以 "OM" 开头的蓝牙设备
8. **设备连接和配网** - 通过蓝牙配置设备的 WiFi 连接
9. **主页面** - 包含 4 个标签页：
   - Device（设备管理）
   - Playlist（播放列表）
   - Community（社区）
   - Settings（设置）

## 技术栈

- Expo Router（基于文件的路由）
- React Native
- TypeScript
- Expo SDK 54

## 开始使用

1. 安装依赖

   ```bash
   npm install
   ```

2. 启动应用

   ```bash
   npx expo start
   ```

## 蓝牙功能集成说明

当前应用使用模拟数据来演示蓝牙扫描功能。要集成真实的蓝牙功能，您需要：

1. 安装蓝牙库（需要开发构建，不支持 Expo Go）：

   ```bash
   npm install react-native-ble-plx
   ```

2. 创建开发构建：

   ```bash
   npx expo prebuild
   npx expo run:ios
   # 或
   npx expo run:android
   ```

3. 在 `app/device-setup.tsx` 和 `app/device-connect.tsx` 中，按照代码注释中的示例替换模拟实现。

4. 更新 `app.json` 添加蓝牙权限（已在配置中）。

## 项目结构

```
app/
├── index.tsx              # 启动页面
├── login.tsx              # 登录页面
├── register.tsx           # 注册页面
├── language.tsx           # 语言选择页面
├── profile.tsx            # 用户信息设置页面
├── congratulations.tsx    # 注册完成页面
├── device-setup.tsx       # 设备设置页面
├── device-connect.tsx     # 设备连接和配网页面
└── (tabs)/                # 主页面标签
    ├── _layout.tsx        # 标签页布局
    ├── device.tsx         # 设备管理
    ├── playlist.tsx       # 播放列表
    ├── community.tsx      # 社区
    └── settings.tsx       # 设置
```

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

## 注意事项

- 蓝牙功能需要在实际设备上测试，模拟器不支持蓝牙
- 社交登录（Facebook/Google）需要配置相应的 OAuth 凭据
- 用户认证功能目前为演示实现，需要集成后端 API
- Android 构建需要 CMake 3.31.6 或更高版本（用于 react-native-worklets）

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
