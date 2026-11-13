<script setup>
import { ref } from 'vue'
import Button from './ui/Button.vue'
import { copyText } from '../lib/utils'

/**
 * 单道面试题卡片
 * 包含：题目、考察点、参考答案，以及单题复制按钮
 */
const props = defineProps({
  question: { type: Object, required: true },
  index: { type: Number, default: 1 },
})

const copied = ref(false)

async function handleCopy() {
  const { question, inspect_point, reference_answer, source } = props.question
  const text = `题目：${question}\n考察点：${inspect_point}\n来源：${source || '—'}\n参考答案：${reference_answer}`
  await copyText(text)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div class="mb-2 flex items-start justify-between gap-2">
      <h4 class="text-sm font-semibold leading-relaxed text-slate-900">
        <span class="mr-1 text-primary-600">Q{{ index }}.</span>{{ question.question }}
      </h4>
      <Button variant="ghost" size="sm" class="shrink-0" @click="handleCopy">
        {{ copied ? '✓ 已复制' : '复制' }}
      </Button>
    </div>

    <div class="space-y-2 text-sm">
      <div
        v-if="question.source"
        class="flex w-fit items-center gap-1 rounded-md bg-primary-50 px-2 py-0.5 text-xs text-primary-700"
      >
        <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
        来源：{{ question.source }}
      </div>
      <div>
        <span class="font-medium text-slate-500">考察点：</span>
        <span class="text-slate-600">{{ question.inspect_point }}</span>
      </div>
      <div class="rounded-md bg-slate-50 px-3 py-2">
        <span class="font-medium text-slate-500">参考答案：</span>
        <span class="leading-relaxed text-slate-700">{{ question.reference_answer }}</span>
      </div>
    </div>
  </div>
</template>
