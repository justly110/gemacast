<script setup lang="ts">
withDefaults(
  defineProps<{
    href: string
    variant?: 'primary' | 'secondary'
    external?: boolean
  }>(),
  { variant: 'primary', external: false },
)
</script>

<template>
  <a
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noreferrer' : undefined"
    class="flex items-center justify-center gap-x-2.5 rounded-2xl px-6 py-3 text-sm font-bold transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
    :class="
      variant === 'primary'
        ? 'bg-sky-400 text-slate-950 shadow-[0_0_24px_rgba(56,189,248,0.35)] hover:bg-sky-300 hover:shadow-[0_0_32px_rgba(56,189,248,0.5)]'
        : 'border border-white/15 bg-white/5 backdrop-blur-xl text-slate-200 hover:bg-white/10 hover:border-white/25 hover:text-white shadow-lg'
    "
  >
    <slot></slot>
  </a>
</template>
