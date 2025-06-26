<template>
  <!-- Only render on client-side if we're in Nuxt -->
  <ClientOnly v-if="isNuxt">
    <transition name="fade" mode="out-in">
      <span :key="translated">{{ translated }}</span>
    </transition>
  </ClientOnly>
  <!-- Render normally for other frameworks -->
  <transition v-else name="fade" mode="out-in">
    <span :key="translated">{{ translated }}</span>
  </transition>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { computed, useSlots } from 'vue'
import { useTranslator } from '../useTranslator'

// Detect if we're running in Nuxt
const isNuxt = computed(() => {
  if (typeof window !== 'undefined') {
    return !!(window as any).__NUXT__
  }
  if (typeof process !== 'undefined') {
    return !!(process.env as any).NUXT_SSR_BASE || !!(process.env as any).NUXT_PUBLIC_BASE_URL
  }
  return false
})

const props = defineProps({
  // Message key (optional, otherwise slot content is used)
  msg: {
    type: String,
    default: ''
  },
  // Translation context shorthand
  ctx: {
    type: String,
    required: false
  },
  // Original language shorthand
  orig: {
    type: String,
    required: false
  }
})

const slots = useSlots()
const { l } = useTranslator()

const keyStr = computed(() => {
  if (props.msg) return props.msg
  const slotContent = slots.default
    ? slots
        .default()
        .map((n) => n.children)
        .join('')
    : ''
  return (slotContent || '').trim()
})

const translated = computed(() => {
  // To prevent SSR hydration mismatches, render the untranslated key on the server.
  if (typeof window === 'undefined') return keyStr.value

  // For Nuxt, ensure we're on client-side before translating
  if (isNuxt.value && typeof window === 'undefined') {
    return keyStr.value
  }

  return l(keyStr.value, props.ctx, props.orig)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
