<script setup lang="ts">
import { MonitorIcon, SmartphoneIcon, UsbIcon, WifiIcon } from '@lucide/vue'
</script>

<template>
  <div class="relative flex flex-row items-center gap-x-4 sm:gap-x-10 rounded-3xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
    {/* 电脑端 */}
    <div class="relative flex flex-col items-center">
      <div class="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-sky-400 backdrop-blur-md shadow-[0_0_20px_rgba(56,189,248,0.2)]">
        <MonitorIcon class="size-10 sm:size-12" />
        <div
          class="font-mono absolute inset-x-1 bottom-2 flex flex-col items-center justify-center text-sky-200 text-[0.6rem] leading-none font-semibold pointer-events-none"
        >
          <span>48 kHz</span>
        </div>
      </div>
      <span class="mt-2 text-xs font-semibold text-slate-400">电脑端 (推流)</span>
    </div>

    {/* 传输信道 */}
    <div class="flex flex-col items-center gap-y-1.5">
      <div class="flex flex-row items-center justify-center gap-x-3 text-sky-400">
        <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-400/10 border border-sky-400/20">
          <WifiIcon class="size-4" />
        </div>
        <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-400/10 border border-teal-400/20 text-teal-400">
          <UsbIcon class="size-4" />
        </div>
      </div>

      <div class="relative flex items-center justify-center py-1">
        <div class="h-0.5 w-20 sm:w-28 bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
        <div class="absolute h-2 w-2 rounded-full bg-white shadow-[0_0_10px_#fff] animate-ping" />
      </div>

      <span class="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[11px] font-bold text-slate-300">
        &lt; 30 ms
      </span>
    </div>

    {/* 手机端 */}
    <div class="relative flex flex-col items-center">
      <div class="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl border border-teal-400/30 bg-teal-400/10 text-teal-400 backdrop-blur-md shadow-[0_0_20px_rgba(45,212,191,0.2)]">
        <SmartphoneIcon class="size-10 sm:size-12" />
        <div
          class="font-mono absolute inset-x-1 bottom-2 flex flex-col items-center justify-center text-teal-200 text-[0.6rem] leading-none font-semibold pointer-events-none"
        >
          <span>接收播放</span>
        </div>
      </div>
      <span class="mt-2 text-xs font-semibold text-slate-400">手机端 (扬声器)</span>
    </div>
  </div>
</template>
