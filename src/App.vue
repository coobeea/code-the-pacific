<script setup>
import { onMounted, onBeforeUnmount, reactive, ref, watch } from 'vue'
import timeline from './data/timeline.json'
import { useNarrator } from './composables/useNarrator'

// 倒叙 2026 → 1979（timeline.json 正序存储）
const items = [...timeline].reverse()
const N = items.length
const years = items.map(m => m.year)
const eraColors = { '破冰': '#b45309', '生长': '#0e7490', '成势': '#1d4ed8', '领跑': '#92400e' }

// 在页 AI 讲解：点每个里程碑上的锚点 → 弹出模态层，展示该段的智能讲解词
const { narrate } = useNarrator()
// 每个里程碑的讲解缓存（loading / text / error），按索引懒建
const narr = reactive({})
const controllers = {}
// 当前弹出的那一段（i 为里程碑索引）
const modal = reactive({ open: false, i: -1 })

// 打字机：弹窗里逐字浮现的文本，与「是否正在打字」状态
const shown = ref('')
const typing = ref(false)
let typeTimer = null
const typedSet = new Set() // 已完整播过的段，重开时直接全文不再逐字

function stopType() {
  if (typeTimer) { clearInterval(typeTimer); typeTimer = null }
  typing.value = false
}

function typeOut(target, i) {
  stopType()
  if (typedSet.has(i)) { shown.value = target; return }
  shown.value = ''
  typing.value = true
  let idx = 0
  typeTimer = setInterval(() => {
    idx += 2
    shown.value = target.slice(0, idx)
    if (idx >= target.length) {
      shown.value = target
      stopType()
      typedSet.add(i)
    }
  }, 24)
}

function ensure(i) {
  if (!narr[i]) narr[i] = { loading: false, text: '', error: '' }
  return narr[i]
}

async function runNarrate(i, m) {
  const s = ensure(i)
  s.loading = true
  s.error = ''
  try {
    const ctrl = new AbortController()
    controllers[i] = ctrl
    const t = await narrate(m, ctrl.signal)
    s.text = t
    if (!t) s.error = '没收到讲解内容，请重试'
  } catch (e) {
    if (e?.name !== 'AbortError') s.error = '讲解失败了（' + (e?.message || '网络错误') + '），请重试'
  } finally {
    s.loading = false
    delete controllers[i]
  }
}

// 弹出讲解层；未生成过则按需调大模型生成
function openModal(i, m) {
  ensure(i)
  modal.i = i
  modal.open = true
  shown.value = ''
  stopType()
  document.body.style.overflow = 'hidden'
  const s = narr[i]
  if (s.text) typeOut(s.text, i)
  else if (!s.loading) runNarrate(i, m)
}

function closeModal() {
  if (modal.open) { stopSpeak(); stopType() }
  modal.open = false
  modal.i = -1
  shown.value = ''
  document.body.style.overflow = ''
}

// 对当前弹出的这一段换个说法重新生成
function regen() {
  const i = modal.i
  if (i < 0) return
  const s = ensure(i)
  s.text = ''
  shown.value = ''
  stopType()
  typedSet.delete(i)
  runNarrate(i, items[i])
}

