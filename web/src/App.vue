<script setup lang="ts">
import LandingView from './views/LandingView.vue'
</script>

<template>
  <div class="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
    {/* 极光背景漫射光晕层 */}
    <div
      aria-hidden="true"
      class="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-50"
    >
      <div
        class="absolute -top-[10%] left-[10%] h-[600px] w-[600px] rounded-full blur-[140px] animate-[aurora-1_22s_ease-in-out_infinite]"
        style="background: radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 75%);"
      />
      <div
        class="absolute top-[35%] -right-[10%] h-[700px] w-[700px] rounded-full blur-[160px] animate-[aurora-2_26s_ease-in-out_infinite]"
        style="background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.12) 55%, transparent 75%);"
      />
      <div
        class="absolute -bottom-[10%] left-[25%] h-[650px] w-[650px] rounded-full blur-[130px] animate-[aurora-3_24s_ease-in-out_infinite]"
        style="background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(6, 182, 212, 0.1) 60%, transparent 80%);"
      />
      <div class="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px]" />
    </div>

    {/* 主页面内容 */}
    <div class="relative z-10 flex min-h-screen flex-col">
      <LandingView />
    </div>
  </div>
</template>
