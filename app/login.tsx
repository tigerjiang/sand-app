import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useI18n } from "../contexts/I18nContext";
import { useTheme } from "../contexts/ThemeContext";

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    // 这里添加登录逻辑
    router.push("/(tabs)/device");
  };

  const handleForgotPassword = () => {
    // 处理忘记密码
    console.log("Forgot password");
    router.push("/forgot-password");
  };

  const handleFacebookLogin = () => {
    // 处理Facebook登录
    console.log("Facebook login");
  };

  const handleGoogleLogin = () => {
    // 处理Google登录
    console.log("Google login");
  };

  const backgroundColor = isDark ? "#000000" : "#F5F5F0";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const inputBgColor = isDark ? "#1C1C1E" : "#FFF";
  const placeholderColor = isDark ? "#8E8E93" : "#999";
  const iconColor = isDark ? "#FFFFFF" : "#000000";
  const linkColor = isDark ? "#0A84FF" : "#4A90E2";

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} contentContainerStyle={styles.contentContainer}>
      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={[styles.title, { color: textColor }]}>{t("login")}</Text>

        {/* Email Input */}
        <TextInput
          style={[styles.input, { backgroundColor: inputBgColor, color: textColor }]}
          placeholder={t("email")}
          placeholderTextColor={placeholderColor}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password Input */}
        <View style={[styles.passwordContainer, { backgroundColor: inputBgColor }]}>
          <TextInput
            style={[styles.passwordInput, { color: textColor }]}
            placeholder={t("password")}
            placeholderTextColor={placeholderColor}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={iconColor} />
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.signInButtonText}>{t("signIn")}</Text>
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
          <Text style={[styles.forgotPasswordText, { color: textColor }]}>
            {t("forgotPassword")} <Text style={[styles.clickHereText, { color: linkColor }]}>{t("clickHere")}</Text>
          </Text>
        </TouchableOpacity>

        {/* Social Login */}
        <Text style={[styles.orText, { color: textColor }]}>{t("orContinueWith")}</Text>
        <View style={styles.socialButtons}>
          <TouchableOpacity style={[styles.socialButton, { backgroundColor: inputBgColor }]} onPress={handleFacebookLogin}>
            <View style={styles.facebookIcon}>
              <Text style={styles.facebookText}>f</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialButton, { backgroundColor: inputBgColor }]} onPress={handleGoogleLogin}>
            <Text style={styles.googleText}>G</Text>
          </TouchableOpacity>
        </View>
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
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
  },
  input: {
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
  signInButton: {
    backgroundColor: "#2C2C2C",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  signInButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  forgotPassword: {
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontSize: 14,
    textAlign: "center",
  },
  clickHereText: {
  },
  orText: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 20,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 40,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  facebookIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#1877F2",
    justifyContent: "center",
    alignItems: "center",
  },
  facebookText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  googleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4285F4",
  },
});

