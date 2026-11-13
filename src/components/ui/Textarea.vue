<script setup>
import { cn } from '../../lib/utils'

/**
 * 多行文本框组件
 */
defineProps({
  modelValue: { type: [String, Number], default: '' },
  rows: { type: [String, Number], default: 4 },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <textarea
    :value="modelValue"
    :rows="rows"
    @input="$emit('update:modelValue', $event.target.value)"
    class="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition-colors placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
  />
</template>
