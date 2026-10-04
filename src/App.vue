<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'

const route = useRoute()
// 当前入口决定强调色：整棵子树按 data-entry 换 --accent（同源不同貌）
const curEntry = computed(() => route.meta.entry || 'nanshan')
</script>

<template>
  <div :data-entry="curEntry" class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
/* 仅用 Vue 内置 <Transition>，不引重型动画库（技术选型 · 第 7 节） */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s var(--ease-smooth);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
