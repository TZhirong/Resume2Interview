<script setup>
import { cn } from '../../lib/utils'

/**
 * 卡片组件（shadcn 风格）
 * 通过具名插槽提供 header / title / description / footer
 * 默认插槽为卡片主体内容
 */
defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div v-if="title || $slots.header" class="border-b border-slate-100 px-5 py-4">
      <slot name="header">
        <h3 v-if="title" class="text-base font-semibold text-slate-900">{{ title }}</h3>
        <p v-if="description" class="mt-1 text-xs text-slate-500">{{ description }}</p>
      </slot>
    </div>
    <div class="px-5 py-4">
      <slot />
    </div>
    <div v-if="$slots.footer" class="border-t border-slate-100 px-5 py-3">
      <slot name="footer" />
    </div>
  </div>
</template>
