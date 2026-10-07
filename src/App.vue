<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import timeline from './data/timeline.json'

const N = timeline.length
const items = [...timeline].reverse() // 倒叙：2026→1979
const years = items.map(m => m.year)
const DMAX = years[0]    // 2026
const DMIN = years[N - 1] // 1979

// 响应式状态
const yearEl = ref(DMAX)
const bg = ref(items[0].bg)
const markerY = ref(0)
const litSet = reactive(new Set())
const revealSet = reactive(new Set())

const railH = ref(0)
let journey = null
let rail = null
let marker = null

function tick() {
  if (!journey) return
  const vh = window.innerHeight
  const total = journey.scrollHeight
  const scrolled = Math.min(total - vh, Math.max(0, window.scrollY))
  const p = scrolled / total

  // 年份插值
  const idxF = p * (N - 1)
  const lo = Math.floor(idxF)
  const hi = Math.min(N - 1, lo + 1)
  const fr = idxF - lo
  yearEl.value = Math.round(years[lo] + (years[hi] - years[lo]) * fr)

  // 背景色（取视口中心所在 section）
  const sections = journey.querySelectorAll('[data-bg]')
  sections.forEach(s => {
    const r = s.getBoundingClientRect()
    if (r.top <= vh * 0.5 && r.bottom >= vh * 0.5) bg.value = s.dataset.bg
  })

  // 时光轴标记
  if (rail) markerY.value = p * railH.value

  // 点亮节点
  for (let i = 0; i < N; i++) {
    if (p + 0.001 >= i / (N - 1)) litSet.add(i)
    else litSet.delete(i)
  }

  // Reveal 进场
  sections.forEach((s, i) => {
    const r = s.getBoundingClientRect()
    if (r.top < vh * 0.75 && r.bottom > vh * 0.15) revealSet.add(i)
  })
}

function onScroll() { tick() }

onMounted(() => {
  journey = document.getElementById('journey')
  rail = document.getElementById('rail')
  marker = document.getElementById('marker')
  if (rail) railH.value = rail.getBoundingClientRect().height
  window.addEventListener('scroll', tick, { passive: true })
  window.addEventListener('resize', () => { if (rail) railH.value = rail.getBoundingClientRect().height })
  tick()
})
onUnmounted(() => window.removeEventListener('scroll', tick))

function goTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

const eras = ['破冰', '生长', '成势', '领跑']
const eraColors = ['#b45309', '#0e7490', '#1d4ed8', '#92400e']
</script>

