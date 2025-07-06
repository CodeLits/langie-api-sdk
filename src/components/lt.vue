<template>
  <transition name="fade" mode="out-in">
    <span :key="translated">{{ translated }}</span>
  </transition>
</template>

<script lang="ts" setup>
import { computed, useSlots } from 'vue'
import { useLangie } from '../useLangie'

// Define component name for better debugging
defineOptions({
  name: 'LangieTranslate'
})

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
const { lr, currentLanguage } = useLangie()

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
  // To prevent SSR hydration mismatches in Nuxt, render the untranslated key on the server
  if (isNuxt.value && typeof window === 'undefined') {
    return keyStr.value
  }

  // Force reactivity by depending on currentLanguage
  void currentLanguage.value

  // For other frameworks, always translate
  const result = lr(keyStr.value, props.ctx, props.orig)
  return result
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
