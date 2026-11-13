<script setup>
import { cn } from '../../lib/utils'

/**
 * 按钮组件（shadcn 风格，纯 Tailwind 实现，无第三方依赖）
 * variant: default | secondary | outline | ghost | danger
 * size: default | sm | lg | icon
 */
const props = defineProps({
  variant: { type: String, default: 'default' },
  size: { type: String, default: 'default' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
})

const base =
  'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:pointer-events-none disabled:opacity-50 select-none'

const variants = {
  default: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
  secondary: 'bg-primary-50 text-primary-700 hover:bg-primary-100',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizes = {
  default: 'h-9 px-4 text-sm',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-11 px-6 text-base',
  icon: 'h-9 w-9',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="cn(base, variants[props.variant], sizes[props.size])"
  >
    <slot />
  </button>
</template>
