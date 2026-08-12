<template>
  <div :class="['board-column', { 'board-column--success': column.accent === 'success' || column.name.toLowerCase() === 'selesai' }]">
    <!-- Header -->
    <div class="board-column__header">
      <h3 class="board-column__title">{{ column.name }}</h3>
      <span class="board-column__count">{{ column.tasks.length }}</span>
    </div>

    <!-- Draggable Task Cards list -->
    <draggable
      :list="column.tasks"
      group="tasks"
      item-key="id"
      class="board-column__tasks-list"
      ghost-class="sortable-ghost"
      @change="$emit('task-moved')"
    >
      <template #item="{ element }">
        <TaskCard :task="element" @edit="$emit('edit-task', element)" />
      </template>
    </draggable>

    <!-- Add Task Button -->
    <button class="board-column__add-btn" @click="$emit('add-task', column.id)">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      Tambah task
    </button>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable'
import TaskCard from './TaskCard.vue'

defineProps({
  column: {
    type: Object,
    required: true
  }
})

defineEmits(['add-task', 'edit-task', 'task-moved'])
</script>

<style scoped>
.board-column {
  display: flex;
  flex-direction: column;
  background-color: var(--color-paper);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  width: 300px;
  min-width: 300px;
  max-height: 100%;
  padding: 16px;
  box-shadow: var(--shadow-card);
  transition: border-top-color 150ms ease-out;
}

.board-column--success {
  border-top: 4px solid var(--color-success);
}

.board-column__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.board-column__title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-ink);
}

.board-column__count {
  font-family: 'IBM Plex Mono', monospace;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-muted);
  background-color: var(--color-border);
  padding: 2px 8px;
  border-radius: 999px;
  line-height: 1;
}

.board-column__tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
  overflow-y: auto;
  min-height: 100px;
  padding-bottom: 12px;
}

.board-column__add-btn {
  background: none;
  border: none;
  font-family: 'Inter', sans-serif;
  font-size: var(--text-sm);
  color: var(--color-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: var(--radius-md);
  transition: all 150ms ease-out;
  margin-top: 8px;
  width: 100%;
}

.board-column__add-btn:hover {
  color: var(--color-brand);
  background-color: rgba(62, 76, 138, 0.05);
}
</style>
