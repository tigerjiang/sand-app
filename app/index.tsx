import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function OnboardingScreen() {
  const router = useRouter();

  useEffect(() => {
    // 隐藏启动画面
    SplashScreen.hideAsync();
  }, []);

  const handleGetStarted = () => {
    router.push("/register");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <View style={styles.container}>
      {/* 抽象图形区域 */}
      <View style={styles.graphicContainer}>
        <View style={styles.swirlPattern} />
        <View style={styles.glowBorder}>
          <View style={[styles.glowDot, styles.blueGlow]} />
          <View style={[styles.glowDot, styles.purpleGlow]} />
        </View>
      </View>

      {/* 标题 */}
      <Text style={styles.title}>Oasis Control</Text>

      {/* 开始按钮 */}
      <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
        <Text style={styles.getStartedText}>GET STARTED</Text>
      </TouchableOpacity>

      {/* 登录链接 */}
      <TouchableOpacity onPress={handleLogin} style={styles.loginLink}>
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginLinkText}>Log In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F0",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  graphicContainer: {
    width: "100%",
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    position: "relative",
  },
  swirlPattern: {
    width: 250,
    height: 200,
    borderRadius: 125,
    backgroundColor: "#E0E0E0",
    opacity: 0.3,
    transform: [{ rotate: "45deg" }],
  },
  glowBorder: {
    position: "absolute",
    width: 280,
    height: 220,
    borderRadius: 140,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#4A90E2",
  },
  glowDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  blueGlow: {
    backgroundColor: "#4A90E2",
    top: 20,
    left: 20,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  purpleGlow: {
    backgroundColor: "#9B59B6",
    bottom: 20,
    right: 20,
    shadowColor: "#9B59B6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: "300",
    color: "#333",
    marginBottom: 40,
    letterSpacing: 2,
  },
  getStartedButton: {
    backgroundColor: "#2C2C2C",
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 8,
    marginBottom: 20,
  },
  getStartedText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  loginLink: {
    marginTop: 10,
  },
  loginText: {
    color: "#333",
    fontSize: 14,
  },
  loginLinkText: {
    color: "#4A90E2",
    fontWeight: "500",
  },
});
