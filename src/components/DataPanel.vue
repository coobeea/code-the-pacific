<script setup>
// KPI 数据面板：items = [{ value, label }]（南山/经济体数据可视化，服务技术 30%）
defineProps({
  items: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <div
      v-for="(it, i) in items"
      :key="i"
      class="bg-card border border-line border-l-[3px] border-l-[var(--accent)] rounded-md p-4"
    >
      <div class="text-2xl md:text-[28px] font-extrabold font-mono text-[var(--accent-ink)]">{{ it.value }}</div>
      <div class="text-xs text-muted mt-1">{{ it.label }}</div>
    </div>
  </div>
</template>
