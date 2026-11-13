<script setup>
import { ref } from 'vue'
import Card from './ui/Card.vue'
import Button from './ui/Button.vue'
import Textarea from './ui/Textarea.vue'
import Badge from './ui/Badge.vue'
import { parseResumeFile, sanitizeResumeText, SUPPORTED_EXTENSIONS } from '../services/fileParser'
import { estimateTokens } from '../lib/utils'

/**
 * 模块一：简历上传 & 解析区
 * - 支持 PDF / docx 拖拽上传与点击上传
 * - 前端本地提取简历文本并预览
 * - 支持手动编辑 / 手动粘贴兜底
 * - 「清洗简历文本」按钮（可选，需已配置 API Key）
 */
const props = defineProps({
  modelValue: { type: String, default: '' },
  cleaning: { type: Boolean, default: false },
  apiConfigured: { type: Boolean, default: false },
  cleanError: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'clean'])

const fileName = ref('')
const parsing = ref(false)
const parseError = ref('')
const dragOver = ref(false)
// 是否自动脱敏（默认开启）
const sanitize = ref(true)
// 手动脱敏后的短暂提示
const sanitizedTip = ref(false)

// 估算 token 数，用于提示
const tokenEstimate = () => estimateTokens(props.modelValue)

/** 处理单个文件 */
async function handleFile(file) {
  parseError.value = ''
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    parseError.value = '不支持的文件格式，请上传 PDF 或 .docx 文件'
    return
  }
  parsing.value = true
  try {
    let text = await parseResumeFile(file)
    // 自动脱敏：去除姓名、手机号、邮箱等敏感信息
    if (sanitize.value) {
      text = sanitizeResumeText(text)
    }
    if (!text.trim()) {
      parseError.value = '未能从文件中提取到文本，请确认文件内容，或直接在下方手动粘贴简历文本'
      return
    }
    fileName.value = file.name
    emit('update:modelValue', text)
  } catch (e) {
    parseError.value = e?.message || '文件解析失败，请手动粘贴简历文本兜底'
  } finally {
    parsing.value = false
  }
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (file) handleFile(file)
  e.target.value = '' // 清空，允许重复选择同一文件
}

function onDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}

function clearResume() {
  fileName.value = ''
  emit('update:modelValue', '')
}

/** 手动脱敏：对当前简历文本（含手动粘贴的）再次执行脱敏 */
function handleSanitize() {
  if (!props.modelValue) return
  emit('update:modelValue', sanitizeResumeText(props.modelValue))
  sanitizedTip.value = true
  setTimeout(() => (sanitizedTip.value = false), 2000)
}
</script>

<template>
  <Card title="1. 简历上传 & 解析" description="简历文件在浏览器本地解析，原始文件不会上传服务器">
    <!-- 上传区 -->
    <div
      class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors"
      :class="dragOver ? 'border-primary-400 bg-primary-50' : 'border-slate-300 bg-slate-50'"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
      @click="$refs.fileInput.click()"
    >
      <svg class="mb-3 h-10 w-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      <p class="text-sm text-slate-600">
        <span class="font-medium text-primary-600">点击上传</span> 或拖拽文件到此处
      </p>
      <p class="mt-1 text-xs text-slate-400">支持 PDF / .docx 格式</p>
      <p v-if="parsing" class="mt-2 text-xs text-primary-600">正在解析文件…</p>
      <input ref="fileInput" type="file" accept=".pdf,.docx" class="hidden" @change="onFileChange" />
    </div>

    <!-- 脱敏开关 -->
    <label class="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
      <input v-model="sanitize" type="checkbox" class="h-4 w-4 cursor-pointer accent-primary-600" />
      <span>自动脱敏：隐藏姓名、手机号、邮箱等敏感信息</span>
    </label>

    <!-- 解析错误提示 -->
    <div v-if="parseError" class="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
      {{ parseError }}
    </div>

    <!-- 已解析文件 + 文本预览 -->
    <div v-if="modelValue" class="mt-4 space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm text-slate-600">
          <svg class="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span class="truncate max-w-[240px]">{{ fileName || '已粘贴简历文本' }}</span>
          <Badge variant="success">已解析</Badge>
        </div>
        <Button variant="ghost" size="sm" @click="clearResume">清空</Button>
      </div>

      <div>
        <div class="mb-1.5 flex items-center justify-between">
          <span class="text-sm font-medium text-slate-700">提取到的简历文本（可手动编辑修改）</span>
          <span class="text-xs text-slate-400">约 {{ tokenEstimate() }} tokens</span>
        </div>
        <Textarea
          :model-value="modelValue"
          :rows="10"
          placeholder="简历解析结果会显示在这里，也可以直接粘贴简历文本…"
          @update:modelValue="emit('update:modelValue', $event)"
        />
      </div>

      <div class="flex items-center justify-between gap-2">
        <p class="text-xs text-slate-400">可手动「脱敏」隐藏敏感信息，或「清洗」去除乱码（清洗需 Key）</p>
        <div class="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" @click="handleSanitize">
            {{ sanitizedTip ? '✓ 已脱敏' : '脱敏' }}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            :disabled="cleaning || !apiConfigured"
            :title="apiConfigured ? '' : '请先在 API Key 设置面板填写密钥'"
            @click="emit('clean')"
          >
            <span v-if="cleaning" class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-300 border-t-primary-600" />
            {{ cleaning ? '清洗中…' : '清洗简历文本' }}
          </Button>
        </div>
      </div>

      <!-- 清洗失败内联提示 -->
      <div v-if="cleanError" class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
        {{ cleanError }}
      </div>
    </div>
  </Card>
</template>
