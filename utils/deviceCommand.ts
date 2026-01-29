import { mqttManager } from "./mqttManager";

// 指令响应接口
export interface CommandResponse {
  state: number;  // 1-成功，0-失败
  cmdid: string; // 请求携带的cmdid
  list?: Array<{ name: string }>; // 用于 getLocalRes 响应
}

// LED 颜色 RGB 格式（用于指令）
export interface LEDColorRGB {
  rgb: string; // 格式: "255, 100, 50"
}

// 睡眠时间格式
export interface SleepTime {
  on: string;  // 格式: "9:45"
  off: string; // 格式: "23:59"
}

// 在线播放列表项
export interface OnlinePlayListItem {
  url: string;
}

// 在线播放数据
export interface OnlinePlayData {
  pattern_id?: number;
  url: string;
  list: OnlinePlayListItem[];
}

// 白噪音数据
export interface SoundData {
  sound_id: number;
  sound_type: number; // 1-单曲循环，2-列表循环，3-随机播放
}

// 导入图案数据
export interface ImportPatternData {
  name: string;
  url: string;
}

// 指令基础接口
interface BaseCommand {
  scmd: string;
  cmdid: string;
  mac: string;
  data?: any;
}

/**
 * 生成唯一的指令 ID
 */
function generateCommandId(): string {
  return Date.now().toString();
}

/**
 * 构建并发送指令
 */
async function sendCommand(
  mac: string,
  scmd: string,
  data?: any,
  cmdid?: string
): Promise<void> {
  if (!mac) {
    throw new Error("设备 MAC 地址不能为空");
  }

  if (!mqttManager.getConnected()) {
    throw new Error("MQTT 未连接，请先连接 MQTT 服务器");
  }

  const commandId = cmdid || generateCommandId();
  const commandTopic = `command/${mac}`;

  const command: BaseCommand = {
    scmd: scmd.trim(),
    cmdid: commandId,
    mac: mac,
  };

  if (data !== undefined && data !== null) {
    command.data = data;
  }

  try {
    await mqttManager.publish(commandTopic, command);
    console.log(`指令已发送: ${scmd}`, command);
  } catch (error) {
    console.error(`发送指令失败: ${scmd}`, error);
    throw error;
  }
}

