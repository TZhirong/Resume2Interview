/**
 * 内置 Prompt 模板（直接写在前端常量中，不依赖后端）
 *
 * 采用「JSON 优先、Markdown 降级」的双模板策略：
 *  1. 主 Prompt：要求模型输出严格 JSON，便于程序化解析成题目卡片
 *  2. 降级 Prompt：要求模型输出 Markdown，JSON 解析失败时兜底渲染
 *  3. 简历清洗 Prompt：可选功能，用于去除简历中的页眉页脚、乱码
 */

/** 面试题的 5 个固定分类 */
export const QUESTION_CATEGORIES = [
  '基础概念题',
  '简历深挖题',
  '项目细节题',
  '业务场景题',
  '候选人反问面试官题',
]

/**
 * 主 Prompt（JSON 模式，优先使用）
 * 注意：模板中出现的 \`\`\` 为转义后的反引号，实际输出到字符串时是 ``` 标记，
 * 用于明确告诉模型「不要输出 markdown 代码块包裹」。
 */
export function buildJsonPrompt({ resumeText, targetJob, years, difficulty, totalQuestions }) {
  return `你是资深互联网面试官，熟悉计算机与AI相关岗位面试。
任务：基于候选人简历，针对目标岗位生成面试题，题目必须贴合简历内容，禁止生成通用题库。

【候选人简历】
${resumeText}

【面试配置】
目标岗位：${targetJob}
期望工作年限：${years}
面试难度：${difficulty}（初级/中级/高级）
总题目数量：${totalQuestions}道

输出要求：
1. 将题目分为5个类别：["基础概念题","简历深挖题","项目细节题","业务场景题","候选人反问面试官题"]
2. 每一道题目，必须输出：
question：面试题目
inspect_point：考察点，面试官想验证候选人什么能力/知识点
source：题目来源，标注该题来自简历哪一部分（如「项目经历-XX项目」「工作经历-XX公司」「技能-XX」）；纯通用题标注「岗位通用」
reference_answer：参考回答，简洁专业，适合口述，不要长篇大论
3. 输出严格使用JSON格式，不要输出任何前言、解释、markdown、\`\`\`标记，只返回纯JSON。
JSON结构示例：
{
  "job_info":{
    "target_job":"",
    "years":"",
    "difficulty":""
  },
  "question_list":[
    {
      "category":"基础概念题",
      "question":"xxx",
      "inspect_point":"xxx",
      "source":"xxx",
      "reference_answer":"xxx"
    }
  ]
}

约束规则：
1. 简历深挖题必须从候选人简历项目、技能、经历提取，针对简历写过的内容提问，不能凭空出题；
2. 项目细节题重点追问项目难点、方案取舍、数据指标、踩坑复盘；
3. 业务场景题结合目标岗位真实工作场景，考察产品思维、需求权衡、风险判断；
4. 反问面试官题生成3~5道，供候选人面试结尾提问；
5. 如果简历信息不足，在inspect_point里备注「简历信息有限，本题为岗位通用题」；
6. 严禁编造简历不存在的经历；
7. 参考答案精炼简短。
8. 每道题的source必须标注题目来源：简历深挖题、项目细节题必须指向简历中的具体项目/经历，基础概念题可标注「岗位通用」。`
}

/**
 * 降级 Prompt（Markdown 模式，JSON 解析失败时自动切换）
 */
export function buildMarkdownPrompt({ resumeText, targetJob, years, difficulty, totalQuestions }) {
  return `你是资深互联网面试官。根据候选人简历，针对目标岗位生成面试题，题目必须贴合简历，拒绝纯通用题库。

【候选人简历】
${resumeText}

【面试配置】
目标岗位：${targetJob}
期望工作年限：${years}
面试难度：${difficulty}
总题目数量：${totalQuestions}道

输出格式：
# 面试题目汇总
> 岗位：${targetJob}｜工作年限：${years}｜难度：${difficulty}

## 一、基础概念题
### 题目：xxx
考察点：xxx
来源：xxx
参考答案：xxx

## 二、简历深挖题
### 题目：xxx
考察点：xxx
来源：xxx
参考答案：xxx

## 三、项目细节题
### 题目：xxx
考察点：xxx
来源：xxx
参考答案：xxx

## 四、业务场景题
### 题目：xxx
考察点：xxx
来源：xxx
参考答案：xxx

## 五、候选人反问面试官题
### 题目：xxx
考察点：xxx
来源：xxx
参考答案：xxx

规则：
1. 简历深挖题必须基于简历中的项目、技能、经历提问；
2. 项目题重点问：需求设计、技术权衡、难点、指标、踩坑复盘；
3. 不要编造候选人经历；
4. 参考答案简洁精炼，适合面试口述；
5. 每道题需注明「来源」，标注该题来自简历哪一部分。
不要额外输出开场白、总结，直接输出markdown。`
}

/**
 * 简历清洗 Prompt（可选功能，用于简历文本预处理）
 */
export function buildCleanPrompt(rawResumeText) {
  return `任务：清洗简历文本，去除多余空行、页码、页眉页脚、乱码。保留核心信息：个人技能、项目经历、工作经历、教育经历。
只返回清洗后的纯文本，不要多余描述。
简历原文：
${rawResumeText}`
}
