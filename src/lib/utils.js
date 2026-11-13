/**
 * 通用工具函数
 */

/** 合并 class，过滤空值（类似 clsx / cn 的极简实现） */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

/** 数字区间钳制 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/**
 * 复制文本到剪贴板
 * 优先使用现代 Clipboard API，失败时降级到 execCommand
 */
export async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
  } else {
    // 降级方案：临时 textarea（兼容非 HTTPS 场景，如本地局域网访问）
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}

/**
 * 下载文本文件（用于导出 Markdown）
 */
export function downloadFile(filename, content, mime = 'text/markdown') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 粗略估算 token 数量（用于提示简历文本较大、消耗更多 token）
 * 中文约 0.6 token/字，英文/数字约 0.25 token/字符，均为估算值
 */
export function estimateTokens(text) {
  if (!text) return 0
  const cnCount = (text.match(/[一-龥]/g) || []).length
  const otherCount = text.length - cnCount
  return Math.ceil(cnCount * 0.6 + otherCount * 0.25)
}

/** 生成短时间字符串，用于历史记录展示 */
export function formatTime(timestamp) {
  const d = new Date(timestamp)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
