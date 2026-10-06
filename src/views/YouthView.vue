<script setup>
import { ref } from 'vue'
import PageShell from '../components/PageShell.vue'
import SectionTitle from '../components/SectionTitle.vue'
import SourceList from '../components/SourceList.vue'
import RegistrationForm from '../components/RegistrationForm.vue'
import Countdown from '../components/Countdown.vue'
import youth from '../data/youth.json'

// 分论坛 Tab 切换（用 v-if + <Transition> 淡入，无重型动画库）
const tab = ref(youth.tracks[0].key)
const openFaq = ref(-1)
const toggleFaq = (i) => (openFaq.value = openFaq.value === i ? -1 : i)
</script>

<template>
  <PageShell>
    <section class="text-center py-6">
      <p class="text-[13px] tracking-[.2em] uppercase font-bold text-[var(--accent)]">E-04 · 活动落地</p>
      <h1 class="mt-2 text-[clamp(26px,5vw,44px)] font-black text-ink">{{ youth.name }}</h1>
      <p class="mt-2 text-muted">{{ youth.sub }}</p>
    </section>

    <!-- 活动介绍 -->
    <div class="bg-card border border-line rounded-card p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      <div><span class="text-muted">活动时间</span><br /><b class="text-ink">{{ youth.period }}</b></div>
      <div><span class="text-muted">参与对象</span><br /><b class="text-ink">{{ youth.audience }}</b></div>
      <div><span class="text-muted">活动形式</span><br /><b class="text-ink">{{ youth.format }}</b></div>
      <div><span class="text-muted">语言</span><br /><b class="text-ink">{{ youth.language }}</b></div>
    </div>

    <!-- 议程时间轴 -->
    <section class="my-10">
      <SectionTitle title="建议议程" en="Agenda" />
      <ol class="relative border-l-2 border-[var(--accent)] ml-2 space-y-4">
        <li v-for="a in youth.agenda" :key="a.no" class="ml-5 relative">
          <span class="absolute -left-[27px] top-0 w-5 h-5 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-xs font-black flex items-center justify-center">{{ a.no }}</span>
          <h4 class="font-bold text-ink">{{ a.title }}</h4>
          <p class="text-sm text-muted">{{ a.desc }}</p>
        </li>
      </ol>
    </section>

    <!-- 分论坛 Tab -->
    <section class="my-10">
      <SectionTitle title="三个分论坛" en="Three Tracks" />
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="t in youth.tracks"
          :key="t.key"
          @click="tab = t.key"
          :class="['px-4 py-1.5 rounded-pill text-sm font-bold transition-colors duration-150', tab === t.key ? 'bg-[var(--accent)] text-[var(--accent-fg)]' : 'border border-line bg-card text-muted hover:bg-[var(--accent-tint)]']"
        >{{ t.key }} · {{ t.en }}</button>
      </div>
      <Transition name="fade" mode="out-in">
        <div :key="tab" class="bg-card border border-line rounded-card p-6">
          <h4 class="text-xl font-extrabold text-ink">{{ tab }}</h4>
          <p class="text-sm text-muted mt-2">{{ youth.tracks.find((t) => t.key === tab)?.desc }}</p>
          <ul class="mt-3 space-y-1">
            <li v-for="s in youth.tracks.find((t) => t.key === tab)?.samples" :key="s" class="text-sm text-muted flex gap-2"><span class="text-[var(--accent)]">▸</span>{{ s }}</li>
          </ul>
        </div>
      </Transition>
    </section>

    <!-- 倒计时 + 报名表单 -->
    <section class="my-10">
      <SectionTitle title="距 APEC 深圳峰会" en="Countdown · Nov 18, 2026" />
      <Countdown target="2026-11-18T09:00:00+08:00" class="my-4" />
    </section>

    <section class="my-10">
      <SectionTitle title="在线报名" en="Register" />
      <div class="bg-card border border-line rounded-card p-6">
        <RegistrationForm />
      </div>
    </section>

    <!-- FAQ 折叠 -->
    <section class="my-10">
      <SectionTitle title="常见问题" en="FAQ" />
      <div class="space-y-2">
        <div v-for="(f, i) in youth.faq" :key="i" class="bg-card border border-line rounded-lg overflow-hidden">
          <button class="w-full text-left px-4 py-3 font-semibold text-ink flex justify-between items-center" @click="toggleFaq(i)">
            {{ f.q }}<span class="text-[var(--accent)]">{{ openFaq === i ? '−' : '+' }}</span>
          </button>
          <div v-show="openFaq === i" class="px-4 pb-3 text-sm text-muted">{{ f.a }}</div>
        </div>
      </div>
    </section>

    <!-- 南山视角 -->
    <section class="my-10 bg-card border border-line rounded-card p-5">
      <SectionTitle title="南山视角" en="Nanshan Perspective" />
      <p class="text-sm text-muted">青少年交流可对接南山已有的美育与人文行动——「<b class="text-park">百校焕新</b>」自 2022 年起分三年对 <b class="text-park">143 所</b>学校和幼儿园全面焕新，是本地青少年美育与城市文化教育的真实落点。来源：深圳市南山区人民政府。</p>
    </section>

    <SourceList :items="youth.sources" />
  </PageShell>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s var(--ease-smooth);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
