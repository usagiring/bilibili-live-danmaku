import { IPC_WINDOW_ACTION, normalizeTopLevel, type WindowTopLevel } from '../../service/const'

export type SubWindowType = 'dm' | 'dm-raw' | 'live' | 'gift'

interface TopLevelSection {
  windowTopLevel?: string
  isWindowAlwaysOnTop?: boolean
}

/**
 * 从配置块解析出层级。
 * 兼容只有 isWindowAlwaysOnTop 布尔的旧配置（此时 true → 普通置顶，与旧行为一致）。
 */
export function resolveTopLevel(section?: TopLevelSection | null): WindowTopLevel {
  if (!section) return 'off'
  if (section.windowTopLevel != null) return normalizeTopLevel(section.windowTopLevel)
  return section.isWindowAlwaysOnTop ? 'floating' : 'off'
}

/** 层级 → setAlwaysOnTop 入参。关闭时不传 level，避免落回默认值。 */
export function topLevelArgs(level?: string | null): unknown[] {
  const normalized = normalizeTopLevel(level)
  return normalized === 'off' ? [false] : [true, normalized]
}

/** 按窗口类型（该类型下的所有窗口）应用层级 */
export function applyTopLevelByType(type: SubWindowType, level?: string | null) {
  return window.ipcRenderer.invoke(IPC_WINDOW_ACTION, {
    type,
    action: 'setAlwaysOnTop',
    args: topLevelArgs(level),
  })
}

/** 按窗口 id 应用层级 */
export function applyTopLevelById(id: number, level?: string | null) {
  return window.ipcRenderer.invoke(IPC_WINDOW_ACTION, {
    id,
    action: 'setAlwaysOnTop',
    args: topLevelArgs(level),
  })
}

/** 是否显示在任务栏，对所有已打开的独立窗口生效 */
export function applyShowInTaskbar(show: boolean) {
  return window.ipcRenderer.invoke(IPC_WINDOW_ACTION, {
    action: 'setSkipTaskbar',
    args: [!show],
  })
}
