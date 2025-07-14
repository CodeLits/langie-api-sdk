<template>
  <div
    v-if="showWarning"
    class="p-4 mb-4 text-sm rounded-lg flex items-start gap-2"
    :class="{
      'bg-red-100 text-red-700 dark:bg-red-200 dark:text-red-800':
        serviceStatus.includes('Offline'),
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-200 dark:text-yellow-800': rateLimited
    }"
    role="alert"
  >
    <XCircleIcon v-if="serviceStatus.includes('Offline')" class="w-6 h-6 mt-0.5 flex-shrink-0" />
    <ExclamationTriangleIcon v-else class="w-6 h-6 mt-0.5 flex-shrink-0" />
    <div>
      <span class="font-medium">
        <lt v-if="serviceStatus.includes('Offline')">API Offline</lt>
        <lt v-else>Rate Limit</lt>
      </span>
      <div class="mt-1">
        <lt v-if="serviceStatus.includes('Offline')">
          The translation service is currently offline. Using a fallback list of languages.
        </lt>
        <lt v-else>
          API rate limit may have been reached. Language list may be incomplete. Please wait a
          moment.
        </lt>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { XCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/solid'
import { lt } from '@/index'

const props = defineProps({
  serviceStatus: {
    type: String,
    required: true
  },
  rateLimited: {
    type: Boolean,
    required: true
  }
})

const showWarning = computed(() => {
  return props.serviceStatus.includes('Offline') || props.rateLimited
})
</script>
