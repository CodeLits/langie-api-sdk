<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">
              <slot name="title">Modal Title</slot>
            </h2>
            <button
              class="modal-close"
              aria-label="Close modal"
              @click="$emit('update:modelValue', false)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="modal-content">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { Teleport } from 'vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])

const handleOverlayClick = () => {
  // Close modal when clicking overlay
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 800px;
  max-height: 80vh;
  width: 90vw;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dark .modal-container {
  background-color: #1f2937;
  color: #f9fafb;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1rem 0 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark .modal-header {
  border-bottom-color: #374151;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.dark .modal-title {
  color: #f9fafb;
}

.modal-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.modal-close:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.dark .modal-close {
  color: #9ca3af;
}

.dark .modal-close:hover {
  background-color: #374151;
  color: #d1d5db;
}

.modal-content {
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}

/* Container animation */
.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container {
  transform: scale(0.9);
}

.modal-leave-to .modal-container {
  transform: scale(0.9);
}

.modal-enter-to .modal-container,
.modal-leave-from .modal-container {
  transform: scale(1);
}
</style>
