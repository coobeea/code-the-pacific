<script setup>
import { computed } from 'vue'

// 核心原创交互：手绘南山地图 + 点位点击展开八景详情（需求 E-02 · R-02 · B4）
// 受控组件：选中态由父级 activeId 驱动，卡片↔地图联动；支持上一景/下一景轮播
import scenes from '../data/scenes.json'

const props = defineProps({
  activeId: { type: String, required: true },
})
const emit = defineEmits(['select'])

const active = computed(() => scenes.find((s) => s.id === props.activeId) || scenes[0])
const index = computed(() => Math.max(0, scenes.findIndex((s) => s.id === props.activeId)))
const go = (dir) => {
  const next = (index.value + dir + scenes.length) % scenes.length
  emit('select', scenes[next].id)
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-5 items-start">
    <div class="bg-[#bfe3ee] border-2 border-[var(--accent)] rounded-xl overflow-hidden">
      <svg viewBox="0 0 760 560" class="block w-full h-auto" role="img" aria-label="南山八景示意地图">
        <path d="M0 40 L760 40 L760 560 L120 560 C40 500 0 430 0 360 Z" fill="#f0ead8" />
        <path d="M0 360 C0 430 40 500 120 560 L0 560 Z" fill="#8fcfe0" />
        <path d="M120 560 C220 520 300 500 360 470 L300 560 Z" fill="#8fcfe0" opacity=".8" />
        <ellipse cx="300" cy="120" rx="120" ry="55" fill="#cfe6c4" />
        <ellipse cx="540" cy="170" rx="90" ry="45" fill="#cfe6c4" />
        <path d="M430 120 C420 240 400 330 360 430" fill="none" stroke="#5aa9c4" stroke-width="5" stroke-linecap="round" />
        <ellipse cx="560" cy="270" rx="46" ry="28" fill="#8fcfe0" />
        <path d="M60 470 C220 430 380 430 560 450 C660 460 720 480 760 500" fill="none" stroke="#3d7f92" stroke-width="3" stroke-dasharray="2 6" />
        <text x="70" y="520" class="sea">伶仃洋</text>
        <text x="360" y="500" class="sea">深圳湾</text>
        <text x="270" y="118" class="area">阳台山</text>
        <text x="525" y="272" class="area">西丽湖</text>
        <text x="415" y="220" class="area">大沙河</text>
        <g
          v-for="(s, i) in scenes"
          :key="s.id"
          class="pin"
          :class="{ on: s.id === props.activeId }"
          tabindex="0"
          role="button"
          :aria-label="s.name"
          @click="emit('select', s.id)"
          @keydown.enter.prevent="emit('select', s.id)"
        >
          <circle :cx="s.x" :cy="s.y" :r="s.id === props.activeId ? 22 : 18" />
          <text :x="s.x" :y="s.y + 5">{{ i + 1 }}</text>
        </g>
      </svg>
    </div>

    <aside class="bg-card border-2 border-[var(--accent)] rounded-xl p-5 md:sticky md:top-20">
      <div class="flex items-center justify-between">
        <div class="text-[13px] font-black tracking-widest text-gold">南山八景 · 第 {{ index + 1 }} / {{ scenes.length }} 景</div>
        <div class="flex gap-1">
          <button class="w-8 h-8 rounded-lg border border-line text-ink hover:bg-[var(--accent-tint)] transition-colors" @click="go(-1)" aria-label="上一景">‹</button>
          <button class="w-8 h-8 rounded-lg border border-line text-ink hover:bg-[var(--accent-tint)] transition-colors" @click="go(1)" aria-label="下一景">›</button>
        </div>
      </div>
      <h3 class="text-3xl font-bold mt-1 text-ink font-display">{{ active.name }}</h3>
      <p class="text-sm text-muted italic mt-1 mb-3">{{ active.sub }}</p>
      <p class="text-sm text-muted leading-relaxed">{{ active.intro }}</p>
      <ul class="flex flex-wrap gap-2 mt-4">
        <li v-for="p in active.points" :key="p" class="text-[13px] bg-[#f3efe3] border border-[#e3dcc8] rounded-lg px-3 py-1.5">{{ p }}</li>
      </ul>
      <div class="flex items-center justify-between mt-4 pt-3 border-t border-dashed border-[#ddd4c0]">
        <span class="text-xs text-muted">点位为示意位置，非精确地理坐标。</span>
        <router-link :to="`/02-nanshan/scene/${active.id}`" class="text-sm font-bold text-[var(--accent-ink)] whitespace-nowrap hover:underline">查看详情 →</router-link>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.sea { fill: #3d7f92; font-size: 13px; font-style: italic; font-family: Georgia, serif; }
.area { fill: #7a8a5a; font-size: 11px; font-family: sans-serif; }
.pin { cursor: pointer; }
.pin circle { fill: #c0392b; stroke: #fff; stroke-width: 2; transition: fill 0.2s, r 0.2s; }
.pin text { fill: #fff; font-size: 15px; font-weight: 800; text-anchor: middle; pointer-events: none; }
.pin:hover circle,
.pin.on circle { fill: var(--accent); }
.pin.on circle { stroke: #fff; stroke-width: 3; }
.pin:focus { outline: none; }
</style>
