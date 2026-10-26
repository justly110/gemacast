<script setup lang="ts">
import { CodeIcon, DownloadIcon } from '@lucide/vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { links } from '@/core/links'
import NavButton from './NavButton.vue'

const isMenuOpen = defineModel<boolean>()

const { isDesktop } = useBreakpoint('(min-width: 768px)')

const closeOnMobile = () => {
  if (!isDesktop.value) {
    isMenuOpen.value = false
  }
}
</script>

<template>
  <ul
    class="flex flex-col gap-1.5 absolute top-full right-0 mt-3 min-w-48 p-2 rounded-2xl border border-white/15 bg-slate-900/90 backdrop-blur-2xl shadow-2xl transition-all duration-200 md:mt-0 md:static md:min-w-0 md:flex-row md:border-0 md:bg-transparent md:p-0 md:shadow-none"
    :class="{
      'opacity-0 invisible pointer-events-none md:opacity-100 md:visible md:pointer-events-auto': !isMenuOpen,
      'opacity-100 visible pointer-events-auto': isMenuOpen,
    }"
  >
    <li>
      <NavButton href="#features" class="w-full" @click="closeOnMobile">
        <span>功能特性</span>
      </NavButton>
    </li>

    <li>
      <NavButton href="#demo" class="w-full" @click="closeOnMobile">
        <span>演示</span>
      </NavButton>
    </li>

    <li>
      <NavButton href="#download" class="w-full text-sky-400 hover:text-sky-300" @click="closeOnMobile">
        <span>下载</span>
        <DownloadIcon class="size-4" />
      </NavButton>
    </li>

    <li>
      <NavButton :href="links.repo" external class="w-full border-sky-400/20 bg-sky-400/10 text-sky-400 hover:bg-sky-400/20" @click="closeOnMobile">
        <span>源码仓库</span>
        <CodeIcon class="size-4" />
      </NavButton>
    </li>
  </ul>
</template>
