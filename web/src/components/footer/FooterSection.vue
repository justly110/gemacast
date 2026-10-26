<script setup lang="ts">
import { CodeIcon, DownloadIcon, ExternalLinkIcon, MailIcon, ScaleIcon } from "@lucide/vue";
import { links } from "@/core/links";

interface FooterLink {
  label: string;
  href: string;
  external: boolean;
}

const projectLinks: FooterLink[] = [
  { label: "GitHub 源码仓库", href: links.repo, external: true },
  { label: "最新发布版本", href: links.releases, external: true },
  { label: "反馈与建议", href: links.issues, external: true },
];

const pageLinks: FooterLink[] = [
  { label: "功能特性", href: "#features", external: false },
  { label: "实机演示", href: "#demo", external: false },
  { label: "客户端下载", href: "#download", external: false },
  { label: "常见问题", href: "#faq", external: false },
];
</script>

<template>
  <footer class="border-t border-white/10 bg-slate-950/80 backdrop-blur-2xl text-slate-400">
    <div
      class="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 md:flex-row md:justify-between lg:px-12"
    >
      <div class="flex flex-col gap-y-3.5 md:max-w-md">
        <div class="flex items-center gap-x-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-400/10">
            <img
              src="../../assets/images/logo.svg"
              width="24"
              height="24"
              alt="Gemacast"
              class="size-6 object-contain"
            />
          </div>
          <span class="text-xl font-black tracking-tight text-white">Gemacast</span>
        </div>
        <p class="text-xs leading-relaxed text-slate-400 sm:text-sm font-normal">
          通过 Wi-Fi、USB 网络共享或 ADB 线缆，将 PC 音频以数十毫秒级超低延迟实时串流至安卓手机。
        </p>
        <a
          :href="links.contact"
          class="flex w-fit items-center gap-x-2 text-xs text-slate-300 transition-colors hover:text-sky-400"
        >
          <MailIcon class="size-4 shrink-0 text-sky-400" />
          <span>echa.apriliyanto.dev@gmail.com</span>
        </a>
      </div>

      <nav class="grid grid-cols-2 gap-8 sm:gap-14">
        <div class="flex flex-col gap-y-3">
          <h3 class="text-xs font-bold uppercase tracking-[0.18em] text-white">
            项目与开源
          </h3>
          <ul class="flex flex-col gap-y-2.5">
            <li v-for="link in projectLinks" :key="link.label">
              <a
                :href="link.href"
                target="_blank"
                rel="noreferrer"
                class="flex items-center gap-x-1.5 text-xs text-slate-400 transition-colors hover:text-sky-400"
              >
                <span>{{ link.label }}</span>
                <ExternalLinkIcon class="size-3 shrink-0 opacity-70" />
              </a>
            </li>
          </ul>
        </div>

        <div class="flex flex-col gap-y-3">
          <h3 class="text-xs font-bold uppercase tracking-[0.18em] text-white">
            导航
          </h3>
          <ul class="flex flex-col gap-y-2.5">
            <li v-for="link in pageLinks" :key="link.label">
              <a
                :href="link.href"
                class="text-xs text-slate-400 transition-colors hover:text-sky-400"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <div class="border-t border-white/5 py-6">
      <div
        class="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 sm:flex-row sm:justify-between lg:px-12"
      >
        <div class="flex flex-col sm:flex-row items-center gap-x-4 text-xs text-slate-500">
          <span>原作者 Echa Apriliyanto · 由 justly110 汉化与维护</span>
          <div class="flex items-center gap-x-1 text-slate-400">
            <ScaleIcon class="size-3.5"/>
            <a href="https://github.com/justly110/gemacast" target="_blank" class="hover:underline">GPL 3.0 开源协议</a>
          </div>
        </div>
        <div class="flex items-center gap-x-2.5">
          <a
            :href="links.releases"
            target="_blank"
            rel="noreferrer"
            class="flex items-center gap-x-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-white"
          >
            <DownloadIcon class="size-3.5" />
            <span>发布版本</span>
          </a>
          <a
            :href="links.repo"
            target="_blank"
            rel="noreferrer"
            class="flex items-center gap-x-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-white"
          >
            <CodeIcon class="size-3.5" />
            <span>代码仓库</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