// 浏览器原生语音朗读当前讲解词（无需额外接口）
function speak() {
  const s = narr[modal.i]
  if (!s || !s.text || typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(s.text)
  u.lang = 'zh-CN'
  u.rate = 1
  window.speechSynthesis.speak(u)
}
function stopSpeak() {
  if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel()
}

// 讲解词到达后，若弹窗正开着，就启动打字机逐字浮现
watch(
  () => (modal.open ? (narr[modal.i] && narr[modal.i].text) : ''),
  (t) => { if (modal.open && t && !typing.value) typeOut(t, modal.i) }
)

// Esc 关闭弹窗
function onKeydown(e) {
  if (e.key === 'Escape' && modal.open) closeModal()
}

// DOM 引用（onMounted 后按 id 获取，逻辑与标准版逐行一致）
let journey, endBlock, routeFill, svgNodes, token, yearVal, progBar
let routeLen = 0
let nodes = []
let stepEls = []

function buildRail() {
  if (!routeFill) return
  routeLen = routeFill.getTotalLength() || 0
  if (!routeLen || nodes.length === N) return
  routeFill.style.strokeDasharray = routeLen
  routeFill.style.strokeDashoffset = routeLen
  svgNodes.innerHTML = ''
  nodes = []
  for (let i = 0; i < N; i++) {
    const pt = routeFill.getPointAtLength(i / (N - 1) * routeLen)
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    c.setAttribute('cx', pt.x)
    c.setAttribute('cy', pt.y)
    c.setAttribute('r', '8')
    c.setAttribute('class', 'svg-node')
    svgNodes.appendChild(c)
    nodes.push(c)
  }
}

function tick() {
  if (!journey) return
  const vh = window.innerHeight
  const y = window.scrollY || window.pageYOffset || 0
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh)
  const sy = Math.min(maxScroll, Math.max(0, y))

  // 进度：以「每一步居中」为锚点，保证首屏 2026、走完全程 1979
  const anchors = []
  stepEls.forEach(s => {
    const r = s.getBoundingClientRect()
    anchors.push(r.top + y + r.height / 2 - vh / 2)
  })
  let p = 0
  const firstAnchor = Math.max(0, anchors[0])
  if (sy <= firstAnchor) p = 0
  else if (sy >= anchors[N - 1]) p = 1
  else {
    for (let i = 0; i < N - 1; i++) {
      if (sy >= anchors[i] && sy <= anchors[i + 1]) {
        const span = (anchors[i + 1] - anchors[i]) || 1
        p = (i + (sy - anchors[i]) / span) / (N - 1)
        break
      }
    }
  }
  p = Math.min(1, Math.max(0, p))

  // 年份插值
  const idxF = p * (N - 1)
  const lo = Math.floor(idxF)
  const hi = Math.min(N - 1, lo + 1)
  const fr = idxF - lo
  yearVal.textContent = Math.round(years[lo] + (years[hi] - years[lo]) * fr)

  // 背景色（取视口中心所在 section）
  let bg = items[0].bg
  stepEls.forEach(s => {
    const r = s.getBoundingClientRect()
    if (r.top <= vh * 0.5 && r.bottom >= vh * 0.5) bg = s.dataset.bg
  })
  const er = endBlock.getBoundingClientRect()
  if (er.top <= vh * 0.5 && er.bottom >= vh * 0.5) bg = endBlock.dataset.bg
  document.body.style.background = bg

  // 路径描线 + token
  if (!routeLen) buildRail()
  if (routeLen) {
    routeFill.style.strokeDashoffset = routeLen * (1 - p)
    const tp = routeFill.getPointAtLength(p * routeLen)
    token.setAttribute('cx', tp.x)
    token.setAttribute('cy', tp.y)
    nodes.forEach((n, i) => { n.classList.toggle('lit', p + 0.001 >= i / (N - 1)) })
  }
  if (progBar) progBar.style.width = (p * 100).toFixed(2) + '%'

  // 进场
  stepEls.forEach(s => {
    const r = s.getBoundingClientRect()
    if (r.top < vh * 0.78 && r.bottom > vh * 0.12) s.classList.add('on')
  })
}

function goTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

onMounted(() => {
  journey = document.getElementById('journey')
  endBlock = document.getElementById('endBlock')
  routeFill = document.getElementById('routeFill')
  svgNodes = document.getElementById('svgNodes')
  token = document.getElementById('token')
  yearVal = document.getElementById('yearVal')
  progBar = document.getElementById('progBar')
  stepEls = [...journey.querySelectorAll('.step')]
  buildRail()
  window.addEventListener('scroll', tick, { passive: true })
  window.addEventListener('resize', tick)
  window.addEventListener('orientationchange', tick)
  window.addEventListener('keydown', onKeydown)
  tick()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', tick)
  window.removeEventListener('resize', tick)
  window.removeEventListener('orientationchange', tick)
  window.removeEventListener('keydown', onKeydown)
  stopType()
  Object.values(controllers).forEach(c => { try { c.abort() } catch { /* noop */ } })
  stopSpeak()
})
</script>

