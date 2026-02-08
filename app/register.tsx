import { useRouter } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useI18n } from "../contexts/I18nContext";
import { ApiError } from "../utils/api";
import { signInWithFacebook, signInWithGoogle } from "../utils/auth/socialLogin";

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useI18n();

  const handleFacebookRegister = async () => {
    try {
      await signInWithFacebook();
      router.replace("/(tabs)/device");
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : (e?.message || "Facebook 登录失败");
      Alert.alert(t("error"), msg);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await signInWithGoogle();
      router.replace("/(tabs)/device");
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : (e?.message || "Google 登录失败");
      Alert.alert(t("error"), msg);
    }
  };

  const handleEmailRegister = () => {
    // 跳转到语言选择页面，传递 from=register 参数
    router.push("/language?from=register");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.title}>{t("letsGetYouIn")}</Text>

        {/* Facebook Button */}
        <TouchableOpacity style={styles.socialButton} onPress={handleFacebookRegister}>
          <View style={styles.facebookIcon}>
            <Text style={styles.facebookText}>f</Text>
          </View>
          <Text style={styles.socialButtonText}>{t("continueWithFacebook")}</Text>
        </TouchableOpacity>

        {/* Google Button */}
        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleRegister}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.socialButtonText}>{t("continueWithGoogle")}</Text>
        </TouchableOpacity>

        {/* Or Separator */}
        <Text style={styles.orText}>{t("or")}</Text>

        {/* Email Register Button */}
        <TouchableOpacity style={styles.emailButton} onPress={handleEmailRegister}>
          <Text style={styles.emailButtonText}>{t("signUpWithPassword")}</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity onPress={handleLogin} style={styles.loginLink}>
          <Text style={styles.loginText}>
            {t("alreadyHaveAccount")} <Text style={styles.loginLinkText}>{t("logIn")}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F0",
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
    color: "#000",
    marginBottom: 30,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
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
    marginRight: 12,
  },
  facebookText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4285F4",
    marginRight: 12,
    width: 30,
    textAlign: "center",
  },
  socialButtonText: {
    color: "#2C2C2C",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  orText: {
    textAlign: "center",
    color: "#000",
    fontSize: 16,
    marginVertical: 20,
  },
  emailButton: {
    backgroundColor: "#2C2C2C",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 30,
  },
  emailButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  loginLink: {
    marginTop: 10,
    marginBottom: 40,
  },
  loginText: {
    color: "#000",
    fontSize: 14,
    textAlign: "center",
  },
  loginLinkText: {
    color: "#4A90E2",
    fontWeight: "500",
  },
});

