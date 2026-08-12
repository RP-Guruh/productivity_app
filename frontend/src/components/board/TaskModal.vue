<template>
  <AppModal :is-open="isOpen" :title="isEdit ? 'Edit Task' : 'Tambah Task'" @close="$emit('close')">
    <div class="task-form">
      <!-- Title Input (Borderless/large look) -->
      <div class="title-group">
        <input
          type="text"
          v-model="form.title"
          placeholder="Judul task..."
          class="title-input"
          ref="titleInputRef"
        />
      </div>

      <!-- Description Input -->
      <AppInput
        type="textarea"
        label="Deskripsi"
        v-model="form.description"
        placeholder="Tambahkan penjelasan detail mengenai task ini..."
      />

      <!-- Priority Chips Selection -->
      <div class="priority-selection">
        <label class="section-label">Prioritas</label>
        <div class="priority-chips">
          <button
            type="button"
            v-for="p in priorities"
            :key="p.value"
            :class="['priority-chip', `priority-chip--${p.value}`, { 'is-active': form.priority === p.value }]"
            @click="form.priority = p.value"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <!-- Deadline Date Picker -->
      <div class="date-selection">
        <label class="section-label">Deadline</label>
        <input
          type="date"
          v-model="form.dueDate"
          class="date-input"
        />
      </div>
    </div>

    <template #footer>
      <div class="footer-actions">
        <AppButton
          v-if="isEdit"
          variant="danger"
          @click="$emit('delete', form.id)"
          class="delete-btn"
        >
          Hapus Task
        </AppButton>
        <div class="right-actions">
          <AppButton variant="secondary" @click="$emit('close')">Batal</AppButton>
          <AppButton variant="primary" @click="save">Simpan</AppButton>
        </div>
      </div>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import AppModal from '../common/AppModal.vue'
import AppInput from '../common/AppInput.vue'
import AppButton from '../common/AppButton.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  task: {
    type: Object,
    default: null
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save', 'delete'])

const titleInputRef = ref(null)

const priorities = [
  { value: 'rendah', label: 'Rendah' },
  { value: 'sedang', label: 'Sedang' },
  { value: 'tinggi', label: 'Tinggi' }
]

const form = reactive({
  id: null,
  title: '',
  description: '',
  priority: 'rendah',
  dueDate: ''
})

watch(() => props.isOpen, (open) => {
  if (open) {
    if (props.task) {
      form.id = props.task.id
      form.title = props.task.title || ''
      form.description = props.task.description || ''
      form.priority = props.task.priority || 'rendah'
      form.dueDate = props.task.dueDate || ''
    } else {
      form.id = null
      form.title = ''
      form.description = ''
      form.priority = 'rendah'
      form.dueDate = ''
    }
    nextTick(() => {
      if (titleInputRef.value) {
        titleInputRef.value.focus()
      }
    })
  }
})

const save = () => {
  if (!form.title.trim()) return
  emit('save', { ...form })
}
</script>

<style scoped>
.task-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title-group {
  width: 100%;
}

.title-input {
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-ink);
  border: none;
  border-bottom: 2px solid transparent;
  padding: 4px 0;
  width: 100%;
  transition: border-bottom-color 150ms ease-out;
}

.title-input:focus {
  outline: none;
  border-bottom-color: var(--color-brand);
}

.section-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-ink);
  margin-bottom: 6px;
  display: block;
}

.priority-chips {
  display: flex;
  gap: 10px;
}

.priority-chip {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background-color: var(--color-panel);
  font-family: 'Inter', sans-serif;
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease-out;
  color: var(--color-muted);
}

.priority-chip--rendah.is-active {
  background-color: var(--color-paper);
  color: var(--color-ink);
  border-color: var(--color-muted);
}

.priority-chip--sedang.is-active {
  background-color: rgba(184, 134, 11, 0.1);
  color: var(--color-warning);
  border-color: var(--color-warning);
}

.priority-chip--tinggi.is-active {
  background-color: rgba(232, 86, 47, 0.1);
  color: var(--color-signal);
  border-color: var(--color-signal);
}

.date-input {
  font-family: 'Inter', sans-serif;
  font-size: var(--text-base);
  color: var(--color-ink);
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  width: 100%;
}

.date-input:focus {
  outline: none;
  border-color: var(--color-brand);
}

.footer-actions {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}

.right-actions {
  display: flex;
  gap: 12px;
}
</style>
