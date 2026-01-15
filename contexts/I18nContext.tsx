import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type LanguageCode =
  | "en"
  | "zh-CN"
  | "zh-TW"
  | "nl"
  | "en-AU"
  | "en-GB"
  | "fr"
  | "de"
  | "it"
  | "pt-BR"
  | "pt-PT"
  | "ru"
  | "es";

interface Translations {
  [key: string]: string;
}

const translations: Record<LanguageCode, Translations> = {
  en: {
    settings: "Settings",
    account: "Account",
    editProfile: "Edit Profile",
    changePassword: "Change password",
    logout: "Logout",
    appSettings: "App Settings",
    darkMode: "Dark Mode",
    language: "Language",
    help: "Help",
    privacy: "Privacy",
    manualConnection: "Manual connection",
    about: "About",
    appVersion: "App version",
    chooseLanguage: "Choose your language",
    getStarted: "Get started",
    myDevices: "My Devices",
    manageDevices: "Manage your connected devices",
    addNewDevice: "Add New Device",
    connected: "Connected",
    // Login page
    login: "Login",
    email: "E-mail",
    password: "Password",
    signIn: "SIGN IN",
    forgotPassword: "Forgot your password?",
    clickHere: "Click here.",
    orContinueWith: "or continue with",
    // Register page
    letsGetYouIn: "Let's get you in",
    continueWithFacebook: "CONTINUE WITH FACEBOOK",
    continueWithGoogle: "CONTINUE WITH GOOGLE",
    or: "or",
    signUpWithPassword: "SIGN UP WITH PASSWORD",
    alreadyHaveAccount: "Already have an account?",
    logIn: "Log In",
    // Profile page
    fillYourProfile: "Fill your profile",
    dontWorry: "Don't worry, you can always change it later",
    name: "Name",
    nickname: "Nickname",
    createPassword: "Create password",
    repeatPassword: "Repeat password",
    agreeTo: "Agree to",
    termsOfService: "Terms of Service",
    and: "and",
    privacyPolicy: "Privacy Policy",
    continue: "CONTINUE",
    // Edit Profile page
    submit: "SUBMIT",
    deleteAccount: "DELETE ACCOUNT",
    // Change Password page
    enterNewPassword: "Enter your new password",
    currentPassword: "Current password",
    newPassword: "New password",
    // Device Setup page
    deviceSetup: "Device Setup",
    scanning: "Scanning...",
    connect: "Connect",
    // Device Connect page
    networkConfiguration: "Network Configuration",
    wifiSSID: "Wi-Fi SSID",
    wifiPassword: "Wi-Fi Password",
    configure: "CONFIGURE",
  },
  "zh-CN": {
    settings: "设置",
    account: "账户",
    editProfile: "编辑资料",
    changePassword: "修改密码",
    logout: "退出登录",
    appSettings: "应用设置",
    darkMode: "深色模式",
    language: "语言",
    help: "帮助",
    privacy: "隐私",
    manualConnection: "手动连接",
    about: "关于",
    appVersion: "应用版本",
    chooseLanguage: "选择您的语言",
    getStarted: "开始使用",
    myDevices: "我的设备",
    manageDevices: "管理您已连接的设备",
    addNewDevice: "添加新设备",
    connected: "已连接",
    login: "登录",
    email: "电子邮箱",
    password: "密码",
    signIn: "登录",
    forgotPassword: "忘记密码？",
    clickHere: "点击这里。",
    orContinueWith: "或使用以下方式继续",
    letsGetYouIn: "让我们开始吧",
    continueWithFacebook: "使用 FACEBOOK 继续",
    continueWithGoogle: "使用 GOOGLE 继续",
    or: "或",
    signUpWithPassword: "使用密码注册",
    alreadyHaveAccount: "已有账户？",
    logIn: "登录",
    fillYourProfile: "填写您的资料",
    dontWorry: "别担心，您以后随时可以更改",
    name: "姓名",
    nickname: "昵称",
    createPassword: "创建密码",
    repeatPassword: "重复密码",
    agreeTo: "同意",
    termsOfService: "服务条款",
    and: "和",
    privacyPolicy: "隐私政策",
    continue: "继续",
    submit: "提交",
    deleteAccount: "删除账户",
    enterNewPassword: "输入您的新密码",
    currentPassword: "当前密码",
    newPassword: "新密码",
    deviceSetup: "设备设置",
    scanning: "扫描中...",
    connect: "连接",
    networkConfiguration: "网络配置",
    wifiSSID: "Wi-Fi 网络名称",
    wifiPassword: "Wi-Fi 密码",
    configure: "配置",
  },
  "zh-TW": {
    settings: "設定",
    account: "帳戶",
    editProfile: "編輯資料",
    changePassword: "修改密碼",
    logout: "登出",
    appSettings: "應用程式設定",
    darkMode: "深色模式",
    language: "語言",
    help: "說明",
    privacy: "隱私",
    manualConnection: "手動連接",
    about: "關於",
    appVersion: "應用程式版本",
    chooseLanguage: "選擇您的語言",
    getStarted: "開始使用",
    myDevices: "我的裝置",
    manageDevices: "管理您已連接的裝置",
    addNewDevice: "新增裝置",
    connected: "已連接",
    login: "登入",
    email: "電子郵件",
    password: "密碼",
    signIn: "登入",
    forgotPassword: "忘記密碼？",
    clickHere: "點擊這裡。",
    orContinueWith: "或使用以下方式繼續",
    letsGetYouIn: "讓我們開始吧",
    continueWithFacebook: "使用 FACEBOOK 繼續",
    continueWithGoogle: "使用 GOOGLE 繼續",
    or: "或",
    signUpWithPassword: "使用密碼註冊",
    alreadyHaveAccount: "已有帳戶？",
    logIn: "登入",
    fillYourProfile: "填寫您的資料",
    dontWorry: "別擔心，您以後隨時可以更改",
    name: "姓名",
    nickname: "暱稱",
    createPassword: "建立密碼",
    repeatPassword: "重複密碼",
    agreeTo: "同意",
    termsOfService: "服務條款",
    and: "和",
    privacyPolicy: "隱私政策",
    continue: "繼續",
    submit: "提交",
    deleteAccount: "刪除帳戶",
    enterNewPassword: "輸入您的新密碼",
    currentPassword: "目前密碼",
    newPassword: "新密碼",
    deviceSetup: "裝置設定",
    scanning: "掃描中...",
    connect: "連接",
    networkConfiguration: "網路設定",
    wifiSSID: "Wi-Fi 網路名稱",
    wifiPassword: "Wi-Fi 密碼",
    configure: "設定",
  },
  nl: {
    settings: "Instellingen",
    account: "Account",
    editProfile: "Profiel bewerken",
    changePassword: "Wachtwoord wijzigen",
    logout: "Uitloggen",
    appSettings: "App-instellingen",
    darkMode: "Donkere modus",
    language: "Taal",
    help: "Help",
    privacy: "Privacy",
    manualConnection: "Handmatige verbinding",
    about: "Over",
    appVersion: "App-versie",
    chooseLanguage: "Kies uw taal",
    myDevices: "Mijn apparaten",
    manageDevices: "Beheer uw verbonden apparaten",
    addNewDevice: "Nieuw apparaat toevoegen",
    connected: "Verbonden",
  },
  "en-AU": {
    settings: "Settings",
    account: "Account",
    editProfile: "Edit Profile",
    changePassword: "Change password",
    logout: "Logout",
    appSettings: "App Settings",
    darkMode: "Dark Mode",
    language: "Language",
    help: "Help",
    privacy: "Privacy",
    manualConnection: "Manual connection",
    about: "About",
    appVersion: "App version",
    chooseLanguage: "Choose your language",
    myDevices: "My Devices",
    manageDevices: "Manage your connected devices",
    addNewDevice: "Add New Device",
    connected: "Connected",
  },
  "en-GB": {
    settings: "Settings",
    account: "Account",
    editProfile: "Edit Profile",
    changePassword: "Change password",
    logout: "Logout",
    appSettings: "App Settings",
    darkMode: "Dark Mode",
    language: "Language",
    help: "Help",
    privacy: "Privacy",
    manualConnection: "Manual connection",
    about: "About",
    appVersion: "App version",
    chooseLanguage: "Choose your language",
    myDevices: "My Devices",
    manageDevices: "Manage your connected devices",
    addNewDevice: "Add New Device",
    connected: "Connected",
  },
  fr: {
    settings: "Paramètres",
    account: "Compte",
    editProfile: "Modifier le profil",
    changePassword: "Changer le mot de passe",
    logout: "Déconnexion",
    appSettings: "Paramètres de l'application",
    darkMode: "Mode sombre",
    language: "Langue",
    help: "Aide",
    privacy: "Confidentialité",
    manualConnection: "Connexion manuelle",
    about: "À propos",
    appVersion: "Version de l'application",
    chooseLanguage: "Choisissez votre langue",
    myDevices: "Mes appareils",
    manageDevices: "Gérer vos appareils connectés",
    addNewDevice: "Ajouter un nouvel appareil",
    connected: "Connecté",
  },
  de: {
    settings: "Einstellungen",
    account: "Konto",
    editProfile: "Profil bearbeiten",
    changePassword: "Passwort ändern",
    logout: "Abmelden",
    appSettings: "App-Einstellungen",
    darkMode: "Dunkler Modus",
    language: "Sprache",
    help: "Hilfe",
    privacy: "Datenschutz",
    manualConnection: "Manuelle Verbindung",
    about: "Über",
    appVersion: "App-Version",
    chooseLanguage: "Wählen Sie Ihre Sprache",
    myDevices: "Meine Geräte",
    manageDevices: "Verwalten Sie Ihre verbundenen Geräte",
    addNewDevice: "Neues Gerät hinzufügen",
    connected: "Verbunden",
  },
  it: {
    settings: "Impostazioni",
    account: "Account",
    editProfile: "Modifica profilo",
    changePassword: "Cambia password",
    logout: "Esci",
    appSettings: "Impostazioni app",
    darkMode: "Modalità scura",
    language: "Lingua",
    help: "Aiuto",
    privacy: "Privacy",
    manualConnection: "Connessione manuale",
    about: "Informazioni",
    appVersion: "Versione app",
    chooseLanguage: "Scegli la tua lingua",
    myDevices: "I miei dispositivi",
    manageDevices: "Gestisci i tuoi dispositivi connessi",
    addNewDevice: "Aggiungi nuovo dispositivo",
    connected: "Connesso",
  },
  "pt-BR": {
    settings: "Configurações",
    account: "Conta",
    editProfile: "Editar perfil",
    changePassword: "Alterar senha",
    logout: "Sair",
    appSettings: "Configurações do aplicativo",
    darkMode: "Modo escuro",
    language: "Idioma",
    help: "Ajuda",
    privacy: "Privacidade",
    manualConnection: "Conexão manual",
    about: "Sobre",
    appVersion: "Versão do aplicativo",
    chooseLanguage: "Escolha seu idioma",
    myDevices: "Meus dispositivos",
    manageDevices: "Gerencie seus dispositivos conectados",
    addNewDevice: "Adicionar novo dispositivo",
    connected: "Conectado",
  },
  "pt-PT": {
    settings: "Definições",
    account: "Conta",
    editProfile: "Editar perfil",
    changePassword: "Alterar palavra-passe",
    logout: "Terminar sessão",
    appSettings: "Definições da aplicação",
    darkMode: "Modo escuro",
    language: "Idioma",
    help: "Ajuda",
    privacy: "Privacidade",
    manualConnection: "Ligação manual",
    about: "Acerca de",
    appVersion: "Versão da aplicação",
    chooseLanguage: "Escolha o seu idioma",
    myDevices: "Os meus dispositivos",
    manageDevices: "Gerir os seus dispositivos ligados",
    addNewDevice: "Adicionar novo dispositivo",
    connected: "Ligado",
  },
  ru: {
    settings: "Настройки",
    account: "Аккаунт",
    editProfile: "Редактировать профиль",
    changePassword: "Изменить пароль",
    logout: "Выйти",
    appSettings: "Настройки приложения",
    darkMode: "Темный режим",
    language: "Язык",
    help: "Помощь",
    privacy: "Конфиденциальность",
    manualConnection: "Ручное подключение",
    about: "О приложении",
    appVersion: "Версия приложения",
    chooseLanguage: "Выберите язык",
    myDevices: "Мои устройства",
    manageDevices: "Управление подключенными устройствами",
    addNewDevice: "Добавить новое устройство",
    connected: "Подключено",
  },
  es: {
    settings: "Configuración",
    account: "Cuenta",
    editProfile: "Editar perfil",
    changePassword: "Cambiar contraseña",
    logout: "Cerrar sesión",
    appSettings: "Configuración de la aplicación",
    darkMode: "Modo oscuro",
    language: "Idioma",
    help: "Ayuda",
    privacy: "Privacidad",
    manualConnection: "Conexión manual",
    about: "Acerca de",
    appVersion: "Versión de la aplicación",
    chooseLanguage: "Elija su idioma",
    myDevices: "Mis dispositivos",
    manageDevices: "Administrar sus dispositivos conectados",
    addNewDevice: "Agregar nuevo dispositivo",
    connected: "Conectado",
  },
};

