import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useI18n } from "../contexts/I18nContext";
import { useTheme } from "../contexts/ThemeContext";

type Step = "email" | "verify" | "reset";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { isDark } = useTheme();
  
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const backgroundColor = isDark ? "#000000" : "#F5F5F0";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const inputBgColor = isDark ? "#1C1C1E" : "#FFF";
  const placeholderColor = isDark ? "#8E8E93" : "#999";
  const iconColor = isDark ? "#FFFFFF" : "#000000";
  const linkColor = isDark ? "#0A84FF" : "#4A90E2";

  // 验证邮箱格式
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 发送验证码
  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert(t("error"), t("pleaseEnterEmail"));
      return;
    }
    
    if (!isValidEmail(email)) {
      Alert.alert(t("error"), t("invalidEmailFormat"));
      return;
    }

    setIsSendingCode(true);
    try {
      // TODO: 调用后端API发送验证码
      // await sendVerificationCode(email);
      
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      Alert.alert(t("success"), t("verificationCodeSent"));
      setStep("verify");
      setCountdown(60);
      
      // 倒计时
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      Alert.alert(t("error"), t("failedToSendCode"));
    } finally {
      setIsSendingCode(false);
    }
  };

  // 验证验证码
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert(t("error"), t("pleaseEnterVerificationCode"));
      return;
    }

    if (verificationCode.length !== 6) {
      Alert.alert(t("error"), t("verificationCodeMustBe6Digits"));
      return;
    }

    try {
      // TODO: 调用后端API验证验证码
      // await verifyCode(email, verificationCode);
      
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setStep("reset");
    } catch (error) {
      Alert.alert(t("error"), t("invalidVerificationCode"));
    }
  };

  // 重设密码
  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert(t("error"), t("pleaseEnterNewPassword"));
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
      // TODO: 调用后端API重设密码
      // await resetPassword(email, verificationCode, newPassword);
      
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      Alert.alert(t("success"), t("passwordResetSuccess"), [
        {
          text: t("ok"),
          onPress: () => router.replace("/login"),
        },
      ]);
    } catch (error) {
      Alert.alert(t("error"), t("failedToResetPassword"));
    }
  };

  // 重新发送验证码
  const handleResendCode = () => {
    if (countdown > 0) return;
    handleSendCode();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} contentContainerStyle={styles.contentContainer}>
      <View style={styles.mainContent}>
        {/* 标题 */}
        <Text style={[styles.title, { color: textColor }]}>{t("resetPassword")}</Text>

        {/* 步骤1: 输入邮箱 */}
        {step === "email" && (
          <>
            <Text style={[styles.description, { color: textColor }]}>{t("enterEmailToResetPassword")}</Text>
            
            <TextInput
              style={[styles.input, { backgroundColor: inputBgColor, color: textColor }]}
              placeholder={t("email")}
              placeholderTextColor={placeholderColor}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />

            <TouchableOpacity
              style={[styles.button, isSendingCode && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={isSendingCode}
            >
              <Text style={styles.buttonText}>
                {isSendingCode ? t("sending") : t("sendVerificationCode")}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* 步骤2: 输入验证码 */}
        {step === "verify" && (
          <>
            <Text style={[styles.description, { color: textColor }]}>
              {t("verificationCodeSentTo")} {email}
            </Text>
            
            <TextInput
              style={[styles.input, { backgroundColor: inputBgColor, color: textColor }]}
              placeholder={t("verificationCode")}
              placeholderTextColor={placeholderColor}
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.resendButton, countdown > 0 && styles.resendButtonDisabled]}
              onPress={handleResendCode}
              disabled={countdown > 0}
            >
              <Text style={[styles.resendButtonText, { color: countdown > 0 ? placeholderColor : linkColor }]}>
                {countdown > 0 ? `${t("resendIn")} ${countdown}s` : t("resendCode")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
              <Text style={styles.buttonText}>{t("verify")}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* 步骤3: 重设密码 */}
        {step === "reset" && (
          <>
            <Text style={[styles.description, { color: textColor }]}>{t("enterNewPassword")}</Text>
            
            <View style={[styles.passwordContainer, { backgroundColor: inputBgColor }]}>
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
                <Ionicons name={showNewPassword ? "eye-off" : "eye"} size={20} color={iconColor} />
              </TouchableOpacity>
            </View>

            <View style={[styles.passwordContainer, { backgroundColor: inputBgColor }]}>
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
                <Ionicons name={showRepeatPassword ? "eye-off" : "eye"} size={20} color={iconColor} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
              <Text style={styles.buttonText}>{t("resetPassword")}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* 返回登录 */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: linkColor }]}>{t("backToLogin")}</Text>
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
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
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
  button: {
    backgroundColor: "#2C2C2C",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  resendButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 14,
  },
  backButton: {
    alignItems: "center",
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 14,
  },
});
