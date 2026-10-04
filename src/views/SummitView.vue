<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import PageShell from '../components/PageShell.vue'
import SectionTitle from '../components/SectionTitle.vue'
import DataPanel from '../components/DataPanel.vue'
import SourceList from '../components/SourceList.vue'
import apec from '../data/apec.json'

// 距峰会开幕倒计时（11 月 18 日），只用原生 setInterval + 卸载清理，稳定优先
const target = new Date('2026-11-18T09:00:00+08:00').getTime()
const left = ref({ d: 0, h: '00', m: '00', s: '00' })
let timer
function tick() {
  let x = target - Date.now()
  if (x < 0) x = 0
  left.value = {
    d: Math.floor(x / 864e5),
    h: String(Math.floor((x % 864e5) / 36e5)).padStart(2, '0'),
    m: String(Math.floor((x % 36e5) / 6e4)).padStart(2, '0'),
    s: String(Math.floor((x % 6e4) / 1e3)).padStart(2, '0'),
  }
}
onMounted(() => { tick(); timer = setInterval(tick, 1000) })
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <PageShell>
    <!-- Hero + 会标 -->
    <section class="text-center py-6">
      <p class="text-[13px] tracking-[.2em] uppercase font-bold text-[var(--accent)]">E-01 · APEC 2026 深圳峰会</p>
      <svg class="mx-auto mt-3 w-24 h-24" viewBox="0 0 40 40" fill="none" aria-label="会标意象">
        <path d="M20 32C8 30 5 20 6 8c12 2 16 12 14 24" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" />
        <path d="M20 32c4-8 12-12 16-12-2 8-9 12-16 12" stroke="var(--accent-soft)" stroke-width="1.6" stroke-linecap="round" />
        <path d="M20 32C12 28 10 20 11 12M20 32c2-9 8-13 13-13" stroke="var(--accent)" stroke-width="0.6" opacity=".5" />
      </svg>
      <h1 class="mt-2 text-[clamp(24px,5vw,42px)] font-black text-ink">{{ apec.theme }}</h1>
      <p class="mt-1 text-muted italic">{{ apec.themeEn }}</p>
      <div class="mt-4 flex flex-wrap justify-center gap-2 text-sm">
        <span class="rounded-pill px-3 py-1 bg-[var(--accent-tint)] text-[var(--accent-ink)] font-bold">{{ apec.date }}</span>
        <span class="rounded-pill px-3 py-1 bg-[var(--accent-tint)] text-[var(--accent-ink)] font-bold">{{ apec.city }}</span>
      </div>
      <div class="mt-6 inline-flex flex-wrap items-center justify-center gap-3 bg-card border border-line rounded-card px-6 py-4 font-mono">
        <span class="text-muted text-sm">距开幕</span>
        <span class="text-3xl font-black text-[var(--accent-ink)]">{{ left.d }}</span><span class="text-muted text-xs">天</span>
        <span class="text-2xl font-bold">{{ left.h }}</span><span class="text-muted text-xs">时</span>
        <span class="text-2xl font-bold">{{ left.m }}</span><span class="text-muted text-xs">分</span>
        <span class="text-2xl font-bold">{{ left.s }}</span><span class="text-muted text-xs">秒</span>
      </div>
    </section>

    <DataPanel :items="apec.stats" class="my-8" />

    <!-- 会标三层解读 -->
    <section class="my-10">
      <SectionTitle title="会标 · 鲲鹏与 21 根羽翼" en="The Emblem" />
      <div class="bg-card border border-line rounded-card p-5 mb-4">
        <p class="text-sm text-muted">核心元素：<b class="text-ink">{{ apec.emblem.core }}</b>；主体：{{ apec.emblem.body }}；寓意：<b class="text-ink">{{ apec.emblem.meaning }}</b>。{{ apec.emblem.base }}。</p>
        <p class="text-xs text-muted mt-2 italic">📖 {{ apec.emblem.allusion }}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="l in apec.emblemLayers" :key="l.to" class="border border-line rounded-lg p-4 bg-card">
          <div class="text-2xl font-black text-[var(--accent-ink)] font-display">{{ l.to }}</div>
          <div class="text-sm text-muted mt-1">{{ l.form }}</div>
        </div>
      </div>
    </section>

    <!-- 三大优先领域 -->
    <section class="my-10">
      <SectionTitle title="三大优先领域" en="Three Priorities" />
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="p in apec.priorities" :key="p.key" class="bg-card border border-line rounded-card p-5">
          <div class="text-3xl font-black text-[var(--accent-ink)] font-display">{{ p.key }}</div>
          <div class="text-xs uppercase tracking-widest text-muted mt-1">{{ p.en }} · {{ p.role }}</div>
          <p class="text-sm text-muted mt-3">{{ p.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 会议年历 -->
    <section class="my-10">
      <SectionTitle title="会议年历" en="Summit Timeline" />
      <ol class="relative border-l-2 border-[var(--accent)] ml-2 space-y-5">
        <li v-for="t in apec.timeline" :key="t.date" class="ml-5 relative">
          <span class="absolute -left-[26px] top-1 w-4 h-4 rounded-full" :class="t.key ? 'bg-[var(--accent)] ring-4 ring-[var(--accent-tint)]' : 'bg-card border-2 border-[var(--accent)]'"></span>
          <div class="text-xs font-mono text-[var(--accent-ink)]">{{ t.date }} · {{ t.place }}</div>
          <h4 class="font-bold text-ink">{{ t.title }}</h4>
          <p class="text-sm text-muted">{{ t.desc }}</p>
        </li>
      </ol>
      <div class="mt-4 text-xs text-muted bg-[#f6ecd6] border border-[#e8d9ac] rounded-lg px-4 py-3">⏳ 待官方发布：{{ apec.pending.join('；') }}。</div>
    </section>

    <!-- 议题矩阵 + 会议周 -->
    <section class="my-10">
      <SectionTitle title="议题矩阵 · 专业部长会" en="Ministerial Matrix" />
      <div class="flex flex-wrap gap-2 mb-4">
        <span v-for="m in apec.ministerial" :key="m" class="text-sm border border-line bg-card rounded-pill px-3.5 py-1.5 text-[var(--accent-ink)] font-semibold">{{ m }}</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <span class="text-xs text-muted mr-1 self-center">会议周配套：</span>
        <span v-for="w in apec.week" :key="w" class="text-xs bg-[var(--accent-tint)] text-[var(--accent-ink)] rounded px-2.5 py-1">{{ w }}</span>
      </div>
    </section>

    <!-- 关于 APEC + 为什么深圳 -->
    <section class="my-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <SectionTitle title="关于 APEC" en="About APEC" />
        <div class="bg-card border border-line rounded-card p-5 space-y-2 text-sm text-muted">
          <p><b class="text-ink">地位</b>：{{ apec.aboutApec.founded }}</p>
          <p><b class="text-ink">成员</b>：{{ apec.aboutApec.members }}</p>
          <p><b class="text-ink">2026 里程碑</b>：{{ apec.aboutApec.milestone2026 }}</p>
          <p><b class="text-ink">观察员</b>：{{ apec.aboutApec.observers.join('、') }}</p>
        </div>
      </div>
      <div>
        <SectionTitle title="为什么是深圳" en="Why Shenzhen" />
        <p class="text-sm text-muted mb-3">{{ apec.shenzhen.why }}</p>
        <div class="grid grid-cols-2 gap-3">
          <div v-for="p in apec.shenzhen.points" :key="p.label" class="bg-card border border-line rounded-lg p-3">
            <div class="text-lg font-black text-[var(--accent-ink)] font-mono">{{ p.value }}</div>
            <div class="text-xs text-muted mt-1">{{ p.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 南山视角 -->
    <section class="my-10 bg-card border border-line rounded-card p-5">
      <SectionTitle title="南山视角" en="Nanshan Perspective" />
      <p class="text-sm text-muted">峰会主办城市深圳，其核心承载城区为<b class="text-park">南山</b>——{{ apec.host }}。前海深港合作区、后海、深圳湾超级总部基地，是峰会配套活动与外宾参访的重要承载地。详见 <router-link to="/02-nanshan" class="text-[var(--accent)] underline">城市名片入口</router-link>。</p>
    </section>

    <SourceList :items="apec.sources" />
  </PageShell>
</template>
