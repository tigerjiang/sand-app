import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useI18n } from "../contexts/I18nContext";
import { useTheme } from "../contexts/ThemeContext";

export default function EditProfileScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { isDark } = useTheme();
  const [name, setName] = useState("zehu");
  const [nickname, setNickname] = useState("zehu");
  const [email, setEmail] = useState("zehu@briskitgrills.com");

  const handleSubmit = () => {
    // 保存资料
    router.back();
  };

  const handleDeleteAccount = () => {
    // 处理删除账户
    console.log("Delete account");
  };

  const backgroundColor = isDark ? "#000000" : "#F5F5F0";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const inputBgColor = isDark ? "#1C1C1E" : "#E8E8E8";
  const placeholderColor = isDark ? "#8E8E93" : "#999";
  const iconColor = isDark ? "#8E8E93" : "#999";
  const editIconBgColor = isDark ? "#2C2C2E" : "#FFF";
  const editIconBorderColor = isDark ? "#3A3A3C" : "#E8E8E8";
  const editIconTextColor = isDark ? "#FFFFFF" : "#2C2C2C";
  const profileBgColor = isDark ? "#2C2C2E" : "#E8E8E8";

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} contentContainerStyle={styles.contentContainer}>
      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Profile Picture */}
        <View style={styles.profilePictureContainer}>
          <View style={[styles.profilePicture, { backgroundColor: profileBgColor }]}>
            <Ionicons name="person" size={60} color={iconColor} />
          </View>
          <TouchableOpacity style={[styles.editIcon, { backgroundColor: editIconBgColor, borderColor: editIconBorderColor }]}>
            <Ionicons name="pencil" size={16} color={editIconTextColor} />
          </TouchableOpacity>
        </View>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: textColor }]}>{t("name")}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBgColor, color: textColor }]}
            value={name}
            onChangeText={setName}
            placeholder={t("name")}
            placeholderTextColor={placeholderColor}
          />
        </View>

        {/* Nickname Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: textColor }]}>{t("nickname")}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBgColor, color: textColor }]}
            value={nickname}
            onChangeText={setNickname}
            placeholder={t("nickname")}
            placeholderTextColor={placeholderColor}
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: textColor }]}>{t("email")}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBgColor, color: textColor }]}
            value={email}
            onChangeText={setEmail}
            placeholder={t("email")}
            placeholderTextColor={placeholderColor}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{t("submit")}</Text>
        </TouchableOpacity>

        {/* Delete Account Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>{t("deleteAccount")}</Text>
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
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: 40,
    position: "relative",
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#2C2C2C",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 40,
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
});

