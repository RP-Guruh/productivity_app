<template>
  <div class="board-card" @click="$emit('select', board.id)">
    <h3 class="board-card__name">{{ board.name }}</h3>
    <div class="board-card__meta">
      <span class="board-card__count">{{ board.taskCount }} tasks</span>
      <span class="board-card__percentage">{{ percentDone }}% selesai</span>
    </div>
    <div class="board-card__progress-container">
      <div class="board-card__progress-bar" :style="{ width: `${percentDone}%` }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  board: {
    type: Object,
    required: true
  }
})

defineEmits(['select'])

const percentDone = computed(() => {
  if (!props.board.taskCount) return 0
  return Math.round((props.board.doneCount / props.board.taskCount) * 100)
})
</script>

<style scoped>
.board-card {
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  cursor: pointer;
  box-shadow: var(--shadow-card);
  transition: all 150ms ease-out;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 140px;
}

.board-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
  border-color: var(--color-brand);
}

.board-card__name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 16px;
  line-height: 22px;
}

.board-card__meta {
  display: flex;
  justify-content: space-between;
  font-family: 'IBM Plex Mono', monospace;
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-bottom: 8px;
}

.board-card__progress-container {
  background-color: var(--color-border);
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  width: 100%;
}

.board-card__progress-bar {
  background-color: var(--color-brand);
  height: 100%;
  border-radius: 3px;
  transition: width 300ms ease-out;
}
</style>