<template>
  <div class="prog" aria-hidden="true"><i id="progBar"></i></div>

  <header class="hud">
    <div class="year"><span id="yearVal">2026</span><small>年</small></div>
    <div class="brand">南山 · <b>成长时光轴</b><em>向下滚 · 穿越 47 年</em></div>
  </header>

  <div class="rail">
    <svg viewBox="0 0 60 900" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <path d="M30 20 C10 150 50 200 30 320 C10 440 50 500 30 620 C10 740 50 800 30 880" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="5" stroke-linecap="round"/>
      <path id="routeFill" d="M30 20 C10 150 50 200 30 320 C10 440 50 500 30 620 C10 740 50 800 30 880" fill="none" stroke="#e8c877" stroke-width="5" stroke-linecap="round"/>
      <g id="svgNodes"></g>
      <circle id="token" r="9" cx="30" cy="20"/>
    </svg>
  </div>

  <main id="journey">
    <section
      v-for="(m, i) in items"
      :key="m.year"
      class="step"
      :data-bg="m.bg"
      :data-i="i"
    >
      <div class="body">
        <div class="ms-no">MILESTONE {{ String(N - i).padStart(2, '0') }} / {{ String(N).padStart(2, '0') }}
          <span class="era" :style="{ background: (eraColors[m.era] || '#64748b') + '33' }">{{ m.era }} · {{ m.apac }}</span>
        </div>
        <h2>{{ m.title }}</h2>
        <div class="tag">{{ m.tag }}</div>
        <p class="desc">{{ m.desc }}</p>
        <p class="link">→ {{ m.link }}</p>
        <div class="chips"><span v-for="c in m.chips" :key="c">{{ c }}</span></div>

        <!-- AI 讲解锚点：点开弹出讲解层，无需提问 -->
        <div class="narrate">
          <button class="narrate-btn" @click="openModal(i, m)">
            <span class="narrate-btn__ic" aria-hidden="true">✦</span>
            AI 讲解这一段
          </button>
        </div>
      </div>
    </section>

    <section class="end" id="endBlock" data-bg="#4a3a1a">
      <h2>一切，从这里开始</h2>
      <p class="slogan">1979 · 蛇口</p>
      <p class="lead">一声炮响，改变了所有。47 年后的今天，这片土地承办 APEC、面向亚太 21 个经济体，也把数字经济、互联互通的故事写进了城市叙事。<br>回望来路，每一步都算数。</p>
      <div class="apec-block">
        <p class="theme">建设亚太共同体<br>促进共同繁荣</p>
        <p class="pri">开放 · 创新 · 合作</p>
        <p class="pri">数字经济 · 互联互通</p>
        <p class="note">2026 APEC「中国年」主题与三大优先领域、核心议题 · 鲲鹏展翅，21 根羽翼，乘大势、共翱翔</p>
      </div>
      <button class="up" @click="goTop">↑ 回到 2026</button>

      <div class="srcs">
        <b>资料来源（可点击核验）</b>
        <ol>
          <li>① <a href="http://www.szns.gov.cn/mlns/nsgk/content/post_12563286.html" target="_blank" rel="noopener">南山政府在线 · 建置沿革（1990年设区 · 陆域 185.3 km²）</a></li>
          <li>② <a href="http://www.sasac.gov.cn/n2588025/n2588139/c10275576/content.html" target="_blank" rel="noopener">国务院国资委 · 1979.7.8 蛇口开山第一炮</a></li>
          <li>③ <a href="http://www.sz.gov.cn/cn/xxgk/zfxxgj/zwdt/content/post_12548571.html" target="_blank" rel="noopener">深圳政府在线 · APEC 第三十三次领导人非正式会议 2026.11.18–19 深圳</a></li>
          <li>④ <a href="http://www.xinhuanet.com/20251212/1d1dad261ca34e259c55c672e8497cfe/c.html" target="_blank" rel="noopener">新华网 · 2026 APEC「中国年」会标寓意（鲲鹏 · 21 根羽翼）</a></li>
          <li>⑤ <a href="http://www.szns.gov.cn/xxgk/bmxxgk/qfgj/qtgk_157954/yshjzt/zxdt/content/post_12639186.html" target="_blank" rel="noopener">南山政府在线 · 2025 年 GDP 达 10102.38 亿元</a></li>
          <li>⑥ <a href="http://www.gd.gov.cn/gdywdt/dsdt/content/mpost_4918501.html" target="_blank" rel="noopener">广东省人民政府 · 研发投入强度 7.87% · 上市企业 218 家</a></li>
          <li>⑦ <a href="https://www.gov.cn/gongbao/content/2021/content_5637944.htm" target="_blank" rel="noopener">中国政府网 · 2021.9.6 前海扩区方案（14.92→120.56 km²）</a></li>
          <li>⑧ <a href="https://qh.sz.gov.cn/ljszqh/zjqh/content/post_10062870.html" target="_blank" rel="noopener">前海官网 · 2010.8.26 国务院批复总体规划</a></li>
          <li>⑨ <a href="http://www.szns.gov.cn/mlns/stns/lc/csgy/content/post_12595660.html" target="_blank" rel="noopener">南山政府在线 · 深圳人才公园（约 77 万 m²）</a></li>
          <li>⑩ <a href="http://swj.sz.gov.cn/ztzl/swhjs/bdfc/content/post_11740850.html" target="_blank" rel="noopener">深圳市水务局 · 人才星光桥 30 位杰出人物星光柱</a></li>
          <li>⑪ <a href="http://paper.ce.cn/jjrb/html/2018-11/12/content_376735.htm" target="_blank" rel="noopener">经济日报 · 首届高交会与腾讯首笔 220 万美元融资</a></li>
          <li>⑫ <a href="https://www.hitsz.edu.cn/31/list.htm" target="_blank" rel="noopener">哈尔滨工业大学（深圳）· 2001–2002 进驻深圳大学城</a></li>
          <li>⑬ 公开报道综合 · 大疆 2006 年创立于深圳、起步于不足 20 m² 仓库</li>
        </ol>
        <p class="fine">内容整理自上述官方来源与公开报道，均可点击核验；交互形式为原创设计，只借「沿线索滚动推进」的交互范式，线索是南山自身的发展年代。APEC 2026 深圳 · 码上亚太 Code the Pacific。</p>
      </div>
    </section>
  </main>

  <!-- AI 讲解弹层（模态） -->
  <Transition name="nmodal">
    <div class="nmask" v-if="modal.open && items[modal.i]" @click.self="closeModal" role="dialog" aria-modal="true">
      <div class="nmodal">
        <button class="nmodal__close" @click="closeModal" aria-label="关闭讲解">×</button>
        <div class="nmodal__head">
          <span class="nmodal__year">{{ items[modal.i].year }}</span>
          <span class="nmodal__era" :style="{ background: (eraColors[items[modal.i].era] || '#64748b') + '33' }">{{ items[modal.i].era }} · {{ items[modal.i].apac }}</span>
        </div>
        <h3 class="nmodal__title">{{ items[modal.i].title }}</h3>
        <div class="nmodal__body">
          <p v-if="narr[modal.i].loading" class="narrate-loading"><span class="dots"><i></i><i></i><i></i></span> AI 正在讲解这段历史…</p>
          <p v-else-if="narr[modal.i].error" class="narrate-error">{{ narr[modal.i].error }} <button class="narrate-mini" @click="regen">重试</button></p>
          <template v-else>
            <p class="narrate-text">{{ shown }}<span class="caret" v-if="typing" aria-hidden="true"></span></p>
            <div class="narrate-acts" v-if="!typing">
              <button class="narrate-mini" @click="speak">🔊 朗读</button>
              <button class="narrate-mini" @click="stopSpeak">⏹ 停止</button>
              <button class="narrate-mini" @click="regen">↻ 换个说法</button>
            </div>
          </template>
        </div>
        <p class="nmodal__foot">讲解内容由 AI 依据本页已考证资料生成，仅供浏览参考 · APEC 2026 深圳 · 南山成长时光轴</p>
      </div>
    </div>
  </Transition>
