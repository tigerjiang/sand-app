import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
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
import { ApiError, register } from "../utils/api";

import { useTheme } from "../contexts/ThemeContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { isDark } = useTheme();

  // 深色模式颜色
  const colors = {
    containerBg: isDark ? "#121212" : "#F5F5F0",
    title: isDark ? "#FFFFFF" : "#000",
    subtitle: isDark ? "#B3B3B3" : "#666",
    profilePictureBg: isDark ? "#2C2C2E" : "#E8E8E8",
    profilePlaceholder: isDark ? "#8E8E93" : "#999",
    editIconBg: isDark ? "#2C2C2E" : "#FFF",
    editIconBorder: isDark ? "#3A3A3C" : "#E8E8E8",
    editIconColor: isDark ? "#FFFFFF" : "#2C2C2C",
    inputBg: isDark ? "#1C1C1E" : "#FFF",
    inputColor: isDark ? "#FFFFFF" : "#000",
    placeholder: isDark ? "#8E8E93" : "#999",
    eyeIconColor: isDark ? "#FFFFFF" : "#000",
    checkboxBorder: isDark ? "#FFFFFF" : "#2C2C2C",
    checkboxCheck: isDark ? "#FFFFFF" : "#2C2C2C",
    termsText: isDark ? "#FFFFFF" : "#000",
    termsLink: isDark ? "#64B5F6" : "#4A90E2",
    submitButtonBg: isDark ? "#2C2C2C" : "#2C2C2C",
    submitButtonText: isDark ? "#FFF" : "#FFF",
    shadowColor: isDark ? "#000" : "#000",
  };
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // 验证邮箱格式
  const isValidEmail = (emailStr: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);

  const handleSubmit = async () => {
    if (!agreeToTerms) {
      Alert.alert(t("error"), "请先同意条款与隐私政策");
      return;
    }
    if (!email || !password) {
      Alert.alert(t("error"), "请输入邮箱和密码");
      return;
    }
    if (password !== repeatPassword) {
      Alert.alert(t("error"), "两次输入的密码不一致");
      return;
    }
    try {
      await register({ email, password, name, nickname });
      router.replace("/congratulations");
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : e?.message || "注册失败";
      Alert.alert(t("error"), msg);
    }
  };

  const handleTermsPress = () => {
    // 处理条款点击
    console.log("Terms of Service");
  };

  const handlePrivacyPress = () => {
    // 处理隐私政策点击
    console.log("Privacy Policy");
  };

  // 请求权限
  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || mediaLibraryStatus !== "granted") {
      Alert.alert("权限被拒绝", "需要相机和相册权限才能上传头像", [
        { text: "确定" },
      ]);
      return false;
    }
    return true;
  };

  // 显示选择图片的选项（图库或相机）
  const showImagePickerOptions = () => {
    Alert.alert("选择头像", "请选择图片来源", [
      {
        text: "取消",
        style: "cancel",
      },
      {
        text: "从相册选择",
        onPress: () => pickImageFromLibrary(),
      },
      {
        text: "拍照",
        onPress: () => takePhoto(),
      },
    ]);
  };

  // 从相册选择图片
  const pickImageFromLibrary = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
        await uploadImage(imageUri);
      }
    } catch (error) {
      console.error("选择图片失败:", error);
      Alert.alert("错误", "选择图片失败，请重试");
    }
  };

  // 拍照
  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
        await uploadImage(imageUri);
      }
    } catch (error) {
      console.error("拍照失败:", error);
      Alert.alert("错误", "拍照失败，请重试");
    }
  };

  // 上传图片到服务器
  const uploadImage = async (imageUri: string) => {
    setUploading(true);
    try {
      // 创建 FormData
      const formData = new FormData();
      const filename = imageUri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("file", {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      // TODO: 替换为实际的 API endpoint
      const uploadUrl = "https://your-api-server.com/api/upload/profile";

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          // TODO: 添加认证 token
          // "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("上传失败");
      }

      const result = await response.json();
      console.log("上传成功:", result);

      // 如果服务器返回图片 URL，可以保存它
      if (result.url) {
        setProfileImage(result.url);
      }

      Alert.alert("成功", "头像上传成功");
    } catch (error) {
      console.error("上传图片失败:", error);
      Alert.alert("错误", "上传图片失败，请检查网络连接");
      // 即使上传失败，也保留本地选择的图片
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.containerBg }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={[styles.title, { color: colors.title }]}>
          {t("fillYourProfile")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.subtitle }]}>
          {t("dontWorry")}
        </Text>

        {/* Profile Picture */}
        <View style={styles.profilePictureContainer}>
          <View
            style={[
              styles.profilePicture,
              { backgroundColor: colors.profilePictureBg },
            ]}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
                contentFit="cover"
              />
            ) : (
              <Ionicons
                name="person"
                size={60}
                color={colors.profilePlaceholder}
              />
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.editIcon,
              {
                backgroundColor: colors.editIconBg,
                borderColor: colors.editIconBorder,
              },
            ]}
            onPress={showImagePickerOptions}
            disabled={uploading}
          >
            {uploading ? (
              <Ionicons
                name="hourglass"
                size={16}
                color={colors.editIconColor}
              />
            ) : (
              <Ionicons name="pencil" size={16} color={colors.editIconColor} />
            )}
          </TouchableOpacity>
        </View>

        {/* Name Input */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              color: colors.inputColor,
            },
          ]}
          placeholder={t("name")}
          placeholderTextColor={colors.placeholder}
          value={name}
          onChangeText={setName}
        />

        {/* Nickname Input */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              color: colors.inputColor,
            },
          ]}
          placeholder={t("nickname")}
          placeholderTextColor={colors.placeholder}
          value={nickname}
          onChangeText={setNickname}
        />

        {/* Email Input */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              color: colors.inputColor,
            },
          ]}
          placeholder={t("email")}
          placeholderTextColor={colors.placeholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password Input */}
        <View
          style={[
            styles.passwordContainer,
            { backgroundColor: colors.inputBg },
          ]}
        >
          <TextInput
            style={[styles.passwordInput, { color: colors.inputColor }]}
            placeholder={t("createPassword")}
            placeholderTextColor={colors.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color={colors.eyeIconColor}
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.passwordHint, { color: colors.subtitle }]}>
          {t("passwordMustBeAtLeast6Characters")}
        </Text>

        {/* Repeat Password Input */}
        <View
          style={[
            styles.passwordContainer,
            { backgroundColor: colors.inputBg },
          ]}
        >
          <TextInput
            style={[styles.passwordInput, { color: colors.inputColor }]}
            placeholder={t("repeatPassword")}
            placeholderTextColor={colors.placeholder}
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
              color={colors.eyeIconColor}
            />
          </TouchableOpacity>
        </View>

        {/* Terms Checkbox */}
        <View style={styles.termsContainer}>
          <TouchableOpacity
            style={[styles.checkbox, { borderColor: colors.checkboxBorder }]}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
          >
            {agreeToTerms && (
              <Ionicons
                name="checkmark"
                size={16}
                color={colors.checkboxCheck}
              />
            )}
          </TouchableOpacity>
          <Text style={[styles.termsText, { color: colors.termsText }]}>
            {t("agreeTo")}{" "}
            <Text
              style={[styles.termsLink, { color: colors.termsLink }]}
              onPress={handleTermsPress}
            >
              {t("termsOfService")}
            </Text>{" "}
            {t("and")}{" "}
            <Text
              style={[styles.termsLink, { color: colors.termsLink }]}
              onPress={handlePrivacyPress}
            >
              {t("privacyPolicy")}
            </Text>
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.submitButtonBg },
          ]}
          onPress={handleSubmit}
        >
          <Text
            style={[
              styles.submitButtonText,
              { color: colors.submitButtonText },
            ]}
          >
            SUBMIT
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
    paddingBottom: 40,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
  },
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: 30,
    position: "relative",
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E8E8E8",
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
  passwordHint: {
    fontSize: 12,
    marginBottom: 8,
    marginTop: -4,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#2C2C2C",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },
  termsLink: {
    color: "#4A90E2",
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
});
