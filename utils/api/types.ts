export type ApiErrorCode =
  | 0
  | 400
  | 401
  | 403
  | 404
  | 409
  | 422
  | 429
  | 500;

export type ApiResponse<T> = {
  code: ApiErrorCode;
  message: string;
  data: T;
  traceId?: string;
};

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
};

export type Paged<T> = {
  items: T[];
  page: Pagination;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number; // seconds
  tokenType?: "Bearer";
};

export type User = {
  id: string;
  email: string;
  name?: string;
  nickname?: string;
  avatarUrl?: string;
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
};

// 资源：图案（用于 community / playlist / device）
export type PatternResource = {
  id: string; // 平台资源 id
  title: string;
  svgUrl: string; // 远程 svg（用于展示）
  thrUrl: string; // 远程 thr（用于 onlinePlayCommand）
  patternId?: number; // 设备侧 pattern_id（如果有）
  tags?: string[];
  isFavorite?: boolean;
  author?: {
    id?: string;
    name?: string;
    avatarUrl?: string;
  };
};

export type MusicPlaylist = {
  id: string;
  name: string;
  // 该音乐/白噪音对应的图案列表
  patterns: PatternResource[];
};

export type MusicItem = {
  id: string;
  name: string;
   // 该音乐/白噪音对应的图案列表
  patterns: PatternResource[];
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
};

// 我的播放列表（云端逻辑，和设备 SD 卡无关）
export type UserPlaylist = {
  id: string;
  name: string;
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
  // 列表里的图案
  patterns?: PatternResource[];
};

// 账号相关请求体
export type RegisterRequest = {
  email: string;
  password: string;
  name?: string;
  nickname?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type OAuthProvider = "google" | "facebook" | "apple";

export type OAuthLoginRequest = {
  provider: OAuthProvider;
  // Google/Apple: 推荐传 idToken；Facebook: 通常传 accessToken
  idToken?: string;
  accessToken?: string;
  // Apple 可选：nonce（如果你们后端校验）
  nonce?: string;
};

