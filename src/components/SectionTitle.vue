<script setup>
defineProps({
  title: { type: String, required: true },
  en: { type: String, default: '' },
})
</script>

<template>
  <div class="flex items-center gap-3 mb-6">
    <span class="w-1 h-[22px] rounded-sm bg-[var(--accent)] shrink-0" aria-hidden="true"></span>
    <h3 class="text-xl md:text-2xl font-extrabold text-ink">{{ title }}</h3>
    <span v-if="en" class="text-xs font-mono uppercase tracking-widest text-muted">{{ en }}</span>
  </div>
</template>
