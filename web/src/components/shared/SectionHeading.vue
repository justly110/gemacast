<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-y-3.5 text-center px-4">
    <span
      class="rounded-full border border-sky-400/25 bg-sky-400/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.18em] text-sky-400 backdrop-blur-md shadow-[0_0_12px_rgba(56,189,248,0.15)]"
    >
      {{ eyebrow }}
    </span>

    <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white max-w-3xl leading-tight">
      {{ title }}
    </h2>

    <p
      v-if="subtitle"
      class="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed font-normal"
    >
      {{ subtitle }}
    </p>
  </div>
</template>
