<script setup lang="ts">
import GemacastIcon from './GemacastIcon.vue'
import NavMenu from './NavMenu.vue'
</script>

<template>
  <header
    class="sticky top-0 z-50 flex h-18 w-full items-center justify-between border-b border-white/10 bg-[#080c14]/75 px-6 lg:px-12 backdrop-blur-2xl transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
  >
    <GemacastIcon />
    <NavMenu />
  </header>
</template>
