<script setup>
// 数据驱动信息卡：八景 / 议题 / 经济体等同类内容的复用单元（需求 R-04）
defineProps({
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  label: { type: String, default: '' }, // 卡片头上的大字（如景名首字）
  tag: { type: String, default: '' },
  source: { type: String, default: '' },
})
</script>

<template>
  <article class="rounded-card border border-line bg-card overflow-hidden cursor-pointer transition-all duration-250 hover:shadow-pop hover:-translate-y-1">
    <div
      class="h-28 flex items-center justify-center text-white font-display text-3xl font-bold"
      style="background: linear-gradient(135deg, var(--accent), var(--accent-soft))"
    >
      {{ label || title }}
    </div>
    <div class="p-5">
      <h4 class="text-lg font-extrabold text-ink">{{ title }}</h4>
      <p v-if="desc" class="text-sm text-muted mt-1.5">{{ desc }}</p>
      <div class="flex flex-wrap items-center gap-2 mt-3">
        <span v-if="tag" class="text-xs rounded-pill px-2.5 py-0.5 font-bold bg-[var(--accent-tint)] text-[var(--accent-ink)]">{{ tag }}</span>
        <span v-if="source" class="text-xs text-muted font-mono">来源：{{ source }}</span>
      </div>
    </div>
  </article>
</template>
