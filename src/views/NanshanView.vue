<script setup>
import { ref } from 'vue'
import PageShell from '../components/PageShell.vue'
import SectionTitle from '../components/SectionTitle.vue'
import InfoCard from '../components/InfoCard.vue'
import DataPanel from '../components/DataPanel.vue'
import SourceList from '../components/SourceList.vue'
import SceneMap from '../components/SceneMap.vue'
import BarChart from '../components/BarChart.vue'
import Reveal from '../components/Reveal.vue'
import TimelineSection from '../components/TimelineSection.vue'
import scenes from '../data/scenes.json'
import nanshan from '../data/nanshan.json'
import timeline from '../data/timeline.json'

// 地图 ↔ 卡片联动：共享一个 activeId
const activeId = ref('houhai')
const mapWrap = ref(null)
function selectScene(id) {
  activeId.value = id
  mapWrap.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<template>
  <PageShell>
    <!-- Hero -->
    <section class="text-center py-6">
      <p class="text-[13px] tracking-[.2em] uppercase font-bold text-[var(--accent)]">E-02 · 鹏城文化数字名片</p>
      <h1 class="mt-2 text-[clamp(28px,6vw,52px)] font-black text-ink font-display">山海连城 · 绿美南山</h1>
      <p class="mt-2 text-muted max-w-[56ch] mx-auto">{{ nanshan.intro }}</p>
    </section>

    <Reveal><DataPanel :items="nanshan.stats" class="my-8" /></Reveal>

    <!-- 八景一张图（核心原创交互） -->
    <section ref="mapWrap" class="my-10 scroll-mt-24">
      <SectionTitle title="八景一张图" en="Eight Scapes · Interactive Map" />
      <SceneMap :active-id="activeId" @select="activeId = $event" />
    </section>

    <!-- 八景卡片（点卡片 → 地图高亮联动） -->
    <section class="my-10">
      <SectionTitle title="南山八景" en="2025 评选 · 7514 份推荐 · 71.6 万票" />
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Reveal v-for="(s, i) in scenes" :key="s.id" :delay="i * 40">
          <div
            class="cursor-pointer rounded-card transition-all duration-200"
            :class="activeId === s.id ? 'ring-2 ring-[var(--accent)] ring-offset-2' : ''"
            @click="selectScene(s.id)"
          >
            <InfoCard :label="s.name.slice(0, 2)" :title="s.name" :desc="s.intro" :tag="s.cat" :source="'创新南山'" />
          </div>
        </Reveal>
      </div>
      <p class="text-xs text-muted mt-2">提示：点任意卡片 → 上方地图对应片区高亮；卡片右上「查看详情」进入独立介绍页。</p>
    </section>

    <!-- 南山成长时光轴（12 个已考证里程碑） -->
    <TimelineSection :items="timeline" />

    <!-- 一海一河一城一湖 -->
    <Reveal>
      <section class="my-10">
        <SectionTitle title="一海 · 一河 · 一城 · 一湖" en="Sea · River · City · Lake" />
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div v-for="x in nanshan.oneSeaRiverCityLake" :key="x.key" class="bg-card border border-line rounded-lg p-4">
            <div class="text-sm font-bold text-[var(--accent-ink)]">{{ x.key }}</div>
            <div class="text-ink mt-1 font-semibold">{{ x.name }}</div>
            <div class="text-xs text-muted mt-1 font-mono">{{ x.metric }}</div>
          </div>
        </div>
        <div class="flex flex-wrap gap-3 mt-3">
          <span v-for="e in nanshan.extensions" :key="e.key" class="text-sm bg-[var(--accent-tint)] text-[var(--accent-ink)] rounded-pill px-4 py-1.5 font-semibold">{{ e.key }} · {{ e.name }}</span>
        </div>
      </section>
    </Reveal>

    <!-- 数据南山：企业梯队柱状图 -->
    <Reveal>
      <section class="my-10">
        <SectionTitle title="数据南山 · 企业梯队" en="Enterprise Pyramid" />
        <div class="bg-card border border-line rounded-card p-5">
          <BarChart :bars="nanshan.chart.bars" :unit="nanshan.chart.unit" />
          <p class="text-xs text-muted mt-2 text-center">单位：家。数据为 2025 年口径，来源见页脚。</p>
        </div>
        <div class="flex flex-wrap gap-2 mt-4">
          <span v-for="h in nanshan.honors" :key="h" class="text-xs border border-line bg-card rounded-pill px-3 py-1 text-muted">🏅 {{ h }}</span>
        </div>
      </section>
    </Reveal>

    <!-- 科创雨林 -->
    <Reveal>
      <section class="my-10">
        <SectionTitle title="科创雨林 · 企业生态" en="Innovation Rainforest" />
        <h4 class="text-sm font-bold text-[var(--accent-ink)] mb-2">顶天立地 · 龙头企业</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div v-for="f in nanshan.firms.lead" :key="f.name" class="bg-card border border-line rounded-card p-5">
            <div class="flex items-center gap-2"><span class="font-extrabold text-lg text-ink">{{ f.name }}</span><span class="text-[10px] rounded-pill px-2 py-0.5 bg-[var(--accent-tint)] text-[var(--accent-ink)] font-bold">{{ f.tag }}</span></div>
            <p class="text-sm text-[var(--accent-ink)] font-semibold mt-2">{{ f.metric }}</p>
            <p class="text-xs text-muted mt-1">{{ f.note }}</p>
          </div>
        </div>
        <h4 class="text-sm font-bold text-[var(--accent-ink)] mb-2">开天辟地 · 新锐力量</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          <div v-for="f in nanshan.firms.rising" :key="f.name" class="bg-card border border-line rounded-lg p-4">
            <div class="font-bold text-ink">{{ f.name }}</div>
            <p class="text-sm text-muted mt-1">{{ f.metric }}</p>
            <p v-if="f.note" class="text-xs text-muted mt-1">{{ f.note }}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <span v-for="f in nanshan.firms.software" :key="f.name" class="text-xs border border-line bg-card rounded-pill px-3 py-1"><b>{{ f.name }}</b> · {{ f.note }}</span>
        </div>
      </section>
    </Reveal>

    <!-- 海洋南山 -->
    <Reveal>
      <section class="my-10">
        <SectionTitle title="海洋南山" en="Ocean Nanshan" />
        <DataPanel :items="nanshan.ocean" />
      </section>
    </Reveal>

    <!-- 交通新地标 + 深港同城 -->
    <Reveal>
      <section class="my-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionTitle title="交通与文化新地标" en="New Landmarks" />
          <div class="space-y-3">
            <div v-for="l in nanshan.landmark" :key="l.name" class="bg-card border border-line rounded-lg p-4">
              <div class="flex justify-between gap-2"><b class="text-ink">{{ l.name }}</b><span class="text-xs font-mono text-[var(--accent-ink)] whitespace-nowrap">{{ l.metric }}</span></div>
              <p class="text-sm text-muted mt-1">{{ l.note }}</p>
            </div>
          </div>
        </div>
        <div>
          <SectionTitle title="深港同城" en="Shenzhen–HK Connectivity" />
          <ul class="bg-card border border-line rounded-card p-5 space-y-2">
            <li v-for="(t, i) in nanshan.hk" :key="i" class="text-sm text-muted flex gap-2"><span class="text-[var(--accent)]">◆</span>{{ t }}</li>
          </ul>
        </div>
      </section>
    </Reveal>

    <SourceList :items="[{ label: nanshan.source }]" />
  </PageShell>
</template>
