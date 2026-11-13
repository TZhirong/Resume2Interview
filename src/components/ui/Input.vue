<script setup>
import { cn } from '../../lib/utils'

/**
 * 输入框组件
 * 通过 v-model 双向绑定，其余属性（placeholder / disabled / type 等）自动透传
 */
defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    class="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-800 shadow-sm transition-colors placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
  />
</template>
