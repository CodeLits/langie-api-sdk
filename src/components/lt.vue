<template>
  <transition name="fade" mode="out-in">
    <span :key="translated">{{ translated }}</span>
  </transition>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { computed, useSlots } from 'vue'
import { useTranslator } from '../useTranslator'

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
