<script setup>
import { ref, onMounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

// 滚动进入视口再淡入上浮：CSS transition + IntersectionObserver，无重型动画库（技术选型 · 第 7 节）
const props = defineProps({
  as: { type: String, default: 'div' },
  delay: { type: Number, default: 0 }, // ms
})
const el = ref(null)
const shown = ref(false)
onMounted(() => {
  useIntersectionObserver(el, ([{ isIntersecting }]) => isIntersecting && (shown.value = true), { threshold: 0.12 })
})
</script>

<template>
  <component
    :is="as"
    ref="el"
    :style="{ transitionDelay: delay + 'ms' }"
    :class="['reveal', shown ? 'reveal-in' : '']"
  >
    <slot />
  </component>
</template>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(14px);
  transition:
    opacity 0.5s var(--ease-smooth),
    transform 0.5s var(--ease-smooth);
  will-change: opacity, transform;
}
.reveal-in {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
</style>
