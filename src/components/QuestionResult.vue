<script setup>
import { computed, ref } from 'vue'
import { marked } from 'marked'
import Card from './ui/Card.vue'
import Button from './ui/Button.vue'
import Badge from './ui/Badge.vue'
import QuestionCard from './QuestionCard.vue'
import { QUESTION_CATEGORIES } from '../constants/prompts'
import { resultToMarkdown } from '../services/generator'
import { copyText, downloadFile, formatTime } from '../lib/utils'

/**
 * 模块四：面试题结果展示区
 * - JSON 模式：按 5 个分类渲染题目卡片
 * - Markdown 模式：JSON 解析失败时降级，直接渲染 Markdown
 * - 提供复制全部 / 导出 Markdown / 本地保存
 */
const props = defineProps({
  result: { type: Object, default: null },
  config: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  loadingStage: { type: String, default: '' },
  errorMsg: { type: String, default: '' },
})
const emit = defineEmits(['save', 'regenerate'])

const copiedAll = ref(false)
const savedTip = ref(false)

// 将结果统一转成 Markdown 文本（复制 / 导出共用）
const markdownText = computed(() => {
  if (!props.result) return ''
  return resultToMarkdown(props.result, props.config)
})

// 降级模式：把模型返回的 Markdown 渲染成 HTML
const markdownHtml = computed(() => {
  if (props.result?.mode !== 'markdown') return ''
  return marked.parse(props.result.markdown || '')
})

// JSON 模式下按固定分类分组
const groupedQuestions = computed(() => {
  const list = props.result?.data?.question_list || []
  return QUESTION_CATEGORIES.map((cat) => ({
    category: cat,
    questions: list.filter((q) => q.category === cat),
  }))
})

const jobInfo = computed(() => props.result?.data?.job_info || null)
const totalCount = computed(() => (props.result?.data?.question_list || []).length)

async function handleCopyAll() {
  if (!markdownText.value) return
  await copyText(markdownText.value)
  copiedAll.value = true
  setTimeout(() => (copiedAll.value = false), 1500)
}

function handleExport() {
  if (!markdownText.value) return
  const filename = `面试题_${props.config.targetJob}_${formatTime(Date.now()).replace(/[: ]/g, '-')}.md`
  downloadFile(filename, markdownText.value)
}

function handleSave() {
  emit('save')
  savedTip.value = true
  setTimeout(() => (savedTip.value = false), 1500)
}
</script>

<template>
  <Card title="4. 面试题结果" description="基于简历生成的结构化面试题">
    <!-- 加载中 -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-14 text-center">
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
      <p class="mt-4 text-sm font-medium text-slate-700">{{ loadingStage || '正在生成…' }}</p>
      <p class="mt-1.5 text-xs text-slate-400">模型生成需要几秒到十几秒，请勿关闭页面</p>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="errorMsg" class="rounded-md border border-red-200 bg-red-50 px-4 py-3">
      <div class="flex items-start justify-between gap-3">
        <div class="text-sm text-red-600">
          <p class="font-medium">生成失败</p>
          <p class="mt-1">{{ errorMsg }}</p>
        </div>
        <Button variant="outline" size="sm" class="shrink-0" @click="emit('regenerate')">重试</Button>
      </div>
    </div>

    <!-- 无结果 -->
    <div v-else-if="!result" class="flex flex-col items-center justify-center py-12 text-center">
      <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
        <svg class="h-7 w-7 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </div>
      <p class="text-sm font-medium text-slate-600">还没有生成结果</p>
      <p class="mt-1 text-xs text-slate-400">填写简历与配置后，点击上方「✨ 生成面试题」开始</p>
    </div>

    <!-- 有结果 -->
    <template v-else>
      <!-- 工具栏 -->
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="success">{{ result.mode === 'json' ? '结构化解析成功' : 'Markdown 降级模式' }}</Badge>
        <Badge v-if="jobInfo" variant="outline">
          {{ jobInfo.target_job }} · {{ jobInfo.years }} · {{ jobInfo.difficulty }}
        </Badge>
        <Badge v-if="result.mode === 'json'" variant="outline">共 {{ totalCount }} 题</Badge>
        <div class="ml-auto flex gap-2">
          <Button variant="outline" size="sm" @click="handleCopyAll">
            {{ copiedAll ? '✓ 已复制' : '复制全部' }}
          </Button>
          <Button variant="outline" size="sm" @click="handleExport">导出 Markdown</Button>
          <Button size="sm" @click="handleSave">
            {{ savedTip ? '✓ 已保存' : '保存到历史' }}
          </Button>
        </div>
      </div>

      <!-- JSON 模式：按分类渲染 -->
      <div v-if="result.mode === 'json'" class="space-y-6">
        <div v-for="group in groupedQuestions" :key="group.category">
          <template v-if="group.questions.length">
            <div class="mb-2 flex items-center gap-2">
              <h3 class="text-sm font-semibold text-slate-800">{{ group.category }}</h3>
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {{ group.questions.length }} 题
              </span>
            </div>
            <div class="space-y-3">
              <QuestionCard
                v-for="(q, i) in group.questions"
                :key="i"
                :question="q"
                :index="i + 1"
              />
            </div>
          </template>
        </div>
      </div>

      <!-- Markdown 模式：降级渲染 -->
      <div v-else class="markdown-body" v-html="markdownHtml" />
    </template>
  </Card>
</template>
