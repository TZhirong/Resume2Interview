<script setup>
import { ref } from 'vue'
import Collapsible from './ui/Collapsible.vue'
import Input from './ui/Input.vue'
import Label from './ui/Label.vue'
import Button from './ui/Button.vue'
import { saveApiConfig } from '../services/storage'

/**
 * 模块三：API Key 设置面板（折叠）
 * 密钥保存在浏览器 localStorage，仅随请求发送到 DeepSeek，不上传任何自有服务器
 */
const props = defineProps({
  apiConfig: { type: Object, required: true },
})

const showKey = ref(false)
const savedTip = ref(false)

function handleSave() {
  saveApiConfig(props.apiConfig)
  savedTip.value = true
  setTimeout(() => (savedTip.value = false), 2000)
}

function handleDelete() {
  if (window.confirm('确定删除已保存的 API Key 吗？')) {
    props.apiConfig.apiKey = ''
    saveApiConfig(props.apiConfig)
  }
}
</script>

<template>
  <Collapsible title="API Key 设置" description="本地保存" :default-open="!apiConfig.apiKey">
    <div class="space-y-3">
      <div>
        <Label>DeepSeek API Key</Label>
        <div class="flex gap-2">
          <Input
            v-model="apiConfig.apiKey"
            :type="showKey ? 'text' : 'password'"
            placeholder="sk-..."
            autocomplete="off"
          />
          <Button variant="outline" size="sm" @click="showKey = !showKey">
            {{ showKey ? '隐藏' : '显示' }}
          </Button>
        </div>
      </div>

      <div>
        <Label>API 地址（OpenAI 兼容接口，可自定义）</Label>
        <Input v-model="apiConfig.apiBase" placeholder="https://api.deepseek.com/v1" />
      </div>

      <div class="flex items-center justify-between gap-2">
        <p class="text-xs text-slate-400">密钥仅保存在当前浏览器 localStorage</p>
        <div class="flex shrink-0 gap-2">
          <Button v-if="apiConfig.apiKey" variant="danger" size="sm" @click="handleDelete">删除密钥</Button>
          <Button size="sm" @click="handleSave">
            <span v-if="savedTip">✓ 已保存</span>
            <span v-else>保存配置</span>
          </Button>
        </div>
      </div>

      <div class="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-700">
        ⚠️ 本工具仅本地运行，密钥保存在浏览器，不会上传到服务端；请使用自己的 API 密钥。
        申请地址：platform.deepseek.com
      </div>
    </div>
  </Collapsible>
</template>
