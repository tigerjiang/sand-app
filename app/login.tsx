import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useI18n } from "../contexts/I18nContext";
import { ApiError, login } from "../utils/api";
import { signInWithApple, signInWithFacebook, signInWithGoogle } from "../utils/auth/socialLogin";

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    try {
      await login({ email, password });
      router.replace("/(tabs)/device");
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : (e?.message || "登录失败");
      Alert.alert(t("error"), msg);
    }
  };

  const handleForgotPassword = () => {
    // 处理忘记密码
    console.log("Forgot password");
  };

  const handleFacebookLogin = async () => {
    try {
      await signInWithFacebook();
      router.replace("/(tabs)/device");
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : (e?.message || "Facebook 登录失败");
      Alert.alert(t("error"), msg);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      router.replace("/(tabs)/device");
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : (e?.message || "Google 登录失败");
      Alert.alert(t("error"), msg);
    }
  };

  const handleAppleLogin = async () => {
    try {
      await signInWithApple();
      router.replace("/(tabs)/device");
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : (e?.message || "Apple 登录失败");
      Alert.alert(t("error"), msg);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.title}>{t("login")}</Text>

        {/* Email Input */}
        <TextInput
          style={styles.input}
          placeholder={t("email")}
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password Input */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder={t("password")}
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.signInButtonText}>{t("signIn")}</Text>
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>
            {t("forgotPassword")} <Text style={styles.clickHereText}>{t("clickHere")}</Text>
          </Text>
        </TouchableOpacity>

        {/* Social Login */}
        <Text style={styles.orText}>{t("orContinueWith")}</Text>
        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton} onPress={handleFacebookLogin}>
            <View style={styles.facebookIcon}>
              <Text style={styles.facebookText}>f</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
            <Text style={styles.googleText}>G</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={handleAppleLogin}>
            <Ionicons name="logo-apple" size={24} color="#000" />
          </TouchableOpacity>
        </View>
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
  input: {
    backgroundColor: "#FFF",
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
    backgroundColor: "#FFF",
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
    color: "#000",
    fontSize: 14,
    textAlign: "center",
  },
  clickHereText: {
    color: "#4A90E2",
  },
  orText: {
    textAlign: "center",
    color: "#000",
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
    backgroundColor: "#FFF",
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

