<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  title: string
  body: string
  tag: string
}>()
</script>

<template>
  <li
    class="flex flex-col gap-y-4 rounded-3xl border border-white/10 bg-slate-900/45 p-6 sm:p-7 backdrop-blur-xl transition-all duration-300 hover:border-sky-400/40 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(56,189,248,0.14)] group"
  >
    <div class="flex items-center gap-x-3.5">
      <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-sky-400 backdrop-blur-md shadow-[0_0_12px_rgba(56,189,248,0.2)] transition-transform duration-200 group-hover:scale-105">
        <component :is="icon" class="size-5 sm:size-6" />
      </span>
      <h3 class="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
        {{ title }}
      </h3>
    </div>

    <p class="text-sm text-slate-400 leading-relaxed grow font-normal">
      {{ body }}
    </p>

    <div class="pt-2 border-t border-white/5">
      <span
        class="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[11px] font-semibold text-slate-300 tracking-wide"
      >
        {{ tag }}
      </span>
    </div>
  </li>
</template>
