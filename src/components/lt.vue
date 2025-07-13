<template>
  <transition name="fade" mode="out-in">
    <span :key="translated">{{ translated }}</span>
  </transition>
</template>

<script lang="ts" setup>
import { computed, useSlots, watch } from 'vue'
import { ref, nextTick } from 'vue'
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
    default: undefined
  },
  // Translation context shorthand
  ctx: {
    type: String,
    required: false,
    default: 'ui'
  },
  // Original language shorthand
  orig: {
    type: String,
    required: false,
    default: undefined
  }
})

const slots = useSlots()
const { lr, currentLanguage, uiTranslations, translations } = useLangie()

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

// Force component update when translations change
const forceUpdate = ref(0)
watch(
  [uiTranslations, translations],
  () => {
    // Small delay to ensure translations are cached before updating
    nextTick(() => {
      forceUpdate.value++
    })
  },
  { deep: true }
)

const translated = computed(() => {
  // To prevent SSR hydration mismatches in Nuxt, render the untranslated key on the server
  if (isNuxt.value && typeof window === 'undefined') {
    return keyStr.value
  }

  // Force reactivity by depending on currentLanguage and translation caches
  void currentLanguage.value
  void forceUpdate.value // Force recomputation when translations change
  // Access properties to create reactive dependencies
  const cacheKey = `${keyStr.value}|${props.ctx}`
  const cache = props.ctx === 'ui' ? uiTranslations : translations
  void cache[cacheKey] // This creates a reactive dependency

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
