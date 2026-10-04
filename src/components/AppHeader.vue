<script setup>
import EntrySwitcher from './EntrySwitcher.vue'
</script>

<template>
  <header class="sticky top-0 z-30 bg-card border-b border-line">
    <div class="max-w-[1160px] mx-auto flex items-center gap-4 px-5 py-3">
      <router-link to="/" class="flex items-center gap-2.5 font-extrabold text-ink shrink-0">
        <svg class="w-8 h-8" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <path d="M20 32C8 30 5 20 6 8c12 2 16 12 14 24" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" />
          <path d="M20 32c4-8 12-12 16-12-2 8-9 12-16 12" stroke="var(--accent-soft)" stroke-width="2" stroke-linecap="round" />
        </svg>
        <span class="leading-tight">码上亚太<small class="block text-[11px] font-semibold text-muted tracking-wide">Code the Pacific</small></span>
      </router-link>
      <EntrySwitcher class="ml-auto" />
    </div>
  </header>
</template>
