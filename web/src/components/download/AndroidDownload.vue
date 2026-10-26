<script setup lang="ts">
import { CodeIcon } from '@lucide/vue'
import { links } from '@/core/links'
import ActionButton from '@/components/shared/ActionButton.vue'
import AndroidLogo from '@/components/shared/AndroidLogo.vue'

const details: string[] = [
  'Android 8.0 (API 26) 或更高版本',
  '支持 Wi-Fi 局域网、USB 网络共享与 ADB 调试',
  'Oboe 低延迟音频输出与自适应抗抖动'
]
</script>

<template>
  <article class="flex flex-col rounded-3xl border border-white/10 bg-slate-900/45 backdrop-blur-2xl shadow-2xl overflow-hidden">
    <header
      class="flex items-center gap-x-3.5 border-b border-white/10 bg-white/5 px-6 py-4.5"
    >
      <span class="flex h-10 w-10 items-center justify-center rounded-2xl border border-teal-400/30 bg-teal-400/10 text-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.2)]">
        <AndroidLogo class="size-5" />
      </span>
      <div class="flex flex-col">
        <h3 class="text-lg font-bold text-white tracking-tight sm:text-xl">手机端 Player</h3>
        <p class="text-xs font-medium text-slate-400">接收音频并在手机扬声器/耳机播放</p>
      </div>
    </header>

    <div class="flex flex-col gap-5 p-6 grow justify-between">
      <ul class="flex flex-col gap-y-2.5">
        <li
          v-for="detail in details"
          :key="detail"
          class="flex items-center gap-x-2.5 text-xs text-slate-300 sm:text-sm font-medium"
        >
          <span class="size-1.5 rounded-full bg-teal-400 shadow-[0_0_6px_#2dd4bf] shrink-0" />
          <span>{{ detail }}</span>
        </li>
      </ul>

      <div class="flex flex-col gap-2.5 pt-4 border-t border-white/10">
        <ActionButton :href="links.androidApk" external>
          <AndroidLogo class="size-4" />
          <span>下载 Android 安装包 (.apk)</span>
        </ActionButton>
        <ActionButton :href="links.repo" variant="secondary" external>
          <CodeIcon class="size-4" />
          <span>浏览开源代码</span>
        </ActionButton>
      </div>
    </div>
  </article>
</template>
