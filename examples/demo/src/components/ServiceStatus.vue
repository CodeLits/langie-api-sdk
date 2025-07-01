<template>
  <div class="flex flex-col gap-1">
    <div class="flex items-center gap-2">
      <span
        class="inline-block w-2 h-2 rounded-full"
        :class="{
          'bg-green-500': status === 'Online',
          'bg-yellow-400': status === 'Issues',
          'bg-red-500': status === 'Offline'
        }"
      ></span>
      <span class="text-sm font-medium">Service: {{ status }}</span>
    </div>
    <div v-if="usage" class="text-xs text-gray-500 dark:text-gray-400">
      Usage: {{ usage.used }} / {{ usage.limit }} ({{ usage.type }})
    </div>
    <div v-if="usage" class="text-xs text-gray-500 dark:text-gray-400">
      Chain: {{ usage.type === 'anonymous' ? 'frontend → api' : 'frontend → backend → api' }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps } from 'vue'

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
  }
})

const usage = ref(null)

async function fetchUsage() {
  try {
    const res = await fetch(`${props.apiHost}/limit`)
    if (res.ok) {
      usage.value = await res.json()
    }
  } catch (e) {
    usage.value = null
  }
}

onMounted(fetchUsage)

watch(() => props.refreshUsage, fetchUsage)
</script>
