<script setup>
import { cn } from '../../lib/utils'

/**
 * 标签/徽章组件
 * variant: default | outline | success | warning
 */
defineProps({
  variant: { type: String, default: 'default' },
})

const variants = {
  default: 'bg-primary-50 text-primary-700 border-primary-200',
  outline: 'bg-white text-slate-600 border-slate-300',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
    :class="variants[variant]"
  >
    <slot />
  </span>
</template>
