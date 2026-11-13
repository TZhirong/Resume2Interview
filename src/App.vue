<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import ResumeUploader from './components/ResumeUploader.vue'
import ConfigForm from './components/ConfigForm.vue'
import ApiKeyPanel from './components/ApiKeyPanel.vue'
import QuestionResult from './components/QuestionResult.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import Button from './components/ui/Button.vue'
import { generateQuestions } from './services/generator'
import { chatCompletion } from './services/deepseek'
import { buildCleanPrompt } from './constants/prompts'
import {
  loadApiConfig,
  loadHistory,
  addHistory,
  removeHistory,
  clearHistory,
} from './services/storage'
import { estimateTokens } from './lib/utils'

/* ---------------- 状态 ---------------- */

// 简历文本
const resumeText = ref('')

// 面试配置（默认值即示例）
const config = reactive({
  targetJob: 'AI产品经理',
  years: '3-5年',
  difficulty: '中级',
  totalQuestions: 15,
  temperature: 0.4,
})

// API 配置（从 localStorage 读取）
const apiConfig = reactive(loadApiConfig())

// 生成状态
const loading = ref(false)
const loadingStage = ref('')
const errorMsg = ref('')
const result = ref(null)

// 简历清洗状态
const cleaning = ref(false)
// 简历清洗错误（内联显示在上传区）
const cleanError = ref('')

// 历史记录
const history = ref(loadHistory())
const historyOpen = ref(false)

/* ---------------- 轻量提示 toast ---------------- */
const toast = ref(null)
let toastTimer = null
function showToast(msg, type = 'info') {
  toast.value = { msg, type }
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), 3000)
}

/* ---------------- 派生状态 ---------------- */

const tokenCount = computed(() => estimateTokens(resumeText.value))
const isLargeResume = computed(() => tokenCount.value > 3000)

// 缺失项提示
const missingItems = computed(() => {
  const list = []
  if (!resumeText.value.trim()) list.push('上传/粘贴简历')
  if (!apiConfig.apiKey) list.push('填写 API Key')
  if (!config.targetJob.trim()) list.push('设置目标岗位')
  return list
})
const canGenerate = computed(() => missingItems.value.length === 0 && !loading.value)

/* ---------------- 生成面试题 ---------------- */

