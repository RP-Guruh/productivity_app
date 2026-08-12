<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <!-- Minimalist drawing of paths/lists -->
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
      </svg>
    </div>
    <h4 class="empty-state__title">{{ title }}</h4>
    <p class="empty-state__description">{{ description }}</p>
    <div v-if="actionLabel" class="empty-state__action">
      <slot name="action">
        <AppButton @click="$emit('action')">{{ actionLabel }}</AppButton>
      </slot>
    </div>
  </div>
</template>

<script setup>
import AppButton from './AppButton.vue'

defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  actionLabel: {
    type: String,
    default: ''
  }
})

defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
  background-color: var(--color-panel);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  max-width: 480px;
  margin: 0 auto;
}

.empty-state__icon {
  color: var(--color-muted);
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-state__title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 8px;
}

.empty-state__description {
  font-size: var(--text-base);
  color: var(--color-muted);
  margin-bottom: 24px;
  max-width: 320px;
  line-height: 22px;
}

.empty-state__action {
  display: flex;
  justify-content: center;
}
</style>
