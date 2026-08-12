<template>
  <div class="app-avatar" :title="name" :style="avatarStyle">
    {{ initials }}
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 32
  }
})

const sizePx = computed(() => {
  if (typeof props.size === 'number') return props.size
  switch (props.size) {
    case 'xs': return 20
    case 'sm': return 32
    case 'md': return 40
    case 'lg': return 48
    case 'xl': return 64
    default: return parseInt(props.size) || 32
  }
})

const initials = computed(() => {
  if (!props.name) return ''
  const parts = props.name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
})

const avatarStyle = computed(() => ({
  width: `${sizePx.value}px`,
  height: `${sizePx.value}px`,
  fontSize: `${sizePx.value * 0.45}px`,
  minWidth: `${sizePx.value}px`,
  minHeight: `${sizePx.value}px`
}))
</script>

<style scoped>
.app-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--color-brand);
  color: var(--color-panel);
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 500;
  user-select: none;
  flex-shrink: 0;
}
</style>
