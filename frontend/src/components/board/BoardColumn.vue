<template>
  <div :class="['board-column', { 'board-column--success': column.accent === 'success' || column.name.toLowerCase() === 'selesai' }]">
    <!-- Header -->
    <div class="board-column__header">
      <div v-if="isEditingName" class="board-column__title-edit">
        <input
          v-model="editedName"
          class="board-column__title-input"
          @keydown.enter="saveName"
          @keydown.esc="cancelEdit"
          @blur="saveName"
          ref="nameInputRef"
        />
      </div>
      <div v-else class="board-column__title-wrapper">
        <h3 class="board-column__title" @click="startEdit" title="Klik untuk mengubah nama kolom">
          {{ column.name }}
        </h3>
        <button class="board-column__delete-btn" @click.stop="confirmDelete" title="Hapus Kolom">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
      <span class="board-column__count">{{ column.tasks.length }}</span>
    </div>

    <!-- Draggable Task Cards list -->
    <draggable
      :list="column.tasks"
      group="tasks"
      item-key="id"
      class="board-column__tasks-list"
      ghost-class="sortable-ghost"
      drag-class="sortable-drag"
      :animation="200"
      @change="onDragChange"
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
import { ref, nextTick } from 'vue'
import draggable from 'vuedraggable'
import TaskCard from './TaskCard.vue'

const props = defineProps({
  column: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['add-task', 'edit-task', 'task-moved', 'update-column', 'delete-column'])

const onDragChange = (evt) => {
  emit('task-moved', { columnId: props.column.id, event: evt })
}

const confirmDelete = () => {
  if (confirm(`Apakah Anda yakin ingin menghapus kolom "${props.column.name}"?`)) {
    emit('delete-column', props.column.id)
  }
}

const isEditingName = ref(false)
const editedName = ref('')
const nameInputRef = ref(null)

const startEdit = () => {
  editedName.value = props.column.name
  isEditingName.value = true
  nextTick(() => {
    nameInputRef.value?.focus()
  })
}

const cancelEdit = () => {
  isEditingName.value = false
}

const saveName = () => {
  if (!isEditingName.value) return
  if (editedName.value.trim() && editedName.value.trim() !== props.column.name) {
    emit('update-column', {
      columnId: props.column.id,
      name: editedName.value.trim(),
      position: props.column.position
    })
  }
  isEditingName.value = false
}
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
  cursor: grab;
}

.board-column:active {
  cursor: grabbing;
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
  cursor: inherit;
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  transition: background-color 150ms ease;
}

.board-column__title:hover {
  background-color: rgba(27, 31, 59, 0.05);
}

.board-column__title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-grow: 1;
}

.board-column__delete-btn {
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
  opacity: 0;
}

.board-column__header:hover .board-column__delete-btn {
  opacity: 1;
}

.board-column__delete-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.board-column__title-edit {
  flex-grow: 1;
  margin-right: 8px;
}

.board-column__title-input {
  width: 100%;
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-ink);
  background: transparent;
  border: 1px solid var(--color-brand);
  border-radius: var(--radius-sm);
  padding: 2px 4px;
  outline: none;
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

.board-column__tasks-list :deep(.sortable-ghost) {
  opacity: 0.25 !important;
  background-color: var(--color-border) !important;
  border: 1px dashed var(--color-muted) !important;
}

.board-column__tasks-list :deep(.sortable-drag) {
  opacity: 0.95 !important;
  transform: rotate(2.5deg) scale(1.03) !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1) !important;
  cursor: grabbing !important;
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
