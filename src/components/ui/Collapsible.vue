<script setup>
import { ref } from 'vue'
import { cn } from '../../lib/utils'

/**
 * 折叠面板组件
 * 用于「模型参数设置」「API Key 设置」等可折叠区块
 */
const props = defineProps({
  title: { type: String, required: true },
  defaultOpen: { type: Boolean, default: false },
  description: { type: String, default: '' },
})

const open = ref(props.defaultOpen)
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
    <button
      type="button"
      class="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50"
      @click="open = !open"
    >
      <div>
        <span class="text-sm font-medium text-slate-800">{{ title }}</span>
        <span v-if="description" class="ml-2 text-xs text-slate-400">{{ description }}</span>
      </div>
      <svg
        class="h-4 w-4 shrink-0 text-slate-400 transition-transform"
        :class="{ 'rotate-180': open }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div v-show="open" class="border-t border-slate-100 px-4 py-4">
      <slot />
    </div>
  </div>
</template>
