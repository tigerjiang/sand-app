import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useI18n } from "../contexts/I18nContext";
import { useTheme } from "../contexts/ThemeContext";
import { ApiError, changePassword } from "../utils/api";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { isDark } = useTheme();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword.trim()) {
      Alert.alert(t("error"), t("pleaseEnterCurrentPassword"));
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert(t("error"), t("passwordMustBeAtLeast6Characters"));
      return;
    }
    if (newPassword !== repeatPassword) {
      Alert.alert(t("error"), t("passwordsDoNotMatch"));
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword });
      Alert.alert(t("success"), "密码修改成功");
      router.back();
    } catch (e: any) {
      const msg =
        e instanceof ApiError ? e.message : e?.message || "修改密码失败";
      Alert.alert(t("error"), msg);
    }
  };

  const handleForgotPassword = () => {
    // 处理忘记密码
    console.log("Forgot password");
  };

  const backgroundColor = isDark ? "#000000" : "#F5F5F0";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const inputBgColor = isDark ? "#1C1C1E" : "#FFF";
  const placeholderColor = isDark ? "#8E8E93" : "#999";
  const iconColor = isDark ? "#FFFFFF" : "#000000";
  const linkColor = isDark ? "#0A84FF" : "#4A90E2";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={[styles.title, { color: textColor }]}>
          {t("enterNewPassword")}
        </Text>

        {/* Current Password Input */}
        <View
          style={[styles.passwordContainer, { backgroundColor: inputBgColor }]}
        >
          <TextInput
            style={[styles.passwordInput, { color: textColor }]}
            placeholder={t("currentPassword")}
            placeholderTextColor={placeholderColor}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrentPassword}
          />
          <TouchableOpacity
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showCurrentPassword ? "eye-off" : "eye"}
              size={20}
              color={iconColor}
            />
          </TouchableOpacity>
        </View>

        {/* New Password Input */}
        <View
          style={[styles.passwordContainer, { backgroundColor: inputBgColor }]}
        >
          <TextInput
            style={[styles.passwordInput, { color: textColor }]}
            placeholder={t("newPassword")}
            placeholderTextColor={placeholderColor}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showNewPassword ? "eye-off" : "eye"}
              size={20}
              color={iconColor}
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.passwordHint, { color: placeholderColor }]}>
          {t("passwordMustBeAtLeast6Characters")}
        </Text>

        {/* Repeat Password Input */}
        <View
          style={[styles.passwordContainer, { backgroundColor: inputBgColor }]}
        >
          <TextInput
            style={[styles.passwordInput, { color: textColor }]}
            placeholder={t("repeatPassword")}
            placeholderTextColor={placeholderColor}
            value={repeatPassword}
            onChangeText={setRepeatPassword}
            secureTextEntry={!showRepeatPassword}
          />
          <TouchableOpacity
            onPress={() => setShowRepeatPassword(!showRepeatPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showRepeatPassword ? "eye-off" : "eye"}
              size={20}
              color={iconColor}
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password Link */}
        <TouchableOpacity
          onPress={handleForgotPassword}
          style={styles.forgotPassword}
        >
          <Text style={[styles.forgotPasswordText, { color: textColor }]}>
            {t("forgotPassword")}{" "}
            <Text style={[styles.clickHereText, { color: linkColor }]}>
              {t("clickHere")}
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{t("submit")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    lineHeight: 36,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  passwordHint: {
    fontSize: 12,
    marginBottom: 8,
    marginTop: -4,
  },
  forgotPassword: {
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontSize: 14,
    textAlign: "center",
  },
  clickHereText: {},
  submitButton: {
    backgroundColor: "#2C2C2C",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
});
