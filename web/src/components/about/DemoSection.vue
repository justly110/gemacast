<script setup lang="ts">
import mobileSettingView from '@/assets/images/mobile-setting-view.jpeg'
import mobileStreamDemo from '@/assets/images/mobile-stream-adb-demo.gif'
import pcSystemTray from '@/assets/images/pc-system-tray.png'
import SectionHeading from '@/components/shared/SectionHeading.vue'
import DemoShot from './DemoShot.vue'

interface Step {
  title: string
  body: string
}

const steps: Step[] = [
  {
    title: '安装双端应用程序',
    body: '电脑端常驻系统托盘，手机端安装专用 APK。',
  },
  {
    title: '连接至同一局域网',
    body: '支持家庭 Wi-Fi、USB 网络共享或 ADB 调试线缆。',
  },
  {
    title: '连接并核对 6 位配对码',
    body: '双屏比对一致后点击确认，永久信任该设备。',
  },
  {
    title: '选择音源即刻收听',
    body: '支持捕获电脑整机声音或单独指定的应用/游戏。',
  },
]
</script>

<template>
  <section
    id="demo"
    class="flex flex-col items-center justify-center gap-y-12 px-4 py-20 sm:px-6 sm:py-24 lg:px-10"
  >
    <SectionHeading
      eyebrow="实机演示"
      title="超低延迟，眼耳同步"
      subtitle="手机端实时展示缓冲深度、往返延迟 (RTT) 与网络抖动。"
    />

    <div
      class="grid w-full max-w-6xl grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3"
    >
      <DemoShot
        :src="mobileStreamDemo"
        :width="576"
        :height="1296"
        tall
        label="手机端 / 播放中"
        alt="Gemacast 手机端播放界面"
        caption="实时指标、已配对电脑、当前音源与播放控制。"
      />

      <DemoShot
        :src="mobileSettingView"
        :width="575"
        :height="1280"
        tall
        label="手机端 / 现代设置抽屉"
        alt="Gemacast 手机端设置界面"
        caption="缓冲预设、Opus 码率、音量增益与 Wi-Fi/USB/ADB 模式切换。"
      />

      <div class="flex flex-col gap-5 md:col-span-2 md:flex-row lg:col-span-1 lg:flex-col">
        <DemoShot
          class="md:flex-1 lg:flex-none"
          :src="pcSystemTray"
          :width="861"
          :height="421"
          label="电脑端 / 托盘控制器"
          alt="Gemacast PC 系统托盘菜单"
          caption="展示已连接手机设备、推流启停控制、开机自启与更新。"
        />

        <ol
          class="flex grow flex-col divide-y divide-white/10 rounded-3xl border border-white/10 bg-slate-900/45 p-2 backdrop-blur-xl shadow-xl md:flex-1 lg:flex-none"
        >
          <li
            v-for="(step, index) in steps"
            :key="step.title"
            class="flex grow items-start gap-x-3.5 p-4"
          >
            <span
              class="flex size-7 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-400/10 text-xs font-bold font-mono text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]"
            >
              {{ index + 1 }}
            </span>
            <div class="flex flex-col gap-y-1">
              <h3 class="text-sm font-bold text-white tracking-tight">{{ step.title }}</h3>
              <p class="text-xs leading-relaxed text-slate-400">
                {{ step.body }}
              </p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
