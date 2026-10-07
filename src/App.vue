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
const gradientBg = computed(() => {
  const stops = items.map(m => `${m.bg} ${(items.indexOf(m)/(N-1)*100).toFixed(1)}%`)
  return `linear-gradient(180deg, ${stops.join(', ')}, #4a3a1a 100%)`
})
const markerY = ref(0)
const litSet = reactive(new Set())
const revealSet = reactive(new Set())

const railH = ref(0)
let journey = null
let rail = null
let marker = null
let routeFill = null
let routeLen = 0

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
  if (routeFill && routeLen > 0) {
    routeFill.style.strokeDashoffset = routeLen * (1 - p)
    const token = document.getElementById('token')
    if (token) {
      const pt = routeFill.getPointAtLength(p * routeLen)
      token.setAttribute('cx', pt.x)
      token.setAttribute('cy', pt.y)
    }
  }

  // 点亮节点
  const svgNodes = document.querySelectorAll('.svg-node')
  for (let i = 0; i < N; i++) {
    if (p + 0.001 >= i / (N - 1)) { litSet.add(i); svgNodes[i]?.classList.add('lit') }
    else { litSet.delete(i); svgNodes[i]?.classList.remove('lit') }
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
  routeFill = document.getElementById('routeFill')
  if (rail) railH.value = rail.getBoundingClientRect().height
  if (routeFill) {
    routeLen = routeFill.getTotalLength()
    routeFill.style.strokeDasharray = routeLen
    routeFill.style.strokeDashoffset = routeLen
    // 把节点放到路径上
    const svgNodes = document.querySelectorAll('.svg-node')
    svgNodes.forEach((n, i) => {
      const frac = i / (N - 1)
      const pt = routeFill.getPointAtLength(frac * routeLen)
      n.setAttribute('cx', pt.x)
      n.setAttribute('cy', pt.y)
    })
  }
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
      <em class="block font-medium font-normal not-italic text-white/60 text-[11px] mt-0.5 tracking-[.12em]">向下滚 · 穿越 47 年</em>
    </div>
  </header>

  <!-- 右侧 SVG 弯曲时光轴 -->
  <div id="rail" class="fixed right-4 md:right-6 top-[100px] bottom-[60px] w-[60px] z-40 hidden md:block">
    <svg viewBox="0 0 60 900" preserveAspectRatio="xMidYMid meet" class="w-full h-full">
      <path d="M30 20 C10 150 50 200 30 320 C10 440 50 500 30 620 C10 740 50 800 30 880" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="5" stroke-linecap="round"/>
      <path id="routeFill" d="M30 20 C10 150 50 200 30 320 C10 440 50 500 30 620 C10 740 50 800 30 880" fill="none" stroke="var(--color-gold)" stroke-width="5" stroke-linecap="round"/>
      <g id="svg-nodes">
        <circle v-for="(_, i) in N" :key="i" class="svg-node" r="8" :data-i="i" />
      </g>
      <circle id="token" r="9" cx="30" cy="20" />
    </svg>
  </div>

  <!-- 主体内容 -->
  <main id="journey" class="relative z-10 min-h-screen" :style="{ background: bg, transition: 'background 1.5s ease' }">
    <!-- 里程碑 -->
    <section v-for="(m, i) in items" :key="m.year"
      class="min-h-[92vh] flex items-center px-6 md:px-16 lg:px-36 relative"
      :data-bg="m.bg"
    >
      <div class="relative z-10 max-w-2xl" :class="revealSet.has(i) ? 'on reveal' : 'reveal'">
        <div class="text-xs font-mono text-white/70 tracking-widest">MILESTONE {{ String(N-i).padStart(2,'0') }} / {{ String(N).padStart(2,'0') }}
          <span class="inline-block text-[10px] font-bold px-2 py-0.5 ml-2 rounded-full border border-white/30 text-white/90" :style="{ background: eraColors[eras.indexOf(m.era)] + '33' }">{{ m.era }} · {{ m.apac }}</span>
        </div>
        <h2 class="text-[clamp(26px,6vw,54px)] font-black mt-2 leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,.4)]">{{ m.title }}</h2>
        <p class="text-[var(--color-gold)] font-bold text-[clamp(13px,2vw,17px)] mt-1">{{ m.tag }}</p>
        <p class="text-[clamp(14px,2.2vw,18px)] text-white/95 mt-4 max-w-[52ch] leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,.3)]">{{ m.desc }}</p>
        <p class="text-[13px] text-[var(--color-gold)]/85 mt-3 tracking-wide">→ {{ m.link }}</p>
        <div class="flex flex-wrap gap-2 mt-4">
          <span v-for="c in m.chips" :key="c" class="text-[11px] font-mono px-2.5 py-1 rounded border border-white/20 bg-white/10 text-white/90">{{ c }}</span>
        </div>
      </div>
    </section>

    <!-- 结尾（倒叙的终点 = 起点 1979） -->
    <section class="min-h-[100vh] flex flex-col items-center justify-center text-center px-6 pb-16" data-bg="#4a3a1a">
      <h2 class="text-[clamp(30px,7vw,72px)] font-black text-[var(--color-gold)]">一切，从这里开始</h2>
      <p class="text-[clamp(16px,3vw,26px)] tracking-[.3em] font-bold mt-2 text-white">1979 · 蛇口</p>
      <p class="max-w-[50ch] text-white/85 mt-6 text-[clamp(14px,2.2vw,20px)] leading-relaxed">
        一声炮响，改变了所有。47 年后的今天，这片土地承办 APEC、面向亚太 21 个经济体。<br>回望来路，每一步都算数。
      </p>
      <div class="mt-8 px-8 py-5 border-y border-white/20 max-w-[46ch]">
        <p class="text-[var(--color-gold)] font-black text-[clamp(16px,3.2vw,24px)] leading-snug">建设亚太共同体<br>促进共同繁荣</p>
        <p class="text-white/75 text-[12px] mt-3 tracking-[.25em] font-bold">开放 · 创新 · 合作</p>
        <p class="text-white/55 text-[11px] mt-2">2026 APEC 中国年主题与三大优先领域 · 鲲鹏展翅，21 根羽翼，乘大势、共翱翔</p>
      </div>
      <button @click="goTop" class="mt-8 px-7 py-3 rounded-full border-2 border-white/50 font-bold text-sm hover:bg-white/10 transition">↑ 回到 2026</button>
      <!-- 来源 -->
      <div class="mt-10 max-w-[64ch] text-left bg-white/5 border border-white/15 rounded-xl p-4 text-[11px] text-white/70 leading-relaxed">
        <b class="text-[var(--color-gold)] tracking-wider">资料来源（可点击核验）</b>
        <ol class="mt-2 space-y-1">
          <li>① <a class="underline decoration-white/30 underline-offset-2 hover:text-white" href="http://www.szns.gov.cn/mlns/nsgk/content/post_12563286.html" target="_blank" rel="noopener">南山政府在线 · 建置沿革（1990年设区 · 陆域 185.3 km²）</a></li>
          <li>② <a class="underline decoration-white/30 underline-offset-2 hover:text-white" href="http://www.sasac.gov.cn/n2588025/n2588139/c10275576/content.html" target="_blank" rel="noopener">国务院国资委 · 1979.7.8 蛇口开山第一炮</a></li>
          <li>③ <a class="underline decoration-white/30 underline-offset-2 hover:text-white" href="http://www.sz.gov.cn/cn/xxgk/zfxxgj/zwdt/content/post_12548571.html" target="_blank" rel="noopener">深圳政府在线 · APEC 第三十三次领导人非正式会议 2026.11.18–19 深圳</a></li>
          <li>④ <a class="underline decoration-white/30 underline-offset-2 hover:text-white" href="http://www.xinhuanet.com/20251212/1d1dad261ca34e259c55c672e8497cfe/c.html" target="_blank" rel="noopener">新华网 · 2026 APEC「中国年」会标寓意（鲲鹏 · 21 根羽翼）</a></li>
          <li>⑤ <a class="underline decoration-white/30 underline-offset-2 hover:text-white" href="http://www.szns.gov.cn/xxgk/bmxxgk/qfgj/qtgk_157954/yshjzt/zxdt/content/post_12639186.html" target="_blank" rel="noopener">南山政府在线 · 2025 年 GDP 达 10102.38 亿元</a></li>
          <li>⑥ <a class="underline decoration-white/30 underline-offset-2 hover:text-white" href="http://www.gd.gov.cn/gdywdt/dsdt/content/mpost_4918501.html" target="_blank" rel="noopener">广东省人民政府 · 研发投入强度 7.87% · 上市企业 218 家</a></li>
          <li>⑦ <a class="underline decoration-white/30 underline-offset-2 hover:text-white" href="https://www.gov.cn/gongbao/content/2021/content_5637944.htm" target="_blank" rel="noopener">中国政府网 · 2021.9.6 前海扩区方案（14.92→120.56 km²）</a></li>
          <li>⑧ <a class="underline decoration-white/30 underline-offset-2 hover:text-white" href="https://qh.sz.gov.cn/ljszqh/zjqh/content/post_10062870.html" target="_blank" rel="noopener">前海官网 · 2010.8.26 国务院批复总体规划</a></li>
          <li>⑨ <a class="underline decoration-white/30 underline-offset-2 hover:text-white" href="http://www.szns.gov.cn/mlns/stns/lc/csgy/content/post_12595660.html" target="_blank" rel="noopener">南山政府在线 · 深圳人才公园（约 77 万 m²）</a></li>
          <li>⑩ <a class="underline decoration-white/30 underline-offset-2 hover:text-white" href="http://swj.sz.gov.cn/ztzl/swhjs/bdfc/content/post_11740850.html" target="_blank" rel="noopener">深圳市水务局 · 人才星光桥 30 位杰出人物星光柱</a></li>
          <li>⑪ <a class="underline decoration-white/30 underline-offset-2 hover:text-white" href="http://paper.ce.cn/jjrb/html/2018-11/12/content_376735.htm" target="_blank" rel="noopener">经济日报 · 首届高交会与腾讯首笔 220 万美元融资</a></li>
          <li>⑫ <a class="underline decoration-white/30 underline-offset-2 hover:text-white" href="https://www.hitsz.edu.cn/31/list.htm" target="_blank" rel="noopener">哈尔滨工业大学（深圳）· 2001–2002 进驻深圳大学城</a></li>
          <li>⑬ 公开报道综合 · 大疆 2006 年创立于深圳、起步于不足 20 m² 仓库</li>
        </ol>
        <p class="mt-3 pt-3 border-t border-white/10 text-white/45 text-[10px] leading-relaxed">
          内容整理自上述官方来源与公开报道，均可点击核验；交互形式为原创设计，
          只借「沿线索滚动推进」的交互范式，线索是南山自身的发展年代。
        </p>
      </div>
    </section>
  </main>

</template>

<style scoped>
.svg-node { fill: rgba(255,255,255,.7); stroke: rgba(255,255,255,.4); stroke-width: 2; transition: .3s }
.svg-node.lit { fill: var(--color-gold); stroke: var(--color-gold); filter: drop-shadow(0 0 6px rgba(232,200,119,.6)) }
#token { fill: var(--color-gold); stroke: #fff; stroke-width: 3; filter: drop-shadow(0 2px 6px rgba(0,0,0,.3)) }
</style>
