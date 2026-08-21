<template>
  <div class="app-input-group">
    <label v-if="label" class="app-input-label">{{ label }}</label>
    <input
      v-if="type !== 'textarea'"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="app-input"
      v-bind="$attrs"
    />
    <textarea
      v-else
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="app-textarea"
      v-bind="$attrs"
    ></textarea>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.app-input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.app-input-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-ink);
}

.app-input, .app-textarea {
  font-family: 'Inter', sans-serif;
  font-size: var(--text-base);
  color: var(--color-ink);
  background-color: var(--color-paper);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  transition: border-color 150ms ease-out;
  width: 100%;
}

.app-input:focus, .app-textarea:focus {
  outline: none;
  border-color: var(--color-brand);
}

.app-textarea {
  resize: vertical;
  min-height: 100px;
}
</style>
