<script setup>
import Button from './ui/Button.vue'
import Badge from './ui/Badge.vue'
import { formatTime } from '../lib/utils'

/**
 * 模块五：历史记录侧边面板
 * 展示 localStorage 中保存的历史生成记录，可查看 / 删除 / 清空
 */
defineProps({
  history: { type: Array, default: () => [] },
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'select', 'remove', 'clear'])

/** 简历摘要：截取前 80 字 */
function summary(text) {
  return text && text.length > 80 ? text.slice(0, 80) + '…' : text
}
</script>

<template>
  <!-- 遮罩 -->
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-30 bg-black/20 lg:hidden" @click="emit('close')" />
  </transition>

  <!-- 侧边面板 -->
  <aside
    class="fixed right-0 top-0 z-40 flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-xl transition-transform duration-300"
    :class="open ? 'translate-x-0' : 'translate-x-full'"
  >
    <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
      <h3 class="text-base font-semibold text-slate-900">历史记录</h3>
      <div class="flex items-center gap-2">
        <Button v-if="history.length" variant="ghost" size="sm" @click="emit('clear')">清空</Button>
        <Button variant="ghost" size="icon" @click="emit('close')">✕</Button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-4">
      <div v-if="!history.length" class="py-16 text-center text-sm text-slate-400">
        暂无历史记录
        <p class="mt-1 text-xs">生成面试题后可保存到本地查看</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="item in history"
          :key="item.id"
          class="rounded-lg border border-slate-200 p-3 transition-colors hover:border-primary-200 hover:bg-primary-50/40"
        >
          <div class="mb-1 flex items-center justify-between">
            <span class="text-sm font-medium text-slate-800">{{ item.targetJob }}</span>
            <Badge variant="outline">{{ item.difficulty }}</Badge>
          </div>
          <p class="mb-2 text-xs text-slate-400">{{ formatTime(item.createdAt) }}</p>
          <p class="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-500">{{ summary(item.resumeSummary) }}</p>
          <div class="flex gap-2">
            <Button size="sm" variant="secondary" @click="emit('select', item)">查看</Button>
            <Button size="sm" variant="ghost" @click="emit('remove', item.id)">删除</Button>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
