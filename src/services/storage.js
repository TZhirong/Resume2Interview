/**
 * localStorage 封装
 * - API 配置（密钥、接口地址）：保存在浏览器本地，不上传服务器
 * - 历史记录：保存简历摘要、岗位信息、生成的面试题
 */

const API_CONFIG_KEY = 'r2i_api_config'
const HISTORY_KEY = 'r2i_history'

const DEFAULT_API_BASE = 'https://api.deepseek.com/v1'

/* -------------------- API 配置 -------------------- */

export function loadApiConfig() {
  try {
    const raw = localStorage.getItem(API_CONFIG_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        apiKey: parsed.apiKey || '',
        apiBase: parsed.apiBase || DEFAULT_API_BASE,
      }
    }
  } catch (e) {
    // 解析失败时静默降级为默认值
    console.warn('读取 API 配置失败，已使用默认值', e)
  }
  return { apiKey: '', apiBase: DEFAULT_API_BASE }
}

export function saveApiConfig(config) {
  localStorage.setItem(
    API_CONFIG_KEY,
    JSON.stringify({
      apiKey: config.apiKey || '',
      apiBase: config.apiBase || DEFAULT_API_BASE,
    }),
  )
}

/* -------------------- 历史记录 -------------------- */

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (raw) {
      const list = JSON.parse(raw)
      return Array.isArray(list) ? list : []
    }
  } catch (e) {
    console.warn('读取历史记录失败', e)
  }
  return []
}

export function saveHistory(list) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
}

/** 新增一条历史记录，返回新的记录对象 */
export function addHistory(record) {
  const list = loadHistory()
  // 限制最多保存 50 条，避免 localStorage 撑满
  list.unshift(record)
  if (list.length > 50) list.length = 50
  saveHistory(list)
  return list
}

/** 删除指定 id 的历史记录 */
export function removeHistory(id) {
  const list = loadHistory().filter((item) => item.id !== id)
  saveHistory(list)
  return list
}

/** 清空全部历史记录 */
export function clearHistory() {
  saveHistory([])
  return []
}