</template>

<style>
  /* 固定 HUD */
  .hud {
    position: fixed; top: 0; left: 0; right: 0; z-index: 50;
    display: flex; justify-content: space-between; align-items: baseline; gap: 10px;
    padding: 16px clamp(20px, 10vw, 150px);
    padding-top: calc(16px + env(safe-area-inset-top, 0px));
    padding-left: calc(clamp(20px, 10vw, 150px) + env(safe-area-inset-left, 0px));
    padding-right: calc(clamp(20px, 10vw, 150px) + env(safe-area-inset-right, 0px));
    background: linear-gradient(180deg, rgba(0,0,0,.32), rgba(0,0,0,0));
    pointer-events: none;
  }
  .hud > * { pointer-events: auto }
  .year {
    font-family: ui-monospace, Menlo, monospace;
    font-weight: 900;
    font-size: clamp(38px, 10vw, 96px);
    color: #fff; line-height: 1; letter-spacing: -.02em;
    text-shadow: 0 2px 26px rgba(0,0,0,.5);
    flex: none;
  }
  .year small { font-size: .28em; color: rgba(255,255,255,.7); margin-left: 8px; letter-spacing: .2em; font-weight: 700 }
  .brand { font-size: 13px; font-weight: 800; color: rgba(255,255,255,.9); letter-spacing: .14em; text-align: right }
  .brand b { color: var(--gold) }
  .brand em { display: block; font-style: normal; font-weight: 500; color: rgba(255,255,255,.6); font-size: 11px; margin-top: 2px; letter-spacing: .12em }

  /* 右侧 SVG 弯曲时光轴 */
  .rail {
    position: fixed;
    right: calc(clamp(16px, 3vw, 24px) + env(safe-area-inset-right, 0px));
    top: clamp(130px, 17vh, 180px); bottom: 60px;
    width: 60px; z-index: 40; display: none;
  }
  .rail svg { width: 100%; height: 100% }
  @media (min-width: 768px) { .rail { display: block } }
  .svg-node { fill: rgba(255,255,255,.7); stroke: rgba(255,255,255,.4); stroke-width: 2; transition: .3s }
  .svg-node.lit { fill: var(--gold); stroke: var(--gold); filter: drop-shadow(0 0 6px rgba(232,200,119,.6)) }
  #token { fill: var(--gold); stroke: #fff; stroke-width: 3; filter: drop-shadow(0 2px 6px rgba(0,0,0,.3)) }

  /* 主体 */
  main { position: relative; z-index: 10; min-height: 100vh }

  /* AI 讲解锚点（每个里程碑卡片内） */
  .narrate { margin-top: 20px }
  .narrate-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 18px; border-radius: 999px; cursor: pointer;
    border: 1px solid rgba(232,200,119,.55);
    background: rgba(232,200,119,.14); color: var(--gold);
    font-weight: 800; font-size: 13px; letter-spacing: .04em;
    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
    transition: background .2s, transform .2s;
  }
  .narrate-btn:hover { background: rgba(232,200,119,.26); transform: translateY(-1px) }
  .narrate-btn__ic { font-size: 14px; line-height: 1 }
  /* AI 讲解弹层（模态） */
  .nmask {
    position: fixed; inset: 0; z-index: 120;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    padding-left: calc(20px + env(safe-area-inset-left, 0px));
    padding-right: calc(20px + env(safe-area-inset-right, 0px));
    background: rgba(6,16,26,.62);
    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  }
  .nmodal {
    position: relative; width: min(560px, 100%); max-height: 84vh; overflow: auto;
    text-align: left; padding: 24px 26px; border-radius: 18px;
    background: linear-gradient(180deg, #12354a, #0c2434);
    border: 1px solid rgba(232,200,119,.35);
    box-shadow: 0 24px 70px rgba(0,0,0,.55);
  }
  .nmodal__close {
    position: absolute; top: 12px; right: 14px;
    width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
    border: 1px solid rgba(255,255,255,.25); background: rgba(255,255,255,.06);
    color: #fff; font-size: 20px; line-height: 1; transition: background .2s;
  }
  .nmodal__close:hover { background: rgba(255,255,255,.16) }
  .nmodal__head { display: flex; align-items: center; gap: 12px }
  .nmodal__year {
    font-family: ui-monospace, Menlo, monospace; font-weight: 900;
    font-size: 34px; color: var(--gold); line-height: 1;
  }
  .nmodal__era {
    font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 999px;
    border: 1px solid rgba(255,255,255,.28); color: rgba(255,255,255,.9);
  }
  .nmodal__title {
    font-size: clamp(18px, 3vw, 24px); font-weight: 900; color: #fff;
    margin: 12px 0 4px; line-height: 1.25;
  }
  .nmodal__body { margin-top: 14px; min-height: 44px }
  .nmodal__foot {
    margin-top: 18px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.12);
    color: rgba(255,255,255,.45); font-size: 10px; line-height: 1.6;
  }
  /* 进出场过渡 */
  .nmodal-enter-active, .nmodal-leave-active { transition: opacity .25s ease }
  .nmodal-enter-active .nmodal, .nmodal-leave-active .nmodal { transition: transform .28s cubic-bezier(.2,.7,.2,1) }
  .nmodal-enter-from, .nmodal-leave-to { opacity: 0 }
  .nmodal-enter-from .nmodal, .nmodal-leave-to .nmodal { transform: translateY(18px) scale(.97) }
  .narrate-text {
    color: rgba(255,255,255,.95); font-size: clamp(14px, 2vw, 16px); line-height: 1.85;
  }
  .caret {
    display: inline-block; width: 2px; height: 1.1em; margin-left: 2px;
    vertical-align: -0.15em; background: var(--gold);
    animation: caretBlink 1s step-end infinite;
  }
  @keyframes caretBlink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
  .narrate-loading { color: rgba(255,255,255,.75); font-size: 14px; display: flex; align-items: center; gap: 10px }
  .narrate-error { color: #ffd9a0; font-size: 13px }
  .narrate-acts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px }
  .narrate-mini {
    padding: 5px 12px; border-radius: 999px; cursor: pointer;
    border: 1px solid rgba(255,255,255,.28); background: rgba(255,255,255,.08);
    color: rgba(255,255,255,.9); font-size: 12px; font-weight: 700; transition: background .2s;
  }
  .narrate-mini:hover { background: rgba(255,255,255,.18) }
  .dots { display: inline-flex; gap: 4px }
  .dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); animation: dotBlink 1.2s infinite }
  .dots i:nth-child(2) { animation-delay: .2s }
  .dots i:nth-child(3) { animation-delay: .4s }
  @keyframes dotBlink { 0%, 80%, 100% { opacity: .3 } 40% { opacity: 1 } }
  @media (prefers-reduced-motion: reduce) {
    .dots i { animation: none }
    .caret { animation: none; opacity: 1 }
    .nmodal-enter-active, .nmodal-leave-active,
    .nmodal-enter-active .nmodal, .nmodal-leave-active .nmodal { transition: none }
  }
  .step {
    min-height: 92vh; min-height: 92svh;
    display: flex; align-items: center;
    padding: clamp(96px, 15vh, 150px) clamp(20px, 10vw, 150px) clamp(52px, 10vh, 96px);
    padding-left: calc(clamp(20px, 10vw, 150px) + env(safe-area-inset-left, 0px));
    padding-right: calc(clamp(20px, 10vw, 150px) + env(safe-area-inset-right, 0px));
    position: relative;
  }
  /* 右轨出现时给它让出通道，避免压到正文 */
  @media (min-width: 768px) {
    .step { padding-right: calc(clamp(20px, 10vw, 150px) + 56px + env(safe-area-inset-right, 0px)) }
  }
  .step .body {
    position: relative; z-index: 1; max-width: 680px;
    opacity: .15; transform: translateY(30px);
    transition: opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1);
  }
  .step.on .body { opacity: 1; transform: none }
  .ms-no {
    font-family: ui-monospace, Menlo, monospace;
    font-size: 12px; color: rgba(255,255,255,.7); letter-spacing: .22em;
  }
  .era {
    display: inline-block; margin-left: 12px; vertical-align: 1px;
    font-size: 10px; font-weight: 800; padding: 2px 10px;
    border-radius: 999px; border: 1px solid rgba(255,255,255,.3);
    color: rgba(255,255,255,.9);
  }
  .step h2 {
    font-size: clamp(26px, 6vw, 54px); font-weight: 900;
    margin: 8px 0 4px; line-height: 1.08; letter-spacing: -.005em;
    text-shadow: 0 4px 20px rgba(0,0,0,.4);
    text-wrap: balance;
  }
  .step .tag {
    color: var(--gold); font-weight: 800;
    font-size: clamp(13px, 2vw, 17px); letter-spacing: .06em;
    margin-top: 4px;
  }
  .step p.desc {
    font-size: clamp(14px, 2.2vw, 18px);
    color: rgba(255,255,255,.95); margin-top: 16px; max-width: 52ch;
    line-height: 1.75;
    text-shadow: 0 2px 8px rgba(0,0,0,.3);
  }
  .step .link {
    color: rgba(232,200,119,.85); font-size: 13px;
    margin-top: 12px; letter-spacing: .04em;
  }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px }
  .chips span {
    font-family: ui-monospace, Menlo, monospace;
    font-size: 11px; padding: 4px 10px; border-radius: 6px;
    background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2);
    color: rgba(255,255,255,.9);
  }

  /* 结尾 */
  .end {
    min-height: 100vh; min-height: 100svh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 24px; text-align: center;
    padding-left: calc(24px + env(safe-area-inset-left, 0px));
    padding-right: calc(24px + env(safe-area-inset-right, 0px));
    padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  }
  .end h2 {
    font-size: clamp(30px, 7vw, 72px); font-weight: 900;
    color: var(--gold); letter-spacing: -.005em;
    text-wrap: balance;
  }
  .end .slogan {
    font-size: clamp(16px, 3vw, 26px); color: #fff;
    margin-top: 8px; letter-spacing: .3em; font-weight: 800;
  }
  .end p.lead {
    max-width: 52ch; color: rgba(255,255,255,.85); margin-top: 20px;
    font-size: clamp(14px, 2.2vw, 20px); line-height: 1.9;
  }
  .end .apec-block {
    margin-top: 32px; padding: 20px 32px;
    border-top: 1px solid rgba(255,255,255,.2);
    border-bottom: 1px solid rgba(255,255,255,.2);
    max-width: 46ch;
  }
  .end .apec-block .theme {
    color: var(--gold); font-weight: 900;
    font-size: clamp(16px, 3.2vw, 24px); line-height: 1.4;
  }
  .end .apec-block .pri {
    color: rgba(255,255,255,.75); font-size: 12px;
    margin-top: 12px; letter-spacing: .25em; font-weight: 700;
  }
  .end .apec-block .note {
    color: rgba(255,255,255,.55); font-size: 11px; margin-top: 8px;
    letter-spacing: .02em;
  }
  .end .up {
    margin-top: 32px; padding: 12px 28px; border-radius: 999px;
    border: 2px solid rgba(255,255,255,.5); color: #fff;
    font-weight: 800; font-size: 14px; cursor: pointer;
    background: transparent; transition: .2s;
  }
  .end .up:hover { background: rgba(255,255,255,.1) }

  .srcs {
    margin-top: 40px; max-width: 64ch; text-align: left;
    background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.15);
    border-radius: 14px; padding: 16px 20px;
    font-size: 11px; color: rgba(255,255,255,.7); line-height: 1.9;
  }
  .srcs b { color: var(--gold); letter-spacing: .1em; display: block; margin-bottom: 6px }
  .srcs ol { list-style: none; padding-left: 0; margin-top: 6px }
  .srcs li { margin-top: 3px }
  .srcs a { text-decoration: underline; text-decoration-color: rgba(255,255,255,.3); text-underline-offset: 2px }
  .srcs a:hover { color: #fff }
  .srcs .fine { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.1); color: rgba(255,255,255,.45); font-size: 10px; line-height: 1.7 }

  /* 小屏进度条（右侧时光轴在 <768px 隐藏，用它替代） */
  .prog {
    position: fixed; left: 0; right: 0; top: 0; z-index: 60;
    height: 3px; background: rgba(255,255,255,.14); display: none;
  }
  .prog i {
    display: block; height: 100%; width: 0;
    background: linear-gradient(90deg, rgba(232,200,119,.75), var(--gold));
    transition: width .12s linear;
  }
  @media (max-width: 767px) { .prog { display: block } }

  /* 小屏适配 */
  @media (max-width: 640px) {
    .hud { padding-top: calc(10px + env(safe-area-inset-top, 0px)); padding-bottom: 8px; gap: 8px }
    .year { font-size: clamp(30px, 8.6vw, 46px) }
    .year small { font-size: .3em; margin-left: 5px; letter-spacing: .08em }
    .brand { font-size: 11px; letter-spacing: .06em; line-height: 1.4 }
    .brand em { font-size: 10px; letter-spacing: .04em; margin-top: 1px }
    .step {
      padding-top: calc(80px + env(safe-area-inset-top, 0px));
      padding-bottom: calc(44px + env(safe-area-inset-bottom, 0px));
    }
    .ms-no { font-size: 11px; letter-spacing: .16em }
    .era { font-size: 9px; padding: 2px 8px; margin-left: 6px }
    .step h2 { font-size: clamp(24px, 6.4vw, 34px) }
    .step p.desc { margin-top: 12px }
    .step .link { margin-top: 10px; font-size: 12px }
    .chips { gap: 6px; margin-top: 12px }
    .chips span { font-size: 10.5px; padding: 4px 8px }
    .end .slogan { letter-spacing: .18em }
    .end .apec-block { margin-top: 24px; padding: 16px 18px }
    .end .apec-block .pri { letter-spacing: .18em; font-size: 11px }
    .end .up { margin-top: 26px; padding: 11px 24px }
    .srcs { margin-top: 28px; padding: 14px 14px; font-size: 10.5px; border-radius: 12px }
    .srcs ol { padding-left: 18px }
  }

  /* 矮屏（横屏手机） */
  @media (max-height: 520px) {
    .year { font-size: clamp(26px, 6vw, 40px) }
    .step { min-height: 100svh; padding-top: 66px; padding-bottom: 32px }
    .step h2 { font-size: clamp(22px, 4.6vw, 32px) }
  }

  @media (prefers-reduced-motion: reduce) {
    .step .body { transition: none; opacity: 1; transform: none }
    .prog i { transition: none }
  }
</style>
