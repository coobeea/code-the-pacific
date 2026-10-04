<script setup>
// 资料来源标注：让每个数据点/引用可追溯（需求 R-09 / C-06）
// items = [{ label, url? }]
defineProps({
  items: { type: Array, default: () => [] },
  title: { type: String, default: '资料来源' },
})
</script>

<template>
  <div class="mt-4 pt-3 border-t border-line text-xs text-muted">
    <span class="font-bold text-[var(--accent-ink)]">{{ title }}：</span>
    <template v-for="(s, i) in items" :key="i">
      <a
        v-if="s.url"
        :href="s.url"
        target="_blank"
        rel="noopener noreferrer"
        class="underline underline-offset-2 hover:text-[var(--accent-ink)]"
        >{{ s.label }}</a
      >
      <span v-else>{{ s.label }}</span>
      <span v-if="i < items.length - 1"> · </span>
    </template>
  </div>
</template>
