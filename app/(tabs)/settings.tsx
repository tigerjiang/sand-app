import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceHeader from "../../components/DeviceHeader";
import { useI18n } from "../../contexts/I18nContext";
import { useTheme } from "../../contexts/ThemeContext";

// Tabs 下的 Settings 页面 - 已登录状态
export default function SettingsTab() {
  const router = useRouter();
  const { isDark, themeMode, setThemeMode } = useTheme();
  const { t } = useI18n();

  const [reverseDrawMode, setReverseDrawMode] = useState(false);
  const [drawingSpeed, setDrawingSpeed] = useState(82);

  const handleDarkModeChange = (value: boolean) => {
    setThemeMode(value ? "dark" : "light");
  };

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const handleChangePassword = () => {
    router.push("/change-password");
  };

  const handleLogout = () => {
    router.replace("/");
  };

  const handleLanguage = () => {
    router.push("/language");
  };

  const handlePrivacy = () => {
    // 处理隐私设置
    console.log("Privacy");
  };

  const handleManualConnection = () => {
    // 处理手动连接
    console.log("Manual connection");
  };

  const handleRestart = () => {
    Alert.alert(t("restart"), t("restartConfirm"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("confirm"),
        onPress: () => {
          // 执行重启逻辑
          console.log("Restarting device...");
        },
        style: "destructive",
      },
    ]);
  };

  const handleFactoryReset = () => {
    Alert.alert(t("factoryReset"), t("factoryResetConfirm"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("confirm"),
        onPress: () => {
          // 执行恢复出厂设置逻辑
          console.log("Factory resetting device...");
        },
        style: "destructive",
      },
    ]);
  };

  const backgroundColor = isDark ? "#000000" : "#F5F5F0";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const sectionTextColor = isDark ? "#FFFFFF" : "#000000";
  const dividerColor = isDark ? "#2C2C2E" : "#E0E0E0";
  const iconColor = isDark ? "#FFFFFF" : "#000000";
  const chevronColor = isDark ? "#8E8E93" : "#999999";
  const versionTextColor = isDark ? "#8E8E93" : "#666666";
  const sliderActiveColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const sliderTrackColor = isDark ? "#5A5A5C" : "#D0D0D0";
  const sliderBgColor = isDark ? "#1C1C1E" : "#FFFFFF";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <DeviceHeader />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Main Title */}
        <Text style={[styles.mainTitle, { color: textColor }]}>
          {t("settings")}
        </Text>

        {/* Account Section - 登录后显示 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="person"
                size={20}
                color={iconColor}
                style={styles.iconOverlay}
              />
              <Ionicons
                name="settings"
                size={14}
                color={iconColor}
                style={styles.iconUnderlay}
              />
            </View>
            <Text style={[styles.sectionTitle, { color: sectionTextColor }]}>
              {t("account")}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Edit Profile */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleEditProfile}
          >
            <Text style={[styles.settingLabel, { color: textColor }]}>
              {t("editProfile")}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Change password */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleChangePassword}
          >
            <Text style={[styles.settingLabel, { color: textColor }]}>
              {t("changePassword")}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Logout */}
          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <Text style={[styles.settingLabel, { color: textColor }]}>
              {t("logout")}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
        </View>

        {/* Device Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="hardware-chip" size={20} color={iconColor} />
            </View>
            <Text style={[styles.sectionTitle, { color: sectionTextColor }]}>
              {t("deviceSettings")}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Reverse Draw Mode */}
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: textColor }]}>
              {t("reverseDrawMode")}
            </Text>
            <Switch
              value={reverseDrawMode}
              onValueChange={setReverseDrawMode}
              trackColor={{
                false: isDark ? "#3A3A3C" : "#E0E0E0",
                true: isDark ? "#0A84FF" : "#2C2C2C",
              }}
              thumbColor="#FFF"
            />
          </View>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Drawing Speed */}
          <View style={styles.drawingSpeedContainer}>
            <View style={styles.drawingSpeedLabelRow}>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                {t("drawingSpeed")}
              </Text>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                {Math.round(drawingSpeed)}
              </Text>
            </View>
            <View
              style={[
                styles.sliderContainer,
                { backgroundColor: sliderBgColor },
              ]}
            >
              <View style={styles.sliderWrapper}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  value={drawingSpeed}
                  onValueChange={setDrawingSpeed}
                  minimumTrackTintColor={sliderActiveColor}
                  maximumTrackTintColor={sliderTrackColor}
                  thumbTintColor={sliderActiveColor}
                />
                {/* 滑块标记点 */}
                <View style={styles.sliderDots}>
                  {[0, 20, 40, 60, 80, 100].map((dot) => (
                    <View
                      key={dot}
                      style={[
                        styles.sliderDot,
                        {
                          left: `${dot}%`,
                          backgroundColor: isDark ? "#6A6A6A" : "#C0C0C0",
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Restart */}
          <TouchableOpacity style={styles.settingItem} onPress={handleRestart}>
            <Text style={[styles.settingLabel, { color: textColor }]}>
              {t("restart")}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Factory Reset */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleFactoryReset}
          >
            <Text style={[styles.settingLabel, { color: textColor }]}>
              {t("factoryReset")}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="settings"
                size={20}
                color={iconColor}
                style={styles.iconOverlay}
              />
              <Ionicons
                name="settings"
                size={16}
                color={iconColor}
                style={styles.iconUnderlay}
              />
            </View>
            <Text style={[styles.sectionTitle, { color: sectionTextColor }]}>
              {t("appSettings")}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Dark Mode */}
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: textColor }]}>
              {t("darkMode")}
            </Text>
            <Switch
              value={themeMode === "dark"}
              onValueChange={handleDarkModeChange}
              trackColor={{
                false: isDark ? "#3A3A3C" : "#E0E0E0",
                true: isDark ? "#0A84FF" : "#2C2C2C",
              }}
              thumbColor="#FFF"
            />
          </View>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Language */}
          <TouchableOpacity style={styles.settingItem} onPress={handleLanguage}>
            <Text style={[styles.settingLabel, { color: textColor }]}>
              {t("language")}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
        </View>

        {/* Help Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="information-circle" size={20} color={iconColor} />
            </View>
            <Text style={[styles.sectionTitle, { color: sectionTextColor }]}>
              {t("help")}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Privacy */}
          <TouchableOpacity style={styles.settingItem} onPress={handlePrivacy}>
            <Text style={[styles.settingLabel, { color: textColor }]}>
              {t("privacy")}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Manual connection */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleManualConnection}
          >
            <Text style={[styles.settingLabel, { color: textColor }]}>
              {t("manualConnection")}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="information-circle" size={20} color={iconColor} />
            </View>
            <Text style={[styles.sectionTitle, { color: sectionTextColor }]}>
              {t("about")}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* App Version */}
          <View style={styles.settingItem}>
            <Text style={[styles.versionText, { color: versionTextColor }]}>
              {t("appVersion")} : 2.0.8
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    marginRight: 12,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  iconOverlay: {
    position: "absolute",
  },
  iconUnderlay: {
    position: "absolute",
    top: 4,
    left: 4,
    opacity: 0.6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 0,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  settingLabel: {
    fontSize: 16,
  },
  versionText: {
    fontSize: 14,
    paddingVertical: 16,
  },
  drawingSpeedContainer: {
    paddingVertical: 16,
  },
  drawingSpeedLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sliderContainer: {
    position: "relative",
    width: "100%",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sliderWrapper: {
    position: "relative",
    width: "100%",
    height: 40,
    justifyContent: "center",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderDots: {
    position: "absolute",
    width: "100%",
    height: 2,
    top: 19,
    left: 0,
  },
  sliderDot: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    marginLeft: -2,
  },
});
