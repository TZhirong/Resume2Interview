<script setup>
import { computed } from 'vue'
import Card from './ui/Card.vue'
import Input from './ui/Input.vue'
import Select from './ui/Select.vue'
import Label from './ui/Label.vue'
import Collapsible from './ui/Collapsible.vue'
import { clamp } from '../lib/utils'

/**
 * 模块二：面试参数配置表单
 * 直接接收父组件传入的 reactive config 对象并修改其字段
 * （Vue 中修改传入的响应式对象的属性是允许且常见做法）
 */
const props = defineProps({
  config: { type: Object, required: true },
})

const yearsOptions = ['0-2年', '3-5年', '5年以上']
const difficultyOptions = ['初级', '中级', '高级']

// 题量输入：限制 10~50，并强制转为数字
const totalQuestions = computed({
  get: () => props.config.totalQuestions,
  set: (v) => {
    props.config.totalQuestions = clamp(Number(v) || 10, 10, 50)
  },
})
</script>

<template>
  <Card title="2. 面试参数配置" description="设置目标岗位与面试难度，参数将用于组装 Prompt">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="sm:col-span-2">
        <Label>目标岗位</Label>
        <Input v-model="config.targetJob" placeholder="例如：AI产品经理" />
      </div>

      <div>
        <Label>期望工作年限</Label>
        <Select v-model="config.years">
          <option v-for="y in yearsOptions" :key="y" :value="y">{{ y }}</option>
        </Select>
      </div>

      <div>
        <Label>面试难度</Label>
        <Select v-model="config.difficulty">
          <option v-for="d in difficultyOptions" :key="d" :value="d">{{ d }}</option>
        </Select>
      </div>

      <div>
        <Label>面试总题量（10～50 题）</Label>
        <Input v-model="totalQuestions" type="number" min="10" max="50" />
      </div>

      <!-- 模型参数设置（折叠面板，体现 AI 产品调参能力） -->
      <Collapsible class="sm:col-span-2" title="模型参数设置" description="高级">
        <div>
          <div class="mb-2 flex items-center justify-between">
            <Label class="mb-0">temperature（随机性）</Label>
            <span class="rounded bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
              {{ Number(config.temperature).toFixed(1) }}
            </span>
          </div>
          <input
            v-model.number="config.temperature"
            type="range"
            min="0"
            max="1"
            step="0.1"
            class="w-full accent-primary-600"
          />
          <div class="mt-1 flex justify-between text-xs text-slate-400">
            <span>0 · 更稳定</span>
            <span>1 · 更多样</span>
          </div>
          <p class="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500">
            温度越低，输出越稳定、越贴近模板；温度越高，答案越多样但可能偏离格式。
            面试题生成推荐 0.3～0.5，兼顾稳定与质量。
          </p>
        </div>
      </Collapsible>
    </div>
  </Card>
</template>
