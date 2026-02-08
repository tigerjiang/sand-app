import { Alert, Platform } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { oauthLogin } from "../api/auth";

WebBrowser.maybeCompleteAuthSession();

function getRequiredEnv(name: string): string {
  const value = (process.env as any)[name] as string | undefined;
  if (!value) {
    throw new Error(`缺少环境变量 ${name}`);
  }
  return value;
}

export async function signInWithGoogle(): Promise<void> {
  const clientId = getRequiredEnv("EXPO_PUBLIC_GOOGLE_CLIENT_ID");
  const redirectUri = AuthSession.makeRedirectUri();
  const discovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
  };

  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    scopes: ["openid", "profile", "email"],
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
  });

  await request.makeAuthUrlAsync(discovery);
  const result = await request.promptAsync(discovery);
  if (result.type !== "success") return;

  const tokenRes = await AuthSession.exchangeCodeAsync(
    {
      clientId,
      code: result.params.code,
      redirectUri,
      extraParams: request.codeVerifier ? { code_verifier: request.codeVerifier } : {},
    },
    discovery
  );

  const idToken = (tokenRes as any).idToken as string | undefined;
  const accessToken = (tokenRes as any).accessToken as string | undefined;
  if (!idToken && !accessToken) throw new Error("Google 登录未返回 token");

  await oauthLogin({ provider: "google", idToken, accessToken });
}

export async function signInWithFacebook(): Promise<void> {
  const clientId = getRequiredEnv("EXPO_PUBLIC_FACEBOOK_APP_ID");
  const redirectUri = AuthSession.makeRedirectUri();
  const discovery = {
    authorizationEndpoint: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenEndpoint: "https://graph.facebook.com/v19.0/oauth/access_token",
  };

  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    scopes: ["public_profile", "email"],
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
  });

  await request.makeAuthUrlAsync(discovery);
  const result = await request.promptAsync(discovery);
  if (result.type !== "success") return;

  // Facebook 在移动端 PKCE + code 交换通常需要 app secret。
  // 推荐：后端提供 /v1/auth/oauth/facebook 用 code 交换并返回你们自己的 token。
  // 这里先把 code 直接交给后端处理。
  await oauthLogin({ provider: "facebook", accessToken: undefined, idToken: undefined, nonce: result.params.code } as any);
}

export async function signInWithApple(): Promise<void> {
  if (Platform.OS !== "ios") {
    Alert.alert("提示", "Apple 登录仅支持 iOS");
    return;
  }

  let AppleAuth: any;
  try {
    AppleAuth = require("expo-apple-authentication");
  } catch {
    throw new Error("未安装 expo-apple-authentication（请先安装并重新运行）");
  }

  const credential = await AppleAuth.signInAsync({
    requestedScopes: [AppleAuth.AppleAuthenticationScope.FULL_NAME, AppleAuth.AppleAuthenticationScope.EMAIL],
  });

  const idToken = credential?.identityToken as string | undefined;
  const nonce = credential?.nonce as string | undefined;
  if (!idToken) throw new Error("Apple 登录未返回 identityToken");

  await oauthLogin({ provider: "apple", idToken, nonce });
}

