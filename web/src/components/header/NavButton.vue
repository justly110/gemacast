<script setup lang="ts">
withDefaults(
  defineProps<{
    href?: string
    external?: boolean
  }>(),
  { href: undefined, external: false },
)
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :target="href && external ? '_blank' : undefined"
    :rel="href && external ? 'noreferrer' : undefined"
    class="flex items-center gap-x-1.5 rounded-xl border border-transparent px-3.5 py-1.5 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-white/10 hover:bg-white/10 hover:text-sky-400 active:scale-95 cursor-pointer whitespace-nowrap"
  >
    <slot></slot>
  </component>
</template>
