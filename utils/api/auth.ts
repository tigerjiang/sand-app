import { apiRequest } from "./http";
import type { AuthTokens, ChangePasswordRequest, LoginRequest, OAuthLoginRequest, RegisterRequest, User } from "./types";
import { clearTokens, setCachedUser, setTokens } from "./tokenStore";

export async function register(payload: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
  const data = await apiRequest<{ user: User; tokens: AuthTokens }>("/v1/auth/register", {
    method: "POST",
    auth: false,
    body: payload,
  });
  await setTokens(data.tokens);
  await setCachedUser(data.user);
  return data;
}

export async function login(payload: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
  const data = await apiRequest<{ user: User; tokens: AuthTokens }>("/v1/auth/login", {
    method: "POST",
    auth: false,
    body: payload,
  });
  await setTokens(data.tokens);
  await setCachedUser(data.user);
  return data;
}

export async function oauthLogin(payload: OAuthLoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
  const data = await apiRequest<{ user: User; tokens: AuthTokens }>(`/v1/auth/oauth/${payload.provider}`, {
    method: "POST",
    auth: false,
    body: payload,
  });
  await setTokens(data.tokens);
  await setCachedUser(data.user);
  return data;
}

export async function getMe(): Promise<User> {
  return await apiRequest<User>("/v1/users/me", { method: "GET" });
}

export async function updateMe(payload: Partial<Pick<User, "name" | "nickname" | "avatarUrl">>): Promise<User> {
  const user = await apiRequest<User>("/v1/users/me", { method: "PATCH", body: payload });
  await setCachedUser(user);
  return user;
}

export async function changePassword(payload: ChangePasswordRequest): Promise<void> {
  await apiRequest<void>("/v1/auth/change-password", { method: "POST", body: payload });
}

export async function logout(): Promise<void> {
  // 后端可选实现：使 token 失效
  try {
    await apiRequest<void>("/v1/auth/logout", { method: "POST" });
  } finally {
    await clearTokens();
    await setCachedUser(null);
  }
}

export async function deleteMe(): Promise<void> {
  await apiRequest<void>("/v1/users/me", { method: "DELETE" });
  await clearTokens();
  await setCachedUser(null);
}

