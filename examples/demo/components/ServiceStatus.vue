<template>
  <div class="flex items-center gap-2">
    <span
      class="px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1"
      :class="{
        'bg-green-100 text-green-800': status.includes('Online'),
        'bg-yellow-100 text-yellow-800': status.includes('Issues'),
        'bg-red-100 text-red-800': status.includes('Offline')
      }"
    >
      <component :is="statusIcon" class="w-4 h-4" />
      {{ statusText }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const statusIcon = computed(() => {
  if (props.status.includes('Online')) return CheckCircleIcon
  if (props.status.includes('Issues')) return ExclamationTriangleIcon
  return XCircleIcon
})

const statusText = computed(() => {
  if (props.status.includes('Online')) return 'Online'
  if (props.status.includes('Issues')) return 'Issues'
  return 'Offline'
})
</script>
