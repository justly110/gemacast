<script setup lang="ts">
import type { Component } from 'vue'
import { MonitorIcon } from '@lucide/vue'
import { links } from '@/core/links'
import ActionButton from '@/components/shared/ActionButton.vue'
import AppleLogo from '@/components/shared/AppleLogo.vue'
import LinuxLogo from '@/components/shared/LinuxLogo.vue'
import WindowsLogo from '@/components/shared/WindowsLogo.vue'

interface Platform {
  icon: Component
  name: string
  requirement: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel: string
  secondaryHref: string
}

const platforms: Platform[] = [
  {
    icon: WindowsLogo,
    name: 'Windows',
    requirement: 'Windows 10 或更高版本 (WASAPI 采集)',
    primaryLabel: '安装包 (.msi)',
    primaryHref: links.windowsInstaller,
    secondaryLabel: '免安装便携版 (.zip)',
    secondaryHref: links.windowsPortable,
  },
  {
    icon: LinuxLogo,
    name: 'Linux',
    requirement: '需要运行 PipeWire 0.3+ / WirePlumber',
    primaryLabel: '归档包 (.tar.xz)',
    primaryHref: links.linuxArchive,
    secondaryLabel: 'deb / rpm / AppImage',
    secondaryHref: links.releases,
  },
  {
    icon: AppleLogo,
    name: 'macOS',
    requirement: 'macOS 13 或更高 (ScreenCaptureKit)',
    primaryLabel: '通用安装包 (.dmg)',
    primaryHref: links.macosDmg,
    secondaryLabel: '更多架构与版本',
    secondaryHref: links.releases,
  },
]
</script>

<template>
  <article class="flex flex-col rounded-3xl border border-white/10 bg-slate-900/45 backdrop-blur-2xl shadow-2xl overflow-hidden">
    <header
      class="flex items-center gap-x-3.5 border-b border-white/10 bg-white/5 px-6 py-4.5"
    >
      <span class="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
        <MonitorIcon class="size-5" />
      </span>
      <div class="flex flex-col">
        <h3 class="text-lg font-bold text-white tracking-tight sm:text-xl">电脑端 Streamer</h3>
        <p class="text-xs font-medium text-slate-400">常驻系统托盘，捕获桌面或应用音频</p>
      </div>
    </header>

    <ul class="flex grow flex-col divide-y divide-white/10">
      <li
        v-for="platform in platforms"
        :key="platform.name"
        class="flex grow flex-col gap-3.5 p-6"
      >
        <div class="flex items-center gap-x-3">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-sky-400">
            <component :is="platform.icon" class="size-4.5" />
          </div>
          <div class="flex min-w-0 flex-col">
            <h4 class="text-sm font-bold text-white tracking-tight">{{ platform.name }}</h4>
            <p class="text-xs text-slate-400">{{ platform.requirement }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-1">
          <ActionButton :href="platform.primaryHref" external>
            <span>{{ platform.primaryLabel }}</span>
          </ActionButton>
          <ActionButton :href="platform.secondaryHref" variant="secondary" external>
            <span>{{ platform.secondaryLabel }}</span>
          </ActionButton>
        </div>
      </li>
    </ul>
  </article>
</template>
