import { apiRequest } from "./http";
import { deleteCommand, importCommand } from "../deviceCommand";
import type { MusicPlaylist, Paged, PatternResource, UserPlaylist } from "./types";

// 社区图案列表（community tab）
export async function getCommunityPatterns(params?: {
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paged<PatternResource>> {
  return await apiRequest<Paged<PatternResource>>("/v1/resources/community/patterns", {
    method: "GET",
    query: params,
  });
}

// 音乐/白噪音维度的 playlist（playlist tab）
export async function getMusicPlaylists(params?: {
  page?: number;
  pageSize?: number;
}): Promise<Paged<MusicPlaylist>> {
  return await apiRequest<Paged<MusicPlaylist>>("/v1/resources/music-playlists", {
    method: "GET",
    query: params,
  });
}

// 我的图案（云端个人资源库）。
// 注意：你们业务里的「MyPattern」如果指的是“设备 SD 卡内容”，那应当走 MQTT：
// - getLocalResCommand（拉取 SD 列表）
// - importCommand/deleteCommand（导入/删除 SD 图案）
// 这里的 getMyPatterns() 表示云端的“我的图案库”，和 SD 卡是两个概念。
export async function getMyPatterns(params?: {
  page?: number;
  pageSize?: number;
}): Promise<Paged<PatternResource>> {
  return await apiRequest<Paged<PatternResource>>("/v1/resources/me/patterns", {
    method: "GET",
    query: params,
  });
}

// 我的收藏（myFavorite tab）
export async function getMyFavorites(params?: {
  page?: number;
  pageSize?: number;
}): Promise<Paged<PatternResource>> {
  return await apiRequest<Paged<PatternResource>>("/v1/resources/me/favorites", {
    method: "GET",
    query: params,
  });
}

export async function addFavorite(patternId: string): Promise<void> {
  await apiRequest<void>(`/v1/resources/me/favorites/${encodeURIComponent(patternId)}`, { method: "POST" });
}

export async function removeFavorite(patternId: string): Promise<void> {
  await apiRequest<void>(`/v1/resources/me/favorites/${encodeURIComponent(patternId)}`, { method: "DELETE" });
}

// -----------------------------
// 我的播放列表（云端）
// -----------------------------

export async function getMyPlaylists(params?: {
  page?: number;
  pageSize?: number;
}): Promise<Paged<UserPlaylist>> {
  return await apiRequest<Paged<UserPlaylist>>("/v1/resources/me/playlists", {
    method: "GET",
    query: params,
  });
}

export async function getMyPlaylistDetail(playlistId: string): Promise<UserPlaylist> {
  return await apiRequest<UserPlaylist>(`/v1/resources/me/playlists/${encodeURIComponent(playlistId)}`, {
    method: "GET",
  });
}

export async function createMyPlaylist(payload: { name: string }): Promise<UserPlaylist> {
  return await apiRequest<UserPlaylist>("/v1/resources/me/playlists", {
    method: "POST",
    body: payload,
  });
}

export async function renameMyPlaylist(playlistId: string, payload: { name: string }): Promise<UserPlaylist> {
  return await apiRequest<UserPlaylist>(`/v1/resources/me/playlists/${encodeURIComponent(playlistId)}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function deleteMyPlaylist(playlistId: string): Promise<void> {
  await apiRequest<void>(`/v1/resources/me/playlists/${encodeURIComponent(playlistId)}`, { method: "DELETE" });
}

// 把某个图案加入我的播放列表
export async function addPatternToMyPlaylist(playlistId: string, patternId: string): Promise<void> {
  await apiRequest<void>(
    `/v1/resources/me/playlists/${encodeURIComponent(playlistId)}/items/${encodeURIComponent(patternId)}`,
    { method: "POST" }
  );
}

export async function removePatternFromMyPlaylist(playlistId: string, patternId: string): Promise<void> {
  await apiRequest<void>(
    `/v1/resources/me/playlists/${encodeURIComponent(playlistId)}/items/${encodeURIComponent(patternId)}`,
    { method: "DELETE" }
  );
}

// -----------------------------
// 设备 SD 卡（通过 MQTT 指令，而不是 HTTP）
// -----------------------------

function guessSdPatternName(pattern: PatternResource): string {
  // 优先从 thrUrl 的文件名推断（例如 xxx/abc.thr -> abc）
  try {
    const u = new URL(pattern.thrUrl);
    const parts = u.pathname.split("/").filter(Boolean);
    const filename = parts[parts.length - 1] || "";
    const base = filename.replace(/\.thr$/i, "");
    if (base.trim()) return base.trim();
  } catch {
    // ignore
  }

  // 兜底：用标题（注意：设备侧如果要求特定命名规则，请在此处做清洗）
  return pattern.title;
}

/**
 * 添加/导入图案到设备 SD 卡
 * - 走 MQTT 指令：importCommand(mac, { name, url })
 * - url 使用 PatternResource.thrUrl（必须是设备可访问的公网/局域网 URL）
 */
export async function addPatternToSdCard(
  mac: string,
  pattern: PatternResource,
  options?: { sdName?: string }
): Promise<void> {
  const name = options?.sdName?.trim() || guessSdPatternName(pattern);
  await importCommand(mac, { name, url: pattern.thrUrl });
}

/**
 * 从设备 SD 卡删除图案
 * - 走 MQTT 指令：deleteCommand(mac, name)
 */
export async function removePatternFromSdCard(mac: string, sdName: string): Promise<void> {
  await deleteCommand(mac, sdName);
}

