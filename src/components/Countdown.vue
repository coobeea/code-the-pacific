<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  target: { type: String, required: true }, // ISO date string
})

const diff = ref(0)
let timer = null

function calc() {
  const ms = new Date(props.target).getTime() - Date.now()
  diff.value = Math.max(0, ms)
}

onMounted(() => { calc(); timer = setInterval(calc, 1000) })
onUnmounted(() => clearInterval(timer))

const days = () => Math.floor(diff.value / 86400000)
const hours = () => Math.floor((diff.value % 86400000) / 3600000)
const mins = () => Math.floor((diff.value % 3600000) / 60000)
const secs = () => Math.floor((diff.value % 60000) / 1000)
</script>

<template>
  <div class="flex gap-3 justify-center flex-wrap font-mono" role="timer" aria-label="倒计时">
    <div class="text-center"><div class="text-[clamp(24px,5vw,42px)] font-black text-[var(--accent)]">{{ days() }}</div><div class="text-[10px] text-muted uppercase tracking-wider">天</div></div>
    <div class="text-center"><div class="text-[clamp(24px,5vw,42px)] font-black text-[var(--accent)]">{{ String(hours()).padStart(2,'0') }}</div><div class="text-[10px] text-muted uppercase tracking-wider">时</div></div>
    <div class="text-center"><div class="text-[clamp(24px,5vw,42px)] font-black text-[var(--accent)]">{{ String(mins()).padStart(2,'0') }}</div><div class="text-[10px] text-muted uppercase tracking-wider">分</div></div>
    <div class="text-center"><div class="text-[clamp(24px,5vw,42px)] font-black text-[var(--accent)]">{{ String(secs()).padStart(2,'0') }}</div><div class="text-[10px] text-muted uppercase tracking-wider">秒</div></div>
  </div>
</template>
