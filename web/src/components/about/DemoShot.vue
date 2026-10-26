<script setup lang="ts">
defineProps<{
  src: string
  alt: string
  label: string
  caption: string
  width: number
  height: number
  tall?: boolean
}>()
</script>

<template>
  <figure class="flex flex-col rounded-3xl border border-white/10 bg-slate-900/45 backdrop-blur-xl shadow-xl overflow-hidden transition-all duration-300 hover:border-sky-400/30">
    <figcaption
      class="flex items-center gap-x-2.5 border-b border-white/10 bg-white/5 px-4 py-3"
    >
      <span class="size-2 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf] shrink-0"></span>
      <span class="text-xs font-bold uppercase tracking-wider text-slate-300">
        {{ label }}
      </span>
    </figcaption>

    <div class="flex grow items-center justify-center bg-black/20 p-4 sm:p-5">
      <img
        :src="src"
        :alt="alt"
        :width="width"
        :height="height"
        loading="lazy"
        decoding="async"
        class="w-auto max-w-full rounded-2xl border border-white/10 object-contain shadow-md"
        :class="tall ? 'max-h-[78vh] sm:max-h-[60vh]' : 'max-h-56 sm:max-h-64'"
      />
    </div>

    <p
      class="border-t border-white/10 px-4 py-3.5 text-xs font-medium leading-relaxed text-slate-400 sm:text-sm"
    >
      {{ caption }}
    </p>
  </figure>
</template>