<template>
  <!-- 固定 HUD -->
  <header class="fixed top-0 left-0 right-0 z-50 flex justify-between items-baseline px-5 py-4 md:px-11">
    <div class="font-mono font-black text-[clamp(38px,10vw,96px)] text-white leading-none tracking-tight drop-shadow-[0_2px_26px_rgba(0,0,0,0.5)]">
      {{ yearEl }}<span class="text-[.28em] text-white/70 ml-2 font-bold tracking-widest">年</span>
    </div>
    <div class="text-[13px] font-bold text-white/90 tracking-[.14em] text-right">
      南山 · <span class="text-[var(--color-gold)]">成长时光轴</span>
      <span class="block text-[11px] font-normal text-white/60 mt-0.5">向下滚 · 回望 {{ years[0] - years[N-1] }} 年</span>
    </div>
  </header>

  <!-- 右侧时光轴 -->
  <div id="rail" class="fixed right-6 md:right-11 top-[120px] bottom-[70px] w-[2px] bg-white/20 z-40 hidden md:block">
    <i v-for="(_, i) in N" :key="i"
      class="absolute left-[-4px] w-[10px] h-[10px] rounded-full transition-all duration-300"
      :style="{ top: (i / (N - 1) * 100) + '%', background: litSet.has(i) ? 'var(--color-gold)' : 'rgba(255,255,255,.35)', boxShadow: litSet.has(i) ? '0 0 10px var(--color-gold)' : 'none' }"
    ></i>
  </div>
  <div id="marker" class="fixed right-4 md:right-9 top-[120px] z-50 text-xl transition-transform duration-100 hidden md:block"
    :style="{ transform: `translateY(${markerY}px)` }"
  >🕰️</div>

  <!-- 主体内容 -->
  <main id="journey" class="relative z-10" :style="{ background: bg }">
    <!-- 里程碑 -->
    <section v-for="(m, i) in items" :key="m.year"
      class="min-h-[92vh] flex items-center px-6 md:px-16 lg:px-36 relative"
      :data-bg="m.bg"
    >
      <!-- 开屏 APEC 官方大图背景（仅第一屏） -->
      <div v-if="i === 0" class="absolute inset-0 bg-cover bg-center opacity-40" :style="{ backgroundImage: 'url(/code-the-pacific/assets/apec2026-banner.jpg)' }" aria-hidden="true"></div>
      <div v-if="i === 0" class="absolute inset-0 bg-gradient-to-b from-[#3b7fa8]/60 via-[#1b4e70]/70 to-[#0b2940]/90"></div>
      <div class="relative z-10 max-w-2xl" :class="revealSet.has(i) ? 'on reveal' : 'reveal'">
        <div class="text-xs font-mono text-white/70 tracking-widest">MILESTONE {{ String(N-i).padStart(2,'0') }} / {{ String(N).padStart(2,'0') }}
          <span class="inline-block text-[10px] font-bold px-2 py-0.5 ml-2 rounded-full border border-white/30 text-white/90" :style="{ background: eraColors[eras.indexOf(m.era)] + '33' }">{{ m.era }}</span>
        </div>
        <h2 class="text-[clamp(26px,6vw,54px)] font-black mt-2 leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,.4)]">{{ m.title }}</h2>
        <p class="text-[var(--color-gold)] font-bold text-[clamp(13px,2vw,17px)] mt-1">{{ m.tag }}</p>
        <p class="text-[clamp(14px,2.2vw,18px)] text-white/95 mt-4 max-w-[52ch] leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,.3)]">{{ m.desc }}</p>
        <div class="flex flex-wrap gap-2 mt-4">
          <span v-for="c in m.chips" :key="c" class="text-[11px] font-mono px-2.5 py-1 rounded border border-white/20 bg-white/10 text-white/90">{{ c }}</span>
        </div>
      </div>
    </section>

    <!-- 结尾（倒叙的终点 = 起点 1979） -->
    <section class="min-h-[100vh] flex flex-col items-center justify-center text-center px-6 pb-16" data-bg="#2d2109">
      <h2 class="text-[clamp(30px,7vw,72px)] font-black text-[var(--color-gold)]">一切，从这里开始</h2>
      <p class="text-[clamp(16px,3vw,26px)] tracking-[.3em] font-bold mt-2 text-white">1979 · 蛇口</p>
      <p class="max-w-[50ch] text-white/85 mt-6 text-[clamp(14px,2.2vw,20px)] leading-relaxed">
        一声炮响，改变了所有。47 年后的今天，这片土地承办 APEC、面向亚太 21 个经济体。<br>回望来路，每一步都算数。
      </p>
      <button @click="goTop" class="mt-8 px-7 py-3 rounded-full border-2 border-white/50 font-bold text-sm hover:bg-white/10 transition">↑ 回到 2026</button>
      <!-- 来源 -->
      <div class="mt-10 max-w-[60ch] text-left bg-white/5 border border-white/15 rounded-xl p-4 text-[11px] text-white/70 leading-relaxed">
        <b class="text-[var(--color-gold)] tracking-wider">资料来源</b><br>
        ① 深圳市南山区人民政府 · 行政区划（1990年设区）<br>
        ② 中国政府网 · APEC 第三十三次领导人非正式会议 2026.11.18-19 深圳<br>
        ③ 经济日报 · 深圳南山区全国首个 GDP 万亿城区<br>
        ④ 新华社 · 2021.9.6 前海扩区方案（14.92→120.56 km²）<br>
        ⑤ 国务院 · 2010.8.26 前海合作区批复<br>
        ⑥ 维基百科 · 南山区（蛇口1979/特区1980）<br>
        ⑦ 深圳新闻网 · 人才公园2017开园<br>
        ⑧ 创新南山/公开报道 · 高交会1999/大疆2006/大学城2001
      </div>
    </section>
  </main>

  <!-- 底部标注 -->
  <footer class="fixed left-4 bottom-3 z-50 text-[11px] text-white/50">
    E-02 南山成长时光轴（倒叙版）· 参赛交付物 · by Qoder
  </footer>
</template>
