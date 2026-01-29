import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as DeviceContext from "../contexts/DeviceContext";
import * as I18nContext from "../contexts/I18nContext";
import * as PlaylistContext from "../contexts/PlaylistContext";
import * as ThemeContext from "../contexts/ThemeContext";

const { I18nProvider, useI18n } = I18nContext;
const { PlaylistProvider } = PlaylistContext;
const { ThemeProvider, useTheme } = ThemeContext;
const { DeviceProvider } = DeviceContext;

// 统一的 Header 组件
function CustomHeader({ title }: { title: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const handleMenuPress = () => {
    router.push("/settings");
  };

  const headerBgColor = isDark ? "#1C1C1E" : "#FFF";
  const headerTextColor = isDark ? "#FFF" : "#000";
  const iconColor = isDark ? "#FFF" : "#000";

  return (
    <View style={[headerStyles.header, { paddingTop: insets.top + 20, backgroundColor: headerBgColor }]}>
      <TouchableOpacity onPress={() => router.back()} style={headerStyles.backButton}>
        <Ionicons name="arrow-back" size={24} color={iconColor} />
      </TouchableOpacity>
      <Text style={[headerStyles.headerTitle, { color: headerTextColor }]}>{title}</Text>
      <TouchableOpacity onPress={handleMenuPress} style={headerStyles.menuButton}>
        <Ionicons name="menu" size={24} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    letterSpacing: 1,
  },
  menuButton: {
    padding: 8,
  },
  circleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  waveIcon: {
    width: 20,
    height: 20,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  waveCircle: {
    position: "absolute",
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },
});

function RootLayoutContent() {
  const { isDark } = useTheme();

  const headerBgColor = isDark ? "#1C1C1E" : "#FFF";
  const headerTextColor = isDark ? "#FFF" : "#000";
  const iconColor = isDark ? "#FFF" : "#000";
  const circleBgColor = isDark ? "#2C2C2E" : "#F0F0F0";
  const waveColor = isDark ? "#FFF" : "#000";

  return (
    <View style={[headerStyles.header, { paddingTop: insets.top + 20, backgroundColor: headerBgColor }]}>
      <TouchableOpacity onPress={() => router.back()} style={headerStyles.backButton}>
        <Ionicons name="arrow-back" size={24} color={iconColor} />
      </TouchableOpacity>
      <Text style={[headerStyles.headerTitle, { fontSize: 14, color: headerTextColor }]}>
        {t("settings").toUpperCase()}
      </Text>
      <TouchableOpacity onPress={() => router.back()} style={headerStyles.menuButton}>
        <View style={[headerStyles.circleIcon, { backgroundColor: circleBgColor }]}>
          {/* 波浪线图标 - 同心圆波浪 */}
          <View style={headerStyles.waveIcon}>
            <View style={[headerStyles.waveCircle, { width: 8, height: 8, borderRadius: 4, borderColor: waveColor }]} />
            <View style={[headerStyles.waveCircle, { width: 12, height: 12, borderRadius: 6, borderColor: waveColor }]} />
            <View style={[headerStyles.waveCircle, { width: 16, height: 16, borderRadius: 8, borderColor: waveColor }]} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false, // 默认不显示 header
        }}
      >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // index 页面不显示 header
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false, // tabs 页面不显示 header
          presentation: "card", // 使用 card 模式，不显示导航栏
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          headerShown: true,
          header: () => <CustomHeader title="SIGN IN" />,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerShown: true,
          header: () => <CustomHeader title="CREATE ACCOUNT" />,
        }}
      />
      <Stack.Screen
        name="language"
        options={{
          headerShown: true,
          header: () => <CustomHeader title="LANGUAGE" />,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: true,
          header: () => <CustomHeader title="CREATE ACCOUNT" />,
        }}
      />
      <Stack.Screen
        name="congratulations"
        options={{
          headerShown: false, // 恭喜页面不需要 header
        }}
      />
      <Stack.Screen
        name="device-setup"
        options={{
          headerShown: false, // 设备设置页面有自定义 header
        }}
      />
      <Stack.Screen
        name="device-connect"
        options={{
          headerShown: true,
          header: () => <CustomHeader title="DEVICE SETUP" />,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: true,
          header: () => <SettingsHeader />,
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          headerShown: true,
          header: () => <CustomHeader title="PROFILE" />,
        }}
      />
      <Stack.Screen
        name="change-password"
        options={{
          headerShown: true,
          header: () => <CustomHeader title="PASSWORD" />,
        }}
      />
    </Stack>
    </>
  );
}

// Settings 页面的自定义 Header
function SettingsHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { t } = useI18n();

  const headerBgColor = isDark ? "#1C1C1E" : "#FFF";
  const headerTextColor = isDark ? "#FFF" : "#000";
  const iconColor = isDark ? "#FFF" : "#000";
  const circleBgColor = isDark ? "#2C2C2E" : "#F0F0F0";
  const waveColor = isDark ? "#FFF" : "#000";

  return (
    <View style={[headerStyles.header, { paddingTop: insets.top + 20, backgroundColor: headerBgColor }]}>
      <TouchableOpacity onPress={() => router.back()} style={headerStyles.backButton}>
        <Ionicons name="arrow-back" size={24} color={iconColor} />
      </TouchableOpacity>
      <Text style={[headerStyles.headerTitle, { fontSize: 14, color: headerTextColor }]}>
        {t("settings").toUpperCase()}
      </Text>
      <TouchableOpacity onPress={() => router.back()} style={headerStyles.menuButton}>
        <View style={[headerStyles.circleIcon, { backgroundColor: circleBgColor }]}>
          {/* 波浪线图标 - 同心圆波浪 */}
          <View style={headerStyles.waveIcon}>
            <View style={[headerStyles.waveCircle, { width: 8, height: 8, borderRadius: 4, borderColor: waveColor }]} />
            <View style={[headerStyles.waveCircle, { width: 12, height: 12, borderRadius: 6, borderColor: waveColor }]} />
            <View style={[headerStyles.waveCircle, { width: 16, height: 16, borderRadius: 8, borderColor: waveColor }]} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <DeviceProvider>
          <PlaylistProvider>
            <RootLayoutContent />
          </PlaylistProvider>
        </DeviceProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
