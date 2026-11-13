/**
 * 面试题生成编排逻辑
 * 策略：JSON 模式优先 → 解析失败自动降级 Markdown 模式
 */

import { chatCompletion } from './deepseek'
import { buildJsonPrompt, buildMarkdownPrompt, QUESTION_CATEGORIES } from '../constants/prompts'

/**
 * 从模型输出中尽力提取 JSON 对象
 * 兼容以下情况：
 *  - 被 ```json ... ``` 代码块包裹
 *  - 前后有少量无关文字
 *  - 字段名带引号与否
 */
export function extractJson(text) {
  if (!text) return null
  let t = text.trim()

  // 1. 去除 markdown 代码块包裹
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) t = fence[1].trim()

  // 2. 截取第一个 { 到最后一个 } 之间的内容
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null

  try {
    return JSON.parse(t.slice(start, end + 1))
  } catch {
    return null
  }
}

/**
 * 生成面试题（带 JSON→Markdown 自动降级）
 * @param {object} params
 * @param {string} params.apiKey
 * @param {string} params.apiBase
 * @param {string} params.resumeText  简历文本
 * @param {object} params.config       面试配置 { targetJob, years, difficulty, totalQuestions, temperature }
 * @param {Function} [params.onStage]  阶段回调，用于更新 UI 加载提示
 * @returns {Promise<{mode: 'json'|'markdown', data: object|null, markdown: string}>}
 */
export async function generateQuestions({ apiKey, apiBase, resumeText, config, onStage }) {
  const { targetJob, years, difficulty, totalQuestions, temperature } = config

  // 第一步：JSON 模式（优先）
  onStage?.('正在生成面试题（JSON 模式）…')
  const jsonPrompt = buildJsonPrompt({ resumeText, targetJob, years, difficulty, totalQuestions })
  const raw = await chatCompletion({ apiKey, apiBase, prompt: jsonPrompt, temperature, jsonMode: true })

  const parsed = extractJson(raw)
  const questionList = parsed?.question_list
  if (parsed && Array.isArray(questionList) && questionList.length > 0) {
    return { mode: 'json', data: parsed, markdown: '' }
  }

  // 第二步：JSON 解析失败，自动降级 Markdown 模式
  onStage?.('JSON 解析失败，已自动切换 Markdown 模式重新生成…')
  const mdPrompt = buildMarkdownPrompt({ resumeText, targetJob, years, difficulty, totalQuestions })
  const md = await chatCompletion({ apiKey, apiBase, prompt: mdPrompt, temperature })
  return { mode: 'markdown', data: null, markdown: md }
}

/**
 * 将生成结果统一转换为 Markdown 文本（用于「复制全部」和「导出 Markdown 文件」）
 */
export function resultToMarkdown(result, config) {
  // 降级模式下，模型本身已返回 Markdown，直接使用
  if (result.mode === 'markdown') {
    return result.markdown
  }

  const { targetJob, years, difficulty } = config
  const lines = []
  lines.push('# 面试题目汇总')
  lines.push(`> 岗位：${targetJob}｜工作年限：${years}｜难度：${difficulty}`)

  const questions = result.data?.question_list || []
  for (const category of QUESTION_CATEGORIES) {
    const qs = questions.filter((q) => q.category === category)
    if (qs.length === 0) continue
    lines.push('')
    lines.push(`## ${category}`)
    qs.forEach((q, i) => {
      lines.push(`### 题目${i + 1}：${q.question || ''}`)
      lines.push(`考察点：${q.inspect_point || ''}`)
      lines.push(`来源：${q.source || '—'}`)
      lines.push(`参考答案：${q.reference_answer || ''}`)
      lines.push('')
    })
  }
  return lines.join('\n')
}
