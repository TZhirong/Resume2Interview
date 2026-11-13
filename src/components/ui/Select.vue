<script setup>
import { cn } from '../../lib/utils'

/**
 * 下拉选择组件（原生 select 样式化）
 * 用法：<Select v-model="x"><option value="a">A</option></Select>
 */
defineProps({
  modelValue: { type: [String, Number], default: '' },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <select
    :value="modelValue"
    @change="$emit('update:modelValue', $event.target.value)"
    class="flex h-9 w-full cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-800 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
  >
    <slot />
  </select>
</template>
