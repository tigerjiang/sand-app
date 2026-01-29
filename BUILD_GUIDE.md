# 应用打包指南

本文档介绍如何将 MeditativeSand 应用打包成 Android APK 或 iOS 安装包。

## 方式一：使用 EAS Build（推荐）⭐

EAS Build 是 Expo 提供的云端构建服务，无需配置本地原生开发环境。

### 1. 安装 EAS CLI

```bash
npm install -g eas-cli
```

### 2. 登录 Expo 账号

```bash
eas login
```

如果没有账号，先注册：https://expo.dev/signup

### 3. 配置 EAS Build

```bash
eas build:configure
```

这会创建一个 `eas.json` 配置文件。

### 4. 构建 Android APK

```bash
# 构建 APK（可直接安装）
eas build --platform android --profile preview

# 或者构建 AAB（用于 Google Play 发布）
eas build --platform android --profile production
```

构建完成后，EAS 会提供一个下载链接，你可以下载 APK 文件。

### 5. 构建 iOS 安装包

```bash
# 构建 iOS 开发版本（.ipa）
eas build --platform ios --profile preview

# 或者构建生产版本（用于 App Store）
eas build --platform ios --profile production
```

**注意**：iOS 构建需要：
- Apple Developer 账号（$99/年）
- 在 Apple Developer 中心注册 App ID
- 配置证书和配置文件

### 6. EAS Build 配置文件示例

创建或编辑 `eas.json`：

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## 方式二：本地构建

如果你已经有 Android Studio 和 Xcode，可以使用本地构建。

### Android APK 构建

1. **预构建原生代码**：

```bash
npx expo prebuild
```

2. **生成 APK**：

```bash
# 调试版本
cd android
./gradlew assembleDebug

# 生成的 APK 位置
# android/app/build/outputs/apk/debug/app-debug.apk

# 发布版本（需要配置签名）
./gradlew assembleRelease
# android/app/build/outputs/apk/release/app-release.apk
```

3. **配置签名（发布版本必需）**：

在 `android/app/build.gradle` 中配置签名信息，或使用 `eas build`。

### iOS 构建

1. **预构建原生代码**：

```bash
npx expo prebuild
```

2. **在 Xcode 中构建**：

```bash
# 打开 Xcode 项目
open ios/MeditativeSand.xcworkspace

# 或使用命令行构建
cd ios
pod install
xcodebuild -workspace MeditativeSand.xcworkspace \
  -scheme MeditativeSand \
  -configuration Release \
  -archivePath ./build/MeditativeSand.xcarchive \
  archive
```

3. **导出 IPA**：

在 Xcode 中：
- 选择 Product > Archive
- 在 Organizer 中选择 Archive
- 点击 "Distribute App"
- 选择分发方式（Ad Hoc、App Store 等）

## 快速开始命令

### 使用 EAS Build（推荐）

```bash
# 1. 安装 EAS CLI
npm install -g eas-cli

# 2. 登录
eas login

# 3. 配置
eas build:configure

# 4. 构建 Android APK
eas build --platform android --profile preview

# 5. 构建 iOS（需要 Apple Developer 账号）
eas build --platform ios --profile preview
```

### 使用本地构建

```bash
# Android
npx expo prebuild --platform android
cd android
./gradlew assembleDebug  # 或 assembleRelease

# iOS
npx expo prebuild --platform ios
cd ios
pod install
open MeditativeSand.xcworkspace  # 然后在 Xcode 中构建
```

## 重要提示

1. **Android APK**：
   - `preview` profile 生成 APK，可直接安装
   - `production` profile 生成 AAB，用于 Google Play

2. **iOS IPA**：
   - 需要 Apple Developer 账号（$99/年）
   - 需要配置证书和描述文件
   - 可以使用 EAS 自动管理证书

3. **应用签名**：
   - Android：可以使用 EAS 自动管理或手动配置 keystore
   - iOS：必须使用 Apple 签发的证书

4. **构建时间**：
   - EAS Build：首次构建约 10-20 分钟，后续更快
   - 本地构建：取决于机器性能

5. **推荐方式**：
   - **首次发布**：使用 EAS Build（简单快捷）
   - **频繁构建**：可以配置本地构建环境

## 更多资源

- [EAS Build 文档](https://docs.expo.dev/build/introduction/)
- [Android 打包指南](https://docs.expo.dev/build-reference/apk/)
- [iOS 打包指南](https://docs.expo.dev/build-reference/apple/)
- [应用签名配置](https://docs.expo.dev/app-signing/app-credentials/)

