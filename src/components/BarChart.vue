<script setup>
import { ref, computed, onMounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

// 手写 SVG 柱状图：零依赖，数据驱动（需求 技术选型 · 第 6 节「手写 SVG 优先」）
const props = defineProps({
  bars: { type: Array, default: () => [] }, // [{ label, value }]
  unit: { type: String, default: '' },
})

const el = ref(null)
const grown = ref(false)
onMounted(() => {
  useIntersectionObserver(el, ([{ isIntersecting }]) => {
    if (isIntersecting) grown.value = true
  })
})

const W = 640
const H = 260
const PAD_B = 46
const PAD_T = 26
const max = computed(() => Math.max(...props.bars.map((b) => b.value), 1))
const innerW = W - 24
const slot = computed(() => innerW / props.bars.length)
const bw = computed(() => Math.min(slot.value * 0.56, 60))

function bar(b, i) {
  const h = grown.value ? ((b.value / max.value) * (H - PAD_B - PAD_T)) : 0
  const x = 12 + i * slot.value + (slot.value - bw.value) / 2
  const y = H - PAD_B - h
  return { x, y, h, cx: x + bw.value / 2 }
}
</script>

<template>
  <div ref="el" class="w-full">
    <svg :viewBox="`0 0 ${W} ${H}`" class="block w-full h-auto" role="img">
      <line x1="12" :y1="H - PAD_B" :x2="W - 12" :y2="H - PAD_B" stroke="var(--color-line)" stroke-width="2" />
      <g v-for="(b, i) in bars" :key="b.label">
        <rect
          :x="bar(b, i).x"
          :y="bar(b, i).y"
          :width="bw"
          :height="bar(b, i).h"
          rx="4"
          fill="var(--accent)"
          opacity="0.9"
          style="transition: height 0.6s var(--ease-smooth), y 0.6s var(--ease-smooth)"
        />
        <text :x="bar(b, i).cx" :y="bar(b, i).y - 6" text-anchor="middle" class="val">{{ b.value }}{{ unit }}</text>
        <text :x="bar(b, i).cx" :y="H - PAD_B + 18" text-anchor="middle" class="lab">{{ b.label }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.val { fill: var(--color-ink); font-size: 13px; font-weight: 800; font-family: var(--font-mono); }
.lab { fill: var(--color-muted); font-size: 10.5px; font-family: var(--font-sans); }
</style>