/**
 * 1. 开关机
 * @param mac 设备 MAC 地址
 * @param state 1-开机，0-关机
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function powerCommand(
  mac: string,
  state: 0 | 1,
  cmdid?: string
): Promise<void> {
  await sendCommand(mac, "power", { state }, cmdid);
}

/**
 * 2. LED灯控制
 * @param mac 设备 MAC 地址
 * @param state 1-开灯，0-关灯
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function lightCommand(
  mac: string,
  state: 0 | 1,
  cmdid?: string
): Promise<void> {
  await sendCommand(mac, "light", { state }, cmdid);
}

/**
 * 3. 播放控制
 * @param mac 设备 MAC 地址
 * @param state 1-播放，0-暂停
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function playCommand(
  mac: string,
  state: 0 | 1,
  cmdid?: string
): Promise<void> {
  await sendCommand(mac, "play", { state }, cmdid);
}

/**
 * 4. 设置LED灯颜色
 * @param mac 设备 MAC 地址
 * @param colors 颜色数组，格式: [{"rgb": "255, 100, 50"}, ...]
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function setLedColorCommand(
  mac: string,
  colors: LEDColorRGB[],
  cmdid?: string
): Promise<void> {
  await sendCommand(mac, "setLedColor", { colors }, cmdid);
}

/**
 * 5. 设置LED速度
 * @param mac 设备 MAC 地址
 * @param speed 速度值 0-255
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function setLedSpeedCommand(
  mac: string,
  speed: number,
  cmdid?: string
): Promise<void> {
  if (speed < 0 || speed > 255) {
    throw new Error("LED速度必须在 0-255 之间");
  }
  await sendCommand(mac, "setLedSpeed", { speed }, cmdid);
}

/**
 * 6. 设置LED灯光转向
 * @param mac 设备 MAC 地址
 * @param state 1-开启，0-关闭
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function setLedLSCommand(
  mac: string,
  state: 0 | 1,
  cmdid?: string
): Promise<void> {
  await sendCommand(mac, "setLedLS", { state }, cmdid);
}

/**
 * 7. 设置LED循环模式
 * @param mac 设备 MAC 地址
 * @param state 1-开启，0-关闭
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function setLedLoopCommand(
  mac: string,
  state: 0 | 1,
  cmdid?: string
): Promise<void> {
  await sendCommand(mac, "setLedLoop", { state }, cmdid);
}

/**
 * 8. 设置LED亮度
 * @param mac 设备 MAC 地址
 * @param light 亮度值 0-255
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function setLedBrightCommand(
  mac: string,
  light: number,
  cmdid?: string
): Promise<void> {
  if (light < 0 || light > 255) {
    throw new Error("LED亮度必须在 0-255 之间");
  }
  await sendCommand(mac, "setLedBright", { light }, cmdid);
}

/**
 * 9. 设置钢珠速度
 * @param mac 设备 MAC 地址
 * @param speed 速度值 0-255
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function setBallSpeedCommand(
  mac: string,
  speed: number,
  cmdid?: string
): Promise<void> {
  if (speed < 0 || speed > 255) {
    throw new Error("钢珠速度必须在 0-255 之间");
  }
  await sendCommand(mac, "setBallSpeed", { speed }, cmdid);
}

/**
 * 10. 反向绘制模式
 * @param mac 设备 MAC 地址
 * @param state 1-开启，0-关闭
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function reverseDrawCommand(
  mac: string,
  state: 0 | 1,
  cmdid?: string
): Promise<void> {
  await sendCommand(mac, "reverseDraw", { state }, cmdid);
}

/**
 * 11. 重启设备
 * @param mac 设备 MAC 地址
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function restartCommand(
  mac: string,
  cmdid?: string
): Promise<void> {
  await sendCommand(mac, "restart", undefined, cmdid);
}

/**
 * 12. 恢复出厂设置
 * @param mac 设备 MAC 地址
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function resetCommand(
  mac: string,
  cmdid?: string
): Promise<void> {
  await sendCommand(mac, "reset", undefined, cmdid);
}

/**
 * 13. 设置设备名称
 * @param mac 设备 MAC 地址
 * @param name 设备名称
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function setNameCommand(
  mac: string,
  name: string,
  cmdid?: string
): Promise<void> {
  if (!name || name.trim().length === 0) {
    throw new Error("设备名称不能为空");
  }
  await sendCommand(mac, "setName", { name }, cmdid);
}

/**
 * 14. 设置睡眠时间
 * @param mac 设备 MAC 地址
 * @param sleepTime 睡眠时间对象 {on: "9:45", off: "23:59"}
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function setSleepTimeCommand(
  mac: string,
  sleepTime: SleepTime,
  cmdid?: string
): Promise<void> {
  await sendCommand(mac, "setSleepTime", sleepTime, cmdid);
}

/**
 * 15. 设置图案播放间隔时间
 * @param mac 设备 MAC 地址
 * @param time 间隔时间（分钟）1-59
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function setGapTimeCommand(
  mac: string,
  time: number,
  cmdid?: string
): Promise<void> {
  if (time < 1 || time > 59) {
    throw new Error("间隔时间必须在 1-59 分钟之间");
  }
  await sendCommand(mac, "setGapTime", { time }, cmdid);
}

/**
 * 16. 播放在线图案
 * @param mac 设备 MAC 地址
 * @param playData 在线播放数据
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function onlinePlayCommand(
  mac: string,
  playData: OnlinePlayData,
  cmdid?: string
): Promise<void> {
  await sendCommand(mac, "onlinePlay", playData, cmdid);
}

/**
 * 17. 播放SD卡上的图案
 * @param mac 设备 MAC 地址
 * @param name SD卡图案名称
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function localPlayCommand(
  mac: string,
  name: string,
  cmdid?: string
): Promise<void> {
  if (!name || name.trim().length === 0) {
    throw new Error("图案名称不能为空");
  }
  await sendCommand(mac, "localPlay", { name }, cmdid);
}

/**
 * 18. 播放白噪音
 * @param mac 设备 MAC 地址
 * @param soundData 白噪音数据
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function soundCommand(
  mac: string,
  soundData: SoundData,
  cmdid?: string
): Promise<void> {
  await sendCommand(mac, "sound", soundData, cmdid);
}

/**
 * 19. 导入图案到SD卡
 * @param mac 设备 MAC 地址
 * @param importData 导入图案数据
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function importCommand(
  mac: string,
  importData: ImportPatternData,
  cmdid?: string
): Promise<void> {
  if (!importData.name || importData.name.trim().length === 0) {
    throw new Error("图案名称不能为空");
  }
  if (!importData.url || importData.url.trim().length === 0) {
    throw new Error("图案URL不能为空");
  }
  await sendCommand(mac, "import", importData, cmdid);
}

/**
 * 20. 删除SD卡上的图案
 * @param mac 设备 MAC 地址
 * @param name SD卡图案名称
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function deleteCommand(
  mac: string,
  name: string,
  cmdid?: string
): Promise<void> {
  if (!name || name.trim().length === 0) {
    throw new Error("图案名称不能为空");
  }
  await sendCommand(mac, "delete", { name }, cmdid);
}

/**
 * 21. 获取SD卡上图案列表
 * @param mac 设备 MAC 地址
 * @param cmdid 指令ID（可选，自动生成）
 */
export async function getLocalResCommand(
  mac: string,
  cmdid?: string
): Promise<void> {
  await sendCommand(mac, "getLocalRes", undefined, cmdid);
}

/**
 * 监听指令响应
 * @param mac 设备 MAC 地址
 * @param onResponse 响应回调函数
 * @returns 取消监听的函数
 */
export function listenCommandResponse(
  mac: string,
  onResponse: (response: CommandResponse) => void
): () => void {
  const commandTopic = `command/${mac}`;
  
  // 监听 command 主题的响应（通常响应会发布到同一个主题或特定响应主题）
  // 注意：根据实际协议，响应可能发布到不同的主题，这里假设响应也发布到 command 主题
  const unsubscribe = mqttManager.onMessage((message) => {
    // 检查是否是响应消息（包含 state 和 cmdid 字段）
    if (
      message.topic === commandTopic &&
      message.payload &&
      typeof message.payload === "object" &&
      "state" in message.payload &&
      "cmdid" in message.payload
    ) {
      const response = message.payload as CommandResponse;
      onResponse(response);
    }
  });

  return unsubscribe;
}

/**
 * 辅助函数：将 RGB 颜色对象转换为指令格式
 * @param colors RGB 颜色数组 [{r: 255, g: 100, b: 50}, ...]
 * @returns LEDColorRGB 数组
 */
export function convertColorsToCommandFormat(
  colors: Array<{ r: number; g: number; b: number }>
): LEDColorRGB[] {
  return colors.map((color) => ({
    rgb: `${color.r}, ${color.g}, ${color.b}`,
  }));
}


