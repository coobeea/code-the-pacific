<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageShell from '../components/PageShell.vue'
import SectionTitle from '../components/SectionTitle.vue'
import SourceList from '../components/SourceList.vue'
import scenes from '../data/scenes.json'

const route = useRoute()
const router = useRouter()
const index = computed(() => Math.max(0, scenes.findIndex((s) => s.id === route.params.id)))
const scene = computed(() => scenes[index.value] || scenes[0])
const go = (dir) => {
  const n = (index.value + dir + scenes.length) % scenes.length
  router.push(`/02-nanshan/scene/${scenes[n].id}`)
}
</script>

<template>
  <PageShell>
    <div class="flex items-center justify-between mb-4">
      <router-link to="/02-nanshan" class="text-sm font-bold text-[var(--accent-ink)] hover:underline">← 返回名片 · 八景一张图</router-link>
      <div class="flex gap-2">
        <button class="px-3 py-1.5 rounded-pill border border-line bg-card text-sm hover:bg-[var(--accent-tint)]" @click="go(-1)">‹ 上一景</button>
        <button class="px-3 py-1.5 rounded-pill border border-line bg-card text-sm hover:bg-[var(--accent-tint)]" @click="go(1)">下一景 ›</button>
      </div>
    </div>

    <section
      class="rounded-card border-2 border-[var(--accent)] p-6 md:p-10 text-center"
      style="background: linear-gradient(135deg, var(--accent-tint), var(--color-card))"
    >
      <div class="text-[13px] font-black tracking-widest text-gold">南山八景 · 第 {{ index + 1 }} / {{ scenes.length }} 景 · {{ scene.cat }}</div>
      <h1 class="mt-2 text-[clamp(30px,7vw,56px)] font-black text-ink font-display">{{ scene.name }}</h1>
      <p class="mt-2 text-muted italic">{{ scene.sub }}</p>
      <p class="mt-4 max-w-[60ch] mx-auto text-ink/90 leading-relaxed">{{ scene.intro }}</p>
    </section>

    <section class="my-8">
      <SectionTitle title="代表景点" en="Landmarks" />
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-for="(p, i) in scene.points" :key="p" class="bg-card border border-line rounded-lg p-4 flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-black flex items-center justify-center shrink-0">{{ i + 1 }}</span>
          <span class="text-ink font-semibold">{{ p }}</span>
        </div>
      </div>
    </section>

    <SourceList :items="[{ label: '创新南山 · 南山八景评选（2025 年 12 月启动，7514 份推荐、716817 张有效投票）' }]" />
  </PageShell>
</template>