async function handleGenerate() {
  if (!resumeText.value.trim()) {
    errorMsg.value = '请先上传或粘贴简历文本'
    return
  }
  if (!apiConfig.apiKey) {
    errorMsg.value = '请先在「API Key 设置」面板填写 DeepSeek API Key'
    return
  }
  if (!config.targetJob.trim()) {
    errorMsg.value = '请填写目标岗位'
    return
  }

  loading.value = true
  errorMsg.value = ''
  result.value = null

  try {
    const data = await generateQuestions({
      apiKey: apiConfig.apiKey,
      apiBase: apiConfig.apiBase,
      resumeText: resumeText.value,
      config,
      onStage: (s) => (loadingStage.value = s),
    })
    result.value = data
  } catch (e) {
    errorMsg.value = e?.message || '生成失败，请稍后重试'
  } finally {
    loading.value = false
    // 生成结束（成功或失败）后，自动滚动到结果区
    await nextTick()
    document.getElementById('result-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/* ---------------- 清洗简历 ---------------- */

async function handleClean() {
  if (!apiConfig.apiKey) {
    cleanError.value = '请先填写 API Key'
    return
  }
  if (!resumeText.value.trim()) return
  cleaning.value = true
  cleanError.value = ''
  try {
    const cleaned = await chatCompletion({
      apiKey: apiConfig.apiKey,
      apiBase: apiConfig.apiBase,
      prompt: buildCleanPrompt(resumeText.value),
      temperature: 0.2,
    })
    resumeText.value = cleaned
    showToast('简历文本已清洗', 'success')
  } catch (e) {
    cleanError.value = e?.message || '清洗失败'
  } finally {
    cleaning.value = false
  }
}

/* ---------------- 历史记录 ---------------- */

function handleSaveResult() {
  if (!result.value) return
  const record = {
    id: String(Date.now()),
    createdAt: Date.now(),
    targetJob: config.targetJob,
    years: config.years,
    difficulty: config.difficulty,
    totalQuestions: config.totalQuestions,
    resumeSummary: resumeText.value.slice(0, 300),
    // 深拷贝结果，避免后续引用被修改
    result: JSON.parse(JSON.stringify(result.value)),
  }
  history.value = addHistory(record)
  showToast('已保存到历史记录', 'success')
}

function handleViewHistory(record) {
  result.value = record.result
  config.targetJob = record.targetJob
  config.years = record.years
  config.difficulty = record.difficulty
  config.totalQuestions = record.totalQuestions
  historyOpen.value = false
  showToast('已载入历史记录', 'success')
  // 滚动到结果区
  document.getElementById('result-area')?.scrollIntoView({ behavior: 'smooth' })
}

function handleRemoveHistory(id) {
  history.value = removeHistory(id)
}

function handleClearHistory() {
  if (window.confirm('确定清空全部历史记录吗？此操作不可恢复。')) {
    history.value = clearHistory()
  }
}

/* ---------------- 生命周期 ---------------- */

onMounted(() => {
  // 历史记录已在初始化时读取，无需额外处理
})
</script>

<template>
  <div class="min-h-screen">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-lg font-bold text-white">
            面
          </div>
          <div>
            <h1 class="text-base font-bold leading-tight text-slate-900">面题工坊 Resume2Interview</h1>
            <p class="text-xs text-slate-400">上传简历 · 自动生成贴合简历的面试题</p>
          </div>
        </div>
        <Button variant="outline" size="sm" @click="historyOpen = true">
          历史记录
          <span v-if="history.length" class="ml-1 rounded-full bg-primary-50 px-1.5 text-xs text-primary-700">
            {{ history.length }}
          </span>
        </Button>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 pb-20 pt-6">
      <!-- 项目说明提示框 -->
      <div class="mb-6 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm leading-relaxed text-primary-900">
        <p class="font-semibold">面题工坊 Resume2Interview｜开源演示项目</p>
        <p class="mt-0.5">✅ 简历本地解析并自动脱敏，原始文件不上传服务器</p>
        <p>⚠️ 仅为作品集 Demo，非商用工具；需要用户自行提供 DeepSeek API Key</p>
      </div>

      <div class="space-y-5">
        <!-- 模块一：简历上传解析 -->
        <ResumeUploader
          v-model="resumeText"
          :cleaning="cleaning"
          :clean-error="cleanError"
          :api-configured="!!apiConfig.apiKey"
          @clean="handleClean"
        />

        <!-- 模块二：参数配置 -->
        <ConfigForm :config="config" />

        <!-- 模块三：API Key -->
        <ApiKeyPanel :api-config="apiConfig" />

        <!-- 生成按钮区 -->
        <div>
          <!-- 简历较大提示 -->
          <div
            v-if="isLargeResume && resumeText.trim()"
            class="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700"
          >
            简历文本较大（约 {{ tokenCount }} tokens），生成时会消耗更多 API 额度，建议先「清洗简历文本」精简内容。
          </div>

          <Button class="w-full" size="lg" :disabled="!canGenerate" @click="handleGenerate">
            <template v-if="loading">
              <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              生成中…
            </template>
            <template v-else>✨ 生成面试题</template>
          </Button>
          <p v-if="missingItems.length" class="mt-2 text-center text-xs text-slate-400">
            请先完成：{{ missingItems.join('、') }}
          </p>
        </div>

        <!-- 模块四：结果展示 -->
        <div id="result-area">
          <QuestionResult
            :result="result"
            :config="config"
            :loading="loading"
            :loading-stage="loadingStage"
            :error-msg="errorMsg"
            @save="handleSaveResult"
            @regenerate="handleGenerate"
          />
        </div>
      </div>
    </main>

    <!-- 模块五：历史记录侧边面板 -->
    <HistoryPanel
      :history="history"
      :open="historyOpen"
      @close="historyOpen = false"
      @select="handleViewHistory"
      @remove="handleRemoveHistory"
      @clear="handleClearHistory"
    />

    <!-- 轻量 toast -->
    <transition name="toast">
      <div
        v-if="toast"
        class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg"
        :class="toast.type === 'error' ? 'bg-red-600' : toast.type === 'success' ? 'bg-emerald-600' : 'bg-slate-800'"
      >
        {{ toast.msg }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}
</style>
