<script setup>
import PageShell from '../components/PageShell.vue'

const entries = [
  { to: '/01-summit', no: 'E-01', name: 'APEC 2026 深圳峰会主题网站', desc: '会标鲲鹏 · 开放/创新/合作 · 会议年历时间轴', acc: '#c9962a', ns: '主办城区南山' },
  { to: '/02-nanshan', no: 'E-02', star: true, name: '鹏城文化数字名片', desc: '南山八景 · 一海一河一城一湖 · 科创数据面板', acc: '#2f9bb8', ns: '整站即南山' },
  { to: '/03-pedia', no: 'E-03', name: '亚太经济体互动百科', desc: '21 经济体 · 检索/筛选/对比 · 21 羽翼', acc: '#0a5cff', ns: '亚太网络里的南山节点' },
  { to: '/04-youth', no: 'E-04', name: '少年亚太对话', desc: '青少年交流平台 · 报名跳转第三方 · 作品展示', acc: '#d64591', ns: '南山·百校焕新' },
]
</script>

<template>
  <PageShell>
    <section class="text-center py-6 md:py-10">
      <p class="text-[13px] tracking-[.2em] uppercase font-bold text-[var(--accent)]">单项目 · 四入口 · 一套架构</p>
      <h1 class="mt-3 text-[clamp(30px,7vw,60px)] font-black leading-tight text-ink">一套地基，<span class="text-[var(--accent-ink)]">四种题材</span></h1>
      <p class="mt-3 max-w-[58ch] mx-auto text-muted text-base">官方四个 AI Coding 选题方向全部开发，置于同一应用、共享同一套设计系统与外壳，从展厅自由进入、相互比较。</p>
    </section>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <router-link
        v-for="e in entries"
        :key="e.no"
        :to="e.to"
        :style="{ '--card-acc': e.acc }"
        class="group relative block bg-card border border-line rounded-card overflow-hidden transition-all duration-250 hover:shadow-pop hover:-translate-y-1"
      >
        <span v-if="e.star" class="absolute top-3 right-3 z-10 text-xs font-black text-gold">★ 主推</span>
        <div class="h-2.5" style="background: var(--card-acc)"></div>
        <div class="p-6">
          <div class="font-mono text-xs text-muted tracking-widest">{{ e.no }}</div>
          <h2 class="mt-1 text-xl font-extrabold text-ink">{{ e.name }}</h2>
          <p class="mt-2 text-sm text-muted">{{ e.desc }}</p>
          <div class="mt-4 inline-flex items-center gap-2 text-xs rounded-pill px-3 py-1 font-bold" style="background:#eef7f0;color:#0b7a4b">
            🏙 南山视角 · {{ e.ns }}
          </div>
          <div class="mt-4 font-bold text-sm" style="color: var(--card-acc)">进入入口 →</div>
        </div>
      </router-link>
    </div>
  </PageShell>
</template>
