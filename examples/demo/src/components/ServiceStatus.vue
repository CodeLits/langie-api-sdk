<template>
  <div class="flex flex-col gap-1">
    <div class="flex items-center gap-2">
      <span
        class="inline-block w-2 h-2 rounded-full"
        :class="{
          'bg-green-500 animate-pulse': status === 'Online',
          'bg-yellow-400': status === 'Issues',
          'bg-red-500': status === 'Offline'
        }"
      ></span>
      <span class="text-sm font-medium">Service: {{ status }}</span>
    </div>
    <div v-if="usage" class="text-xs flex items-center gap-1" :class="usageClass">
      Usage: {{ usage.used }} / {{ usage.limit }} ({{ usage.type }})
      <div class="relative group">
        <svg
          class="w-3 h-3 cursor-help"
          :class="usageIconClass"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clip-rule="evenodd"
          />
        </svg>
        <div
          class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs bg-gray-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10"
        >
          <div>
            Chain: {{ usage.type === 'anonymous' ? 'frontend → api' : 'frontend → backend → api' }}
          </div>
          <div v-if="usage?.next_reset_at">
            Next reset at: {{ new Date(usage.next_reset_at).toLocaleString() }}
          </div>
          <div>{{ props.apiHost }}</div>
        </div>
      </div>
    </div>
    <div v-if="props.isLimitReached" class="text-xs text-red-500 dark:text-red-400">
      ⚠️ {{ limitReachedMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, defineProps, computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  refreshUsage: {
    type: Number,
    default: 0
  },
  apiHost: {
    type: String,
    required: true
  },
  isLimitReached: {
    type: Boolean,
    default: false
  }
})

const usage = ref(null)

const usageClass = computed(() => {
  if (!usage.value) return 'text-gray-500 dark:text-gray-400'
  if (usage.value.used >= usage.value.limit) return 'text-red-500 dark:text-red-400'
  if (usage.value.used >= usage.value.limit * 0.8) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-gray-500 dark:text-gray-400'
})

const usageIconClass = computed(() => {
  if (!usage.value) return 'text-gray-400'
  if (usage.value.used >= usage.value.limit) return 'text-red-400'
  if (usage.value.used >= usage.value.limit * 0.8) return 'text-yellow-400'
  return 'text-gray-400'
})

const limitReachedMessage = computed(() => {
  if (usage.value && usage.value.used >= usage.value.limit) {
    const resetTime = usage.value?.next_reset_at
      ? ` until ${new Date(usage.value.next_reset_at).toLocaleString()}`
      : ''
    return `Usage limit exceeded${resetTime}`
  }
  return 'Rate limit reached (429 Too Many Requests)'
})

async function fetchUsage() {
  try {
    // Note: /limit endpoint should NOT increase usage count
    const res = await fetch(`${props.apiHost}/limit`)
    if (res.ok) {
      usage.value = await res.json()
    } else if (res.status === 429) {
      usage.value = null
    }
  } catch (e) {
    usage.value = null
  }
}

watch(() => props.refreshUsage, fetchUsage)

// Auto-refresh usage every 30 seconds
let usageInterval
onMounted(() => {
  fetchUsage()
  usageInterval = setInterval(fetchUsage, 30000)
})

onUnmounted(() => {
  if (usageInterval) {
    clearInterval(usageInterval)
  }
})
</script>
