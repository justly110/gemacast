<script setup lang="ts">
import { CodeIcon, DownloadIcon } from '@lucide/vue'
import { links } from '@/core/links'
import ActionButton from '@/components/shared/ActionButton.vue'
</script>

<template>
  <div class="flex w-full flex-col items-center gap-y-4">
    <div class="flex w-full max-w-md flex-col gap-3.5 px-4 sm:w-auto sm:flex-row sm:px-0">
      <ActionButton href="#download">
        <DownloadIcon class="size-4" />
        <span>立即下载</span>
      </ActionButton>
      <ActionButton :href="links.repo" variant="secondary" external>
        <CodeIcon class="size-4" />
        <span>查看源码</span>
      </ActionButton>
    </div>

    <p class="font-mono text-center text-xs text-slate-500">自由开源 · GPL-3.0 协议</p>
  </div>
</template>
