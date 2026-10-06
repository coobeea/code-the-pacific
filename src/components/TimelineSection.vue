<script setup>
import SectionTitle from './SectionTitle.vue'
import Reveal from './Reveal.vue'

defineProps({
  items: { type: Array, required: true },
})

// 4 个时代标签及其对应颜色
const eras = ['破冰', '生长', '成势', '领跑']
const eraColors = ['#b45309', '#0e7490', '#1d4ed8', '#92400e']
</script>

<template>
  <section class="my-12">
    <SectionTitle title="南山成长时光轴" en="Growth Timeline · 1979 → 2026" />

    <!-- 时代分组标签条 -->
    <div class="flex gap-2 mb-6 flex-wrap">
      <span
        v-for="(e, i) in eras"
        :key="e"
        class="text-[11px] font-bold px-3 py-1 rounded-pill text-white"
        :style="{ background: eraColors[i] }"
      >{{ e }}</span>
      <span class="text-xs text-muted ml-auto self-center">向下滚动 · 穿越 47 年</span>
    </div>

    <!-- 纵向时间轴 -->
    <div class="relative pl-6 md:pl-10">
      <!-- 竖线 -->
      <div class="absolute left-2 md:left-4 top-0 bottom-0 w-[2px] bg-line" aria-hidden="true"></div>

      <Reveal v-for="(m, i) in items" :key="m.year" :delay="i * 50">
        <div class="relative mb-8 last:mb-0">
          <!-- 圆点 -->
          <span
            class="absolute -left-[18px] md:-left-[26px] top-[10px] w-[12px] h-[12px] rounded-full border-[3px] transition-colors"
            :style="{ borderColor: eraColors[eras.indexOf(m.era)] || '#64748b' }"
          ></span>

          <!-- 卡片 -->
          <div class="bg-card border border-line rounded-card p-5 transition-shadow hover:shadow-pop">
            <div class="flex items-center gap-3 flex-wrap">
              <span class="font-mono text-[clamp(20px,3vw,28px)] font-black text-ink">{{ m.year }}</span>
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-pill text-white"
                :style="{ background: eraColors[eras.indexOf(m.era)] || '#64748b' }"
              >{{ m.era }}</span>
            </div>
            <h3 class="text-[clamp(16px,2.5vw,22px)] font-bold text-ink mt-2">{{ m.title }}</h3>
            <p class="text-[13px] text-[var(--accent-ink)] font-semibold mt-1">{{ m.tag }}</p>
            <p class="text-sm text-muted mt-3 leading-relaxed">{{ m.desc }}</p>
            <div class="flex flex-wrap gap-2 mt-3">
              <span
                v-for="c in m.chips"
                :key="c"
                class="text-[11px] font-mono bg-[var(--accent-tint)] text-[var(--accent-ink)] rounded px-2 py-0.5"
              >{{ c }}</span>
            </div>
          </div>
        </div>
      </Reveal>
    </div>

    <p class="text-[11px] text-muted mt-4 leading-relaxed">
      资料来源：深圳市南山区人民政府 · 中国政府网 · 新华社 · 经济日报 · 维基百科 · 深圳新闻网（公开可查，内容正能量整理）
    </p>
  </section>
</template>
