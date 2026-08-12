<template>
  <div
    :class="['task-card', `task-card--priority-${task.priority}`]"
    @click="$emit('edit', task)"
  >
    <!-- Folded Dog-Ear Corner -->
    <div class="task-card__corner"></div>

    <h4 class="task-card__title">{{ task.title }}</h4>
    <p v-if="task.description" class="task-card__desc">{{ task.description }}</p>

    <div class="task-card__meta">
      <span class="task-card__date" v-if="task.dueDate">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        {{ formatDate(task.dueDate) }}
      </span>
      <span v-else class="task-card__date-empty"></span>
      <AppAvatar :name="assigneeName" :size="20" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppAvatar from '../common/AppAvatar.vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

defineEmits(['edit'])

const assigneeName = computed(() => {
  // Mock initials
  const names = ['Rian Anggoro', 'Sarah Utami', 'Budi Hartono', 'Dewi Lestari']
  return names[props.task.id % names.length]
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES']
  return `${date.getDate()} ${months[date.getMonth()]}`
}
</script>

<style scoped>
.task-card {
  position: relative;
  background-color: var(--color-panel);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  padding: 16px;
  cursor: pointer;
  transition: all 150ms ease-out;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid var(--color-border);
  /* Clip top-right corner by 14px */
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
  user-select: none;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

/* Dog-ear corner fold effect */
.task-card__corner {
  position: absolute;
  top: 0;
  right: 0;
  width: 14px;
  height: 14px;
  clip-path: polygon(0 0, 0 100%, 100% 100%);
  transition: background-color 150ms ease-out;
}

/* Priority colors for dog-ear */
.task-card--priority-tinggi .task-card__corner {
  background-color: var(--color-signal);
}
.task-card--priority-sedang .task-card__corner {
  background-color: var(--color-warning);
}
.task-card--priority-rendah .task-card__corner {
  background-color: var(--color-border);
}

.task-card__title {
  font-family: 'Inter', sans-serif;
  font-size: var(--text-md);
  font-weight: 500;
  color: var(--color-ink);
  padding-right: 12px; /* Prevent text overlap with dog ear */
}

.task-card__desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: 18px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.task-card__date {
  font-family: 'IBM Plex Mono', monospace;
  font-size: var(--text-xs);
  color: var(--color-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.task-card__date-empty {
  flex-grow: 1;
}

/* Styling during dragging class applied by vuedraggable */
.sortable-ghost {
  opacity: 0.4;
  transform: rotate(2deg);
}
</style>
