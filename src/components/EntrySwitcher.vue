<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const entries = [
  { to: '/', name: '首页', key: 'home' },
  { to: '/01-summit', name: '峰会资讯', key: 'summit' },
  { to: '/02-nanshan', name: '城市名片', key: 'nanshan' },
  { to: '/03-pedia', name: '知识科普', key: 'pedia' },
  { to: '/04-youth', name: '活动落地', key: 'youth' },
]
// 全局导航栏的入口切换器（需求 R-03）：当前入口高亮
const isActive = (k) => (k === 'home' ? route.name === 'home' : route.meta.entry === k)
</script>

<template>
  <nav class="flex flex-wrap gap-1" aria-label="入口切换">
    <router-link
      v-for="e in entries"
      :key="e.key"
      :to="e.to"
      custom
      v-slot="{ navigate }"
    >
      <button
        type="button"
        @click="navigate"
        :class="[
          'px-3 py-1.5 rounded-pill text-[13px] font-semibold transition-colors duration-150',
          isActive(e.key)
            ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
            : 'text-muted hover:bg-[var(--accent-tint)] hover:text-[var(--accent-ink)]',
        ]"
      >
        {{ e.name }}
      </button>
    </router-link>
  </nav>
</template>
