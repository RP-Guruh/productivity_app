<template>
  <span :class="['app-badge', `app-badge--${type}`]">
    <slot></slot>
  </span>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'default' // 'default' | 'high' | 'medium' | 'low' | 'success'
  }
})
</script>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  font-family: 'IBM Plex Mono', monospace;
  font-size: var(--text-xs);
  font-weight: 500;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
}

.app-badge--default {
  background-color: var(--color-paper);
  color: var(--color-muted);
  border: 1px solid var(--color-border);
}

.app-badge--high {
  background-color: rgba(232, 86, 47, 0.1);
  color: var(--color-signal);
  border: 1px solid rgba(232, 86, 47, 0.2);
}

.app-badge--medium {
  background-color: rgba(184, 134, 11, 0.1);
  color: var(--color-warning);
  border: 1px solid rgba(184, 134, 11, 0.2);
}

.app-badge--low {
  background-color: rgba(118, 123, 148, 0.1);
  color: var(--color-muted);
  border: 1px solid var(--color-border);
}

.app-badge--success {
  background-color: rgba(47, 122, 93, 0.1);
  color: var(--color-success);
  border: 1px solid rgba(47, 122, 93, 0.2);
}
</style>
