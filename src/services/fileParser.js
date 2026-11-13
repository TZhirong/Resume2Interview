/**
 * 简历文件解析（纯前端本地解析，原始文件不上传服务器）
 * - PDF：使用 pdfjs-dist 在前端提取文本
 * - docx：使用 mammoth 在前端提取文本
 */

import * as pdfjsLib from 'pdfjs-dist'
// 通过 ?url 让 Vite 把 worker 作为静态资源处理，运行时正确加载
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import mammoth from 'mammoth/mammoth.browser'

// 配置 PDF 解析 worker 的地址
pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker

/** 支持的文件扩展名 */
export const SUPPORTED_EXTENSIONS = ['pdf', 'docx']

/**
 * 解析 PDF 文件，返回纯文本
 */
async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer()
  // getDocument 支持直接传入 ArrayBuffer，避免转 base64 的开销
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // items 中每项是一个文本片段，str 即文本内容
    const pageText = content.items.map((item) => item.str).join(' ')
    pages.push(pageText)
  }
  return pages.join('\n').trim()
}

/**
 * 解析 docx 文件，返回纯文本
 */
async function extractDocxText(file) {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return (result.value || '').trim()
}

/**
 * 解析入口：根据文件扩展名分派到对应的解析器
 * @param {File} file
 * @returns {Promise<string>} 提取到的简历纯文本
 */
export async function parseResumeFile(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  if (ext === 'pdf') {
    return extractPdfText(file)
  }
  if (ext === 'docx') {
    return extractDocxText(file)
  }
  throw new Error('不支持的文件格式，请上传 PDF 或 .docx 文件')
}

/** 首行姓名启发式需要排除的常见标题词 */
const NAME_BLACKLIST = [
  '个人简历', '简历', '求职简历', '简历模板', '个人简介',
  '求职意向', '求职目标', '应聘职位', '应聘岗位', '基本信息', '个人信息',
]

/** 姓名启发式需要排除的「字段/标题」关键词（行首候选命中即视为非姓名） */
const NAME_TITLE_WORDS = /电话|手机|邮箱|微信|QQ|地址|性别|年龄|生日|出生|民族|籍贯|学历|学校|专业|工作|项目|经验|技能|求职|意向|应聘|目标|岗位|职位|简介|评价|教育|背景|经理|工程师|设计师|专员|负责人|主管|总监|姓名|名字/

/**
 * 简历文本脱敏：去除姓名、手机号、邮箱、身份证号、微信号、QQ 号等敏感信息
 * 说明：
 *  - 手机号 / 邮箱 / 身份证等采用正则精准匹配
 *  - 姓名采用「标签匹配 + 首行启发式」两种策略，存在少量误判可能，可在上传区关闭自动脱敏
 */
export function sanitizeResumeText(text) {
  if (!text) return text
  let t = text

  // 1. 身份证号（18 位，放在手机号之前，避免长数字被手机号规则截断）
  t = t.replace(/\b\d{17}[\dXx]\b/g, '[身份证号已隐藏]')

  // 2. 中国大陆手机号：支持纯 11 位、3-4-4 分隔符、+86 国际区号
  //    例如：13800138000 / 138-0013-8000 / 138 0013 8000 / +86 13800138000
  t = t.replace(/(?:\+?86[\s-]?)?1[3-9]\d[\s-]?\d{4}[\s-]?\d{4}/g, '[手机号已隐藏]')

  // 3. 座机号码（区号-号码）
  t = t.replace(/\b0\d{2,3}-?\d{7,8}\b/g, '[电话已隐藏]')

  // 4. 邮箱地址
  t = t.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[邮箱已隐藏]')

  // 5. 微信号（标签式）
  t = t.replace(/((?:微信号|微信|wechat|WeChat)\s*[:：]\s*)\S+/g, '$1[微信已隐藏]')

  // 6. QQ 号（标签式，5~11 位数字）
  t = t.replace(/((?:QQ|qq|Qq)\s*[:：]\s*)\d{5,11}/g, '$1[QQ已隐藏]')

  // 7. 姓名（标签式，冒号或空格分隔）：
  //    姓名：张三 / 姓名: 张三 / 姓名 张三 / Name: Zhang San / Name Zhang San
  t = t.replace(/((?:姓名|名字|name)\s*[:：]\s*)[一-龥]{2,4}/gi, '$1[姓名已隐藏]')
  t = t.replace(/((?:姓名|名字|name)\s+)[一-龥]{2,4}/gi, '$1[姓名已隐藏]')
  t = t.replace(/((?:姓名|名字|name)\s*[:：]\s*)[A-Za-z]+(?:\s+[A-Za-z]+)?/gi, '$1[英文姓名已隐藏]')
  t = t.replace(/((?:姓名|名字|name)\s+)[A-Za-z]+(?:\s+[A-Za-z]+)?/gi, '$1[英文姓名已隐藏]')

  // 8. 行首姓名启发式：扫描前几行，找出「行首 2~4 个纯汉字」且不是字段/标题词的行，视为姓名
  //    可覆盖：名字独立成行、名字前有「个人简历」标题、名字与性别/年龄同行（张三 | 男 | 本科）等
  const lines = t.split('\n')
  let checked = 0
  for (let i = 0; i < lines.length && checked < 6; i++) {
    const raw = lines[i]
    const line = raw.trim()
    if (!line) continue
    checked++
    if (NAME_BLACKLIST.includes(line)) continue
    const m = line.match(/^([一-龥]{2,4})(?=$|[\s|·，,、/])/)
    if (!m) continue
    if (NAME_TITLE_WORDS.test(m[1])) continue
    lines[i] = raw.replace(m[1], '[姓名已隐藏]')
    t = lines.join('\n')
    break
  }

  return t
}
