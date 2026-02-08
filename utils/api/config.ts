// Expo 推荐：用 EXPO_PUBLIC_* 注入运行时配置
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export const API_TIMEOUT_MS = 15000;

