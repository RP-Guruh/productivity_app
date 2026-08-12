<template>
  <button
    :class="['app-button', `app-button--${variant}`, `app-button--${size}`]"
    v-bind="$attrs"
  >
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary' // 'primary' | 'secondary' | 'ghost' | 'danger'
  },
  size: {
    type: String,
    default: 'md' // 'sm' | 'md'
  }
})
</script>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  border-radius: var(--radius-md);
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 150ms ease-out;
  white-space: nowrap;
}

.app-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sizes */
.app-button--sm {
  padding: 6px 12px;
  font-size: var(--text-sm);
}

.app-button--md {
  padding: 10px 18px;
  font-size: var(--text-base);
}

/* Variants */
.app-button--primary {
  background-color: var(--color-brand);
  color: var(--color-panel);
}

.app-button--primary:hover:not(:disabled) {
  background-color: var(--color-brand-dark);
}

.app-button--secondary {
  background-color: var(--color-panel);
  border-color: var(--color-border);
  color: var(--color-ink);
  box-shadow: var(--shadow-card);
}

.app-button--secondary:hover:not(:disabled) {
  background-color: var(--color-paper);
}

.app-button--ghost {
  background-color: transparent;
  color: var(--color-muted);
}

.app-button--ghost:hover:not(:disabled) {
  color: var(--color-ink);
  background-color: rgba(27, 31, 59, 0.04);
}

.app-button--danger {
  background-color: transparent;
  color: var(--color-signal);
}

.app-button--danger:hover:not(:disabled) {
  background-color: rgba(232, 86, 47, 0.06);
}
</style>
