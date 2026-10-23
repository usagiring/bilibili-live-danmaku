export const QUALITY_MAP = {
  原画: 10000,
  蓝光: 400,
  超清: 250,
  高清: 150,
  流畅: 80,
}

export const COLORS = [
  'crimson',
  'darkorange',
  'gold',
  'forestgreen',
  'darkcyan',
  'dodgerblue',
  'violet',
]

// export const DEFAULT_FONTS = ['inherit', 'initial', 'unset']
// export const DEFAULT_COMMON_FONT_FAMILIES = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy']

// ── 窗口置顶层级 ──
// Windows 上只有两种真实行为（见 electron/shell/browser/native_window_views.cc）：
// floating..status 会被 SetWindowPos 塞到任务栏后面，pop-up-menu / screen-saver 不做处理，
// 自然浮在任务栏之上。其余 5 个 level 在 Windows 上是纯别名，所以只暴露三档。
export type WindowTopLevel = 'off' | 'floating' | 'screen-saver'

export const DEFAULT_TOP_LEVEL: WindowTopLevel = 'off'

export const WINDOW_TOP_LEVELS: { value: WindowTopLevel; label: string; tip: string }[] = [
  { value: 'off', label: '关闭', tip: '不置顶，会被其它窗口遮挡' },
  { value: 'floating', label: '普通置顶', tip: '覆盖普通窗口，但不遮挡任务栏' },
  {
    value: 'screen-saver',
    label: '压住任务栏',
    tip: '覆盖任务栏与开始菜单，适合全屏播放；独占全屏的游戏仍会盖住本窗口',
  },
]

/** 把任意值收敛为合法层级（未知值按「关闭」处理） */
export function normalizeTopLevel(level?: string | null): WindowTopLevel {
  return level === 'floating' || level === 'screen-saver' ? level : DEFAULT_TOP_LEVEL
}

/**
 * 旧配置只有 isWindowAlwaysOnTop 布尔，这里按它推导出层级。
 * 只改内存，等用户第一次操作时随 setVal 一起落库，避免每次启动都产生写请求。
 */
export function migrateTopLevel(
  section?: { windowTopLevel?: string; isWindowAlwaysOnTop?: boolean } | null,
) {
  if (!section) return
  section.windowTopLevel =
    section.windowTopLevel == null
      ? section.isWindowAlwaysOnTop
        ? 'floating'
        : 'off'
      : normalizeTopLevel(section.windowTopLevel)
}

export const IPC_CHECK_FOR_UPDATE = 'IPC_CHECK_FOR_UPDATE'
export const IPC_UPDATE_AVAILABLE = 'IPC_UPDATE_AVAILABLE'
export const IPC_DOWNLOAD_UPDATE = 'IPC_DOWNLOAD_UPDATE'
export const IPC_DOWNLOAD_PROGRESS = 'IPC_DOWNLOAD_PROGRESS'
export const IPC_UPDATE_DOWNLOADED = 'IPC_UPDATE_DOWNLOADED'
export const IPC_UPDATE_ERROR = 'IPC_UPDATE_ERROR'
export const IPC_UPDATE_NOT_AVAILABLE = 'IPC_UPDATE_NOT_AVAILABLE'
export const IPC_GET_USER_PATH = 'IPC_GET_USER_PATH'
export const IPC_GET_VERSION = 'IPC_GET_VERSION'
export const IPC_GET_EXE_PATH = 'IPC_GET_EXE_PATH'
export const IPC_CHOOSE_DIRECTORY = 'IPC_CHOOSE_DIRECTORY'
export const IPC_GIFT_STATS_EXPORT = 'IPC_GIFT_STATS_EXPORT'
export const IPC_WINDOW_CREATE = 'IPC_WINDOW_CREATE'
export const IPC_WINDOW_FIND = 'IPC_WINDOW_FIND'
export const IPC_SHOW_OPEN_DIALOG = 'IPC_SHOW_OPEN_DIALOG'
export const IPC_GET_CURRENT_WINDOW_ID = 'IPC_GET_CURRENT_WINDOW_ID'
export const IPC_MAIN_WINDOW_ACTION = 'IPC_MAIN_WINDOW_ACTION'
export const IPC_WINDOW_ACTION = 'IPC_WINDOW_ACTION'
export const IPC_WINDOW_LOCATION_UPDATE = 'IPC_WINDOW_LOCATION_UPDATE'
