<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'

const props = defineProps<{
  question: string
  answer: string
  isOpen: boolean
}>()

const emit = defineEmits<{ toggle: [] }>()

const panelId = `faq-panel-${props.question.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
</script>

<template>
  <li class="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md overflow-hidden transition-all duration-200 hover:border-sky-400/30">
    <h3>
      <button
        type="button"
        class="flex w-full cursor-pointer items-center justify-between gap-x-3 px-5 py-4 text-left text-sm sm:text-base font-bold text-white transition-colors hover:bg-white/5"
        :class="{ 'bg-white/5': isOpen }"
        :aria-expanded="isOpen"
        :aria-controls="panelId"
        @click="emit('toggle')"
      >
        <span>{{ question }}</span>
        <div class="flex h-7 w-7 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-sky-400">
          <PlusIcon
            class="size-4 shrink-0 transition-transform duration-300"
            :class="isOpen ? 'rotate-45 text-rose-400' : 'rotate-0'"
          />
        </div>
      </button>
    </h3>

    <p
      v-show="isOpen"
      :id="panelId"
      class="border-t border-white/10 px-5 py-4 text-xs sm:text-sm leading-relaxed text-slate-400 font-normal bg-black/20"
    >
      {{ answer }}
    </p>
  </li>
</template>
