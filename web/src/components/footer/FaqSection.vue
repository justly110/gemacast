<script setup lang="ts">
import { useAccordion } from '@/composables/useAccordion'
import SectionHeading from '@/components/shared/SectionHeading.vue'
import FaqItem from './FaqItem.vue'

interface Question {
  id: string
  question: string
  answer: string
}

const questions: Question[] = [
  {
    id: 'discovery',
    question: '手机端无法搜索到我的电脑？',
    answer:
      '请确保电脑和手机连接在同一 Wi-Fi 下（访客网络或 VPN 可能会隔离设备）。电脑防火墙需放行 Gemacast 的通信端口：UDP 23555（设备发现）、UDP 23556（音频数据流）以及 TCP 23559（控制通道）。首次运行时 Windows 防火墙弹窗若被关闭可能导致拦截。',
  },
  {
    id: 'latency',
    question: '真实的端到端声音延迟是多少？',
    answer:
      '端到端总延迟主要由三部分构成：电脑音频采集（约 10ms）、单程网络传输延迟（约 RTT 的一半）以及手机端音频缓冲深度。在 USB 网络共享或 ADB 模式下，整体延迟通常在 20~30 毫秒以内，眼耳几乎无感。',
  },
  {
    id: 'dtim',
    question: '手机息屏后缓冲区会增大到 200ms 以上？',
    answer:
      '这是 Android 系统的省电策略（DTIM 机制）。息屏后 Wi-Fi 芯片会进入间歇休眠并以 100~200ms 批量接收数据。应用会自动扩大缓冲区以防止破音断续。若追求极致低延迟，可在设置中开启“保持屏幕常亮”，或改用 USB/ADB 数据线直连。',
  },
  {
    id: 'pairing',
    question: '为什么初次连接需要配对授权？',
    answer:
      '为了保护您的电脑隐私与安全。若无配对，局域网内的任何设备都能随意拉取您的电脑声音或查看运行中的应用进程。配对只需在电脑托盘弹窗确认一次，之后手机即可秒连。',
  },
  {
    id: 'code',
    question: '6 位配对验证码是做什么用的？',
    answer:
      '用于防止局域网中间人中继攻击（Relay Attack）。双端独立计算由设备证书、硬件公钥和随机挑战派生出的配对码。只需确认电脑与手机屏幕展示的 6 位数字一致即可放心点击通过。',
  },
  {
    id: 'encryption',
    question: '传输的音频流是否经过加密？',
    answer:
      '设备配对与控制命令信道使用 TLS 强加密与 ECDSA-P256 签名保护。而高频的音频数据包（每秒 100 包）保持明文传输，这是为了杜绝加解密造成的延迟和数据包膨胀，确保超低延迟体验。建议在受信任的网络或通过数据线使用。',
  },
]

const { isOpen, toggle } = useAccordion()
</script>

<template>
  <section
    id="faq"
    class="flex flex-col items-center justify-center gap-y-12 px-4 py-20 sm:px-6 sm:py-24 lg:px-10"
  >
    <SectionHeading eyebrow="常见疑问" title="解答您的各种疑惑" />

    <ul class="flex w-full max-w-3xl flex-col gap-y-3.5">
      <FaqItem
        v-for="entry in questions"
        :key="entry.id"
        :question="entry.question"
        :answer="entry.answer"
        :is-open="isOpen(entry.id)"
        @toggle="toggle(entry.id)"
      />
    </ul>
  </section>
</template>
