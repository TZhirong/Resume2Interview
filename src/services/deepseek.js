/**
 * DeepSeek API 请求封装
 * DeepSeek 提供 OpenAI 兼容接口，可直接从前端 fetch 调用
 * 密钥由用户填写，保存在浏览器 localStorage，仅随请求发送到 DeepSeek，不经过任何自有服务器
 */

/**
 * 调用 DeepSeek Chat Completions 接口
 * @param {object} options
 * @param {string} options.apiKey       用户填写的 API Key
 * @param {string} options.apiBase      接口地址（默认 https://api.deepseek.com/v1）
 * @param {string} options.prompt       完整 Prompt
 * @param {number} options.temperature  温度参数 0~1
 * @param {boolean} options.jsonMode    是否开启 JSON 输出模式
 * @returns {Promise<string>} 模型返回的文本内容
 */
export async function chatCompletion({ apiKey, apiBase, prompt, temperature = 0.4, jsonMode = false }) {
  // 规范化地址：去除尾部斜杠，兼容用户输入的 https://api.deepseek.com/v1/
  const base = (apiBase || 'https://api.deepseek.com/v1').replace(/\/+$/, '')

  const body = {
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: prompt }],
    temperature,
    stream: false,
  }

  // JSON 模式：DeepSeek 支持 response_format=json_object
  // 注意：开启后 prompt 中必须包含 "json" 字样（我们的模板已包含），否则接口会报错
  if (jsonMode) {
    body.response_format = { type: 'json_object' }
  }

  let res
  try {
    res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    // fetch 本身失败，通常是网络问题或地址不可达
    throw new Error('网络请求失败，请检查网络连接，或确认 API 地址是否正确')
  }

  // 根据 HTTP 状态码给出对应中文提示
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('API Key 无效或未授权（401），请检查密钥是否正确')
    } else if (res.status === 429) {
      throw new Error('请求过于频繁或账户余额不足（429），请稍后再试')
    } else if (res.status === 400) {
      throw new Error('请求参数错误（400），请检查 API 地址与参数配置')
    } else if (res.status === 402) {
      throw new Error('账户余额不足（402），请前往 DeepSeek 平台充值')
    } else {
      throw new Error(`请求失败（HTTP ${res.status}），请稍后重试`)
    }
  }

  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('接口返回内容为空，请重试')
  }
  return content
}
