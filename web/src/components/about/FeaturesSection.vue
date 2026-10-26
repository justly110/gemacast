<script setup lang="ts">
import type { Component } from 'vue'
import {
  ActivityIcon,
  CableIcon,
  LayersIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  TabletSmartphoneIcon,
} from '@lucide/vue'
import SectionHeading from '@/components/shared/SectionHeading.vue'
import FeatureCard from './FeatureCard.vue'

interface Feature {
  icon: Component
  title: string
  body: string
  tag: string
}

const features: Feature[] = [
  {
    icon: TabletSmartphoneIcon,
    title: '多设备协同串流',
    body: '支持多部手机同时连接同一台电脑。每部设备均可独立设置其音源捕获与音频码率质量。',
    tag: '多端独立音频通道',
  },
  {
    icon: CableIcon,
    title: '三种灵活连接方式',
    body: '局域网 Wi-Fi、USB 共享网络或 ADB 开发者数据线。随时在手机端无缝切换。',
    tag: 'Wi-Fi / USB / ADB',
  },
  {
    icon: ActivityIcon,
    title: '自适应智能抗抖动缓冲',
    body: '内置高精度 NetEQ 自适应 Jitter Buffer，随网络波动毫秒级动态调优，亦支持完全手动配置。',
    tag: '动态深度感知',
  },
  {
    icon: ShieldCheckIcon,
    title: 'ECDSA 双向安全配对',
    body: '首次连接在双端展示 6 位校验码并经 Android Keystore 签名授权，杜绝局域网恶意窃听与中继。',
    tag: 'TLS + 证书指纹绑定',
  },
  {
    icon: LayersIcon,
    title: '整机系统声或单应用捕获',
    body: '选择串流 PC 的整机全部声音，或单独指定特定游戏、播放器进程。流媒体中途可随时切换。',
    tag: '按进程独立捕获',
  },
  {
    icon: SlidersHorizontalIcon,
    title: '多档音质与低延迟模式',
    body: '涵盖 10 至 512 kbps 的 Opus 纯低延迟编码，亦支持 48kHz 无损 raw PCM 音频流。',
    tag: '10 ~ 512 kbps 或未压缩',
  },
]

const specs: string[] = ['48 kHz 立体声', '10 ms 超短帧周期', 'Opus 低延迟 / 无损 PCM']
</script>

<template>
  <section
    id="features"
    class="flex flex-col items-center justify-center gap-y-12 px-4 py-20 sm:px-6 sm:py-24 lg:px-10"
  >
    <SectionHeading
      eyebrow="核心功能"
      title="卓越的跨屏音频体验"
      subtitle="为超低延迟与稳定音质而生，全平台开箱即用。"
    />

    <ul class="grid w-full max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      <FeatureCard
        v-for="feature in features"
        :key="feature.title"
        :icon="feature.icon"
        :title="feature.title"
        :body="feature.body"
        :tag="feature.tag"
      />
    </ul>

    <ul
      class="flex w-full max-w-6xl flex-col divide-y divide-white/10 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl sm:flex-row sm:divide-x sm:divide-y-0 overflow-hidden shadow-lg"
    >
      <li
        v-for="spec in specs"
        :key="spec"
        class="font-mono flex-1 px-4 py-3.5 text-center text-xs font-bold text-slate-300 sm:text-sm"
      >
        {{ spec }}
      </li>
    </ul>
  </section>
</template>
