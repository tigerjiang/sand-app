import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { languageMap, useI18n } from "../contexts/I18nContext";
import { useTheme } from "../contexts/ThemeContext";

const languageNames = [
  "CHINESE (SIMPLIFIED)",
  "CHINESE (TRADITIONAL)",
  "DUTCH",
  "ENGLISH (AUSTRALIA)",
  "ENGLISH (UK)",
  "FRENCH",
  "GERMAN",
  "ITALIAN",
  "PORTUGUESE (BRAZIL)",
  "PORTUGUESE (PORTUGAL)",
  "RUSSIAN",
  "SPANISH",
  "ENGLISH",
];

export default function LanguageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDark } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    Object.keys(languageMap).find((key) => languageMap[key] === language) || "ENGLISH"
  );
  
  // 判断是否从 register 页面进入
  const isFromRegister = params.from === "register" || params.fromRegister === "true";

  useEffect(() => {
    // 当语言改变时，更新选中的语言名称
    const langName = Object.keys(languageMap).find((key) => languageMap[key] === language);
    if (langName) {
      setSelectedLanguage(langName);
    }
  }, [language]);

  const handleLanguageSelect = (langName: string) => {
    setSelectedLanguage(langName);
    const langCode = languageMap[langName];
    if (langCode) {
      setLanguage(langCode);
    }
  };

  const handleContinue = () => {
    // 从 register 进入时，点击 CONTINUE 跳转到 profile 页面
    if (isFromRegister) {
      router.push("/profile");
    }
  };

  const backgroundColor = isDark ? "#000000" : "#F5F5F0";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const itemBgColor = isDark ? "#1C1C1E" : "#E8E8E8";
  const borderColor = isDark ? "#FFFFFF" : "#2C2C2C";
  const selectedBgColor = isDark ? "#2C2C2E" : "#2C2C2C";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* 从 register 进入时显示 "Get started" 标题 */}
        {isFromRegister && (
          <Text style={[styles.mainTitle, { color: textColor }]}>{t("getStarted")}</Text>
        )}
        
        {/* 副标题：从 register 进入时显示，从 settings 进入时作为主标题 */}
        <Text style={[isFromRegister ? styles.subtitle : styles.title, { color: textColor }]}>
          {t("chooseLanguage")}
        </Text>

        {/* Language List */}
        <ScrollView 
          style={styles.languageList} 
          showsVerticalScrollIndicator={true}
          contentContainerStyle={isFromRegister ? {} : { paddingBottom: 20 }}
        >
          {languageNames.map((langName) => (
            <TouchableOpacity
              key={langName}
              style={[styles.languageItem, { backgroundColor: itemBgColor }]}
              onPress={() => handleLanguageSelect(langName)}
            >
              <View style={[styles.radioButton, { borderColor }]}>
                {selectedLanguage === langName && (
                  <View style={[styles.radioButtonSelected, { backgroundColor: selectedBgColor }]} />
                )}
              </View>
              <Text style={[styles.languageText, { color: textColor }]}>{langName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 从 register 进入时显示 CONTINUE 按钮 */}
        {isFromRegister && (
          <TouchableOpacity 
            style={[styles.continueButton, { backgroundColor: isDark ? "#2C2C2C" : "#2C2C2C" }]} 
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>{t("continue")}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: "#666",
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  languageText: {
    fontSize: 14,
    fontWeight: "500",
  },
  continueButton: {
    backgroundColor: "#2C2C2C",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  continueButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
});

