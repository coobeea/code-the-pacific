<script setup>
import { ref, computed } from 'vue'
import economies from '../data/economies.json'

// E-03 彩蛋：APEC 2026 会标寓意「21 根交织羽翼」——点/悬停一根羽翼，展开对应经济体
const CX = 220
const CY = 300
const L = 232
const SPREAD = 75

const feathers = computed(() =>
  economies.map((e, i) => {
    const angle = -SPREAD + (i * (2 * SPREAD)) / (economies.length - 1)
    const tipY = CY - L
    return { e, i, angle, tipX: CX, tipY }
  }),
)

const active = ref(economies.find((e) => e.id === 'cn'))
const pick = (e) => (active.value = e)

// 单根羽翼的叶形 path（从圆心向上生长，再整体 rotate）
function d() {
  return `M ${CX} ${CY} C ${CX - 15} ${CY - L * 0.35}, ${CX - 6} ${CY - L * 0.86}, ${CX} ${CY - L} C ${CX + 6} ${CY - L * 0.86}, ${CX + 15} ${CY - L * 0.35}, ${CX} ${CY} Z`
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-5 items-center">
    <div class="bg-tech rounded-card p-3">
      <svg viewBox="0 0 440 320" class="block w-full h-auto" role="img" aria-label="21 根羽翼构成的会标彩蛋">
        <g
          v-for="f in feathers"
          :key="f.e.id"
          :transform="`rotate(${f.angle} ${CX} ${CY})`"
          class="wing"
          :class="{ on: active.id === f.e.id }"
          tabindex="0"
          role="button"
          :aria-label="f.e.cn"
          @click="pick(f.e)"
          @keydown.enter.prevent="pick(f.e)"
          @mouseenter="pick(f.e)"
        >
          <path :d="d()" />
        </g>
        <circle :cx="CX" :cy="CY" r="10" fill="var(--accent)" />
      </svg>
    </div>

    <aside class="bg-card border border-line rounded-card p-5">
      <div class="text-[13px] font-black tracking-widest text-[var(--accent-ink)]">会标彩蛋 · 第 {{ feathers.findIndex((f) => f.e.id === active.id) + 1 }} 根羽翼</div>
      <h3 class="text-2xl font-bold text-ink mt-1 flex items-center gap-2"><span class="text-2xl">{{ active.flag || '🏳' }}</span>{{ active.cn }}</h3>
      <p class="text-sm text-muted italic">{{ active.en }}</p>
      <div class="grid grid-cols-2 gap-2 mt-3 text-sm">
        <div class="bg-surface rounded-lg p-3"><div class="text-muted text-xs">区域</div><b class="text-ink">{{ active.region }}</b></div>
        <div class="bg-surface rounded-lg p-3"><div class="text-muted text-xs">加入</div><b class="text-ink font-mono">{{ active.year }}</b></div>
      </div>
      <p class="text-xs text-muted mt-3 leading-relaxed">会标的官方寓意就是「21 根羽翼，各具特色、相互依存」。把百科做成 21 根羽翼的交互图，知识科普与 2026 峰会主题在此缝合。</p>
    </aside>
  </div>
</template>

<style scoped>
.wing { cursor: pointer; }
.wing path {
  fill: #17335c;
  stroke: #2f6bb0;
  stroke-width: 1;
  transition: fill 0.2s, stroke 0.2s;
  transform-box: fill-box;
}
.wing:hover path { fill: #22456f; stroke: var(--color-neon); }
.wing.on path { fill: var(--accent); stroke: #fff; stroke-width: 1.5; }
.wing:focus { outline: none; }
</style>