const languageMap: Record<string, LanguageCode> = {
  "CHINESE (SIMPLIFIED)": "zh-CN",
  "CHINESE (TRADITIONAL)": "zh-TW",
  "DUTCH": "nl",
  "ENGLISH (AUSTRALIA)": "en-AU",
  "ENGLISH (UK)": "en-GB",
  "FRENCH": "fr",
  "GERMAN": "de",
  "ITALIAN": "it",
  "PORTUGUESE (BRAZIL)": "pt-BR",
  "PORTUGUESE (PORTUGAL)": "pt-PT",
  "RUSSIAN": "ru",
  "SPANISH": "es",
  "ENGLISH": "en",
};

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  getLanguageName: (code: LanguageCode) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    // 从存储中加载语言设置
    AsyncStorage.getItem("language").then((savedLang) => {
      if (savedLang && savedLang in translations) {
        setLanguageState(savedLang as LanguageCode);
      } else {
        // 使用系统语言
        try {
          const locales = Localization.getLocales();
          const systemLang = locales && locales.length > 0 
            ? locales[0].languageCode || locales[0].languageTag?.split("-")[0]
            : "en";
          
          if (systemLang) {
            const supportedLang = Object.keys(translations).find(
              (key) => key.split("-")[0] === systemLang
            );
            if (supportedLang) {
              setLanguageState(supportedLang as LanguageCode);
            }
          }
        } catch (error) {
          // 如果获取系统语言失败，使用默认语言 "en"
          console.warn("Failed to get system locale:", error);
        }
      }
    });
  }, []);

  const setLanguage = async (lang: LanguageCode) => {
    setLanguageState(lang);
    await AsyncStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  const getLanguageName = (code: LanguageCode): string => {
    const names: Record<LanguageCode, string> = {
      en: "English",
      "zh-CN": "Chinese (Simplified)",
      "zh-TW": "Chinese (Traditional)",
      nl: "Dutch",
      "en-AU": "English (Australia)",
      "en-GB": "English (UK)",
      fr: "French",
      de: "German",
      it: "Italian",
      "pt-BR": "Portuguese (Brazil)",
      "pt-PT": "Portuguese (Portugal)",
      ru: "Russian",
      es: "Spanish",
    };
    return names[code] || code;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, getLanguageName }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export { languageMap };

