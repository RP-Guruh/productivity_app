<template>
  <div class="notes-dashboard" :class="{ 'mobile-editor-active': isMobileEditing && selectedNote }">
    <!-- Sidebar / Notes List -->
    <div class="notes-sidebar">
      <div class="sidebar-top">
        <div class="search-box">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Cari catatan..." 
            class="search-input"
          />
        </div>
        <button class="add-btn" @click="createNewNote" title="Buat Catatan Baru">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Baru
        </button>
      </div>

      <!-- Tag Filters -->
      <div class="tag-filters">
        <button 
          :class="['tag-filter-chip', { 'is-active': activeTagFilter === 'All' }]" 
          @click="activeTagFilter = 'All'"
        >
          Semua
        </button>
        <div 
          v-for="tag in allTags" 
          :key="tag" 
          :class="['tag-filter-chip-wrapper', { 'is-active': activeTagFilter === tag }]"
        >
          <span class="tag-filter-chip-label" @click="activeTagFilter = tag">#{{ tag }}</span>
          <div class="tag-chip-actions">
            <button class="tag-chip-action-btn edit-tag-btn" @click.stop="startEditTag(tag)" title="Edit tag secara global">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="tag-chip-action-btn delete-tag-btn" @click.stop="confirmDeleteTagGlobally(tag)" title="Hapus tag secara global">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Notes list -->
      <div class="notes-list-scroll">
        <div v-if="filteredNotes.length === 0" class="empty-list-state">
          <span class="empty-icon">📂</span>
          <p>Tidak ada catatan ditemukan</p>
        </div>
        <div 
          v-else
          v-for="note in filteredNotes" 
          :key="note.id"
          :class="['note-item-card', { 'is-active': selectedNoteId === note.id }]"
          @style="{ borderLeftColor: note.color }"
          @click="selectNote(note.id)"
        >
          <div class="note-card-header">
            <div class="note-color-badge" :style="{ backgroundColor: note.color }"></div>
            <span class="note-date">{{ note.updatedAt }}</span>
            <button class="delete-btn" @click.stop="confirmDeleteNote(note)" title="Hapus catatan">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
          <h4 class="note-card-title">{{ note.title || 'Tanpa Judul' }}</h4>
          <p class="note-card-excerpt">{{ getExcerpt(note.content) }}</p>
          <div class="note-card-tags" v-if="note.tags && note.tags.length">
            <span v-for="t in note.tags" :key="t" class="note-card-tag">#{{ t }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor Workspace -->
    <div class="editor-workspace">
      <div v-if="selectedNote" class="editor-container">
        <!-- Editor Header -->
        <div class="editor-header">
          <button class="back-list-btn mobile-only" @click="isMobileEditing = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Daftar
          </button>

          <input 
            type="text" 
            v-model="selectedNote.title" 
            class="editor-title-input" 
            placeholder="Judul Catatan..." 
            @input="updateTimestamp"
          />

          <!-- View Mode Toggles -->
          <div class="view-mode-toggles">
            <button 
              :class="['mode-btn', { 'is-active': viewMode === 'edit' }]" 
              @click="viewMode = 'edit'"
              title="Edit Mode"
            >
              Edit
            </button>
            <button 
              :class="['mode-btn', { 'is-active': viewMode === 'split' }]" 
              @click="viewMode = 'split'"
              class="desktop-only"
              title="Split View"
            >
              Split
            </button>
            <button 
              :class="['mode-btn', { 'is-active': viewMode === 'preview' }]" 
              @click="viewMode = 'preview'"
              title="Preview Mode"
            >
              Preview
            </button>
          </div>
        </div>

        <!-- Meta Row (Tags & Color) -->
        <div class="meta-row">
          <div class="meta-tags-section">
            <div class="tags-label-row">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="tag-meta-icon"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              <span class="tags-label">Tags:</span>
            </div>
            <div class="tags-container">
              <!-- Active Tag Chips -->
              <span v-for="tag in selectedNote.tags" :key="tag" class="active-tag-chip">
                #{{ tag }}
                <button class="remove-tag-btn" @click="removeTag(tag)" title="Hapus tag">×</button>
              </span>
              
              <!-- Add Tag Input / Button -->
              <div class="add-tag-box">
                <button v-if="!showNewTagInput" class="add-tag-trigger-btn" @click="showNewTagInput = true">
                  + Tambah Tag
                </button>
                <div v-else class="new-tag-input-wrapper">
                  <input 
                    type="text" 
                    v-model="newTagValue" 
                    placeholder="Nama tag..." 
                    class="new-tag-field"
                    @keyup.enter="addNewTag"
                    @blur="handleTagBlur"
                    ref="newTagInputRef"
                  />
                  <button class="save-tag-btn" @mousedown.prevent="addNewTag">Simpan</button>
                </div>
              </div>
            </div>
          </div>

          <div class="color-picker-row">
            <span class="color-label">Warna:</span>
            <div class="color-palette">
              <button 
                v-for="c in colorPalette" 
                :key="c.value" 
                :style="{ backgroundColor: c.value }"
                :class="['color-dot', { 'is-selected': selectedNote.color === c.value }]"
                @click="selectedNote.color = c.value"
                :title="c.name"
              ></button>
            </div>
          </div>
        </div>

        <!-- Markdown Formatting Toolbar (Only in edit/split mode) -->
        <div class="editor-toolbar" v-if="viewMode !== 'preview'">
          <button class="toolbar-btn" @click="insertMarkdown('bold')" title="Tebal (Ctrl+B)">
            <strong>B</strong>
          </button>
          <button class="toolbar-btn" @click="insertMarkdown('italic')" title="Miring (Ctrl+I)">
            <em>I</em>
          </button>
          <div class="toolbar-divider"></div>
          <button class="toolbar-btn" @click="insertMarkdown('h1')" title="Heading 1">H1</button>
          <button class="toolbar-btn" @click="insertMarkdown('h2')" title="Heading 2">H2</button>
          <button class="toolbar-btn" @click="insertMarkdown('h3')" title="Heading 3">H3</button>
          <div class="toolbar-divider"></div>
          <button class="toolbar-btn" @click="insertMarkdown('ul')" title="Unordered List">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
          </button>
          <button class="toolbar-btn" @click="insertMarkdown('ol')" title="Ordered List">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
          </button>
          <button class="toolbar-btn" @click="insertMarkdown('todo')" title="Task List">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="9 11 12 14 22 4"></polyline></svg>
          </button>
          <div class="toolbar-divider"></div>
          <button class="toolbar-btn" @click="insertMarkdown('code')" title="Code Block">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
          </button>
          <button class="toolbar-btn" @click="insertMarkdown('quote')" title="Blockquote">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </button>
          <button class="toolbar-btn" @click="insertMarkdown('link')" title="Link">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          </button>
          <div class="toolbar-divider"></div>
          <button class="toolbar-btn help-btn" @click="isHelpOpen = !isHelpOpen" title="Markdown Guide">
            ? Helper
          </button>
        </div>

        <!-- Markdown cheat sheet helper pane -->
        <div class="help-drawer animate-fade-in" v-if="isHelpOpen">
          <div class="help-drawer-header">
            <h5>Panduan Markdown</h5>
            <button class="close-help-btn" @click="isHelpOpen = false">×</button>
          </div>
          <div class="help-drawer-body">
            <table class="help-table">
              <tr><td><strong>Tebal</strong></td><td><code>**teks**</code></td></tr>
              <tr><td><em>Miring</em></td><td><code>*teks*</code></td></tr>
              <tr><td><h1>Judul 1</h1></td><td><code># Judul</code></td></tr>
              <tr><td><h2>Judul 2</h2></td><td><code>## Judul</code></td></tr>
              <tr><td>List Bullet</td><td><code>- Item</code></td></tr>
              <tr><td>List Angka</td><td><code>1. Item</code></td></tr>
              <tr><td>Task List</td><td><code>- [ ] Task</code></td></tr>
              <tr><td>Code Block</td><td><code>```js ... ```</code></td></tr>
              <tr><td>Kutipan</td><td><code>> Kutipan</code></td></tr>
              <tr><td>Link</td><td><code>[Nama](https://...)</code></td></tr>
            </table>
          </div>
        </div>

        <!-- Split / Text / Preview Area -->
        <div class="workspace-body" :class="`view-${viewMode}`">
          <!-- Textarea Editor -->
          <div class="textarea-wrapper" v-show="viewMode === 'edit' || viewMode === 'split'">
            <textarea 
              ref="textareaRef"
              v-model="selectedNote.content" 
              class="editor-textarea" 
              placeholder="Mulai menulis catatan Anda di sini dengan Markdown..."
              @input="updateTimestamp"
              @keydown="handleTextareaKey"
            ></textarea>
          </div>

          <!-- Live Preview Renderer -->
          <div 
            class="markdown-preview markdown-body" 
            v-show="viewMode === 'preview' || viewMode === 'split'"
            v-html="renderedMarkdown"
          ></div>
        </div>

        <!-- Editor Footer -->
        <div class="editor-footer">
          <div class="footer-stats">
            <span>{{ charCount }} Karakter</span>
            <span>•</span>
            <span>{{ wordCount }} Kata</span>
          </div>
          <div class="save-status">
            <span class="save-icon">✓</span> Terupdate otomatis ke Local
          </div>
        </div>
      </div>

      <!-- Editor Empty State -->
      <div v-else class="editor-empty-state">
        <span class="empty-icon">📝</span>
        <h3>Pilih atau Buat Catatan Baru</h3>
        <p>Gunakan catatan cepat untuk menyimpan ide, draf teks, atau checklist pekerjaan Anda. Mendukung sintaks Markdown.</p>
        <button class="create-first-btn" @click="createNewNote">+ Buat Catatan Baru</button>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div class="confirm-modal-overlay" v-if="noteToDelete">
      <div class="confirm-modal">
        <h3>Hapus Catatan?</h3>
        <p>Apakah Anda yakin ingin menghapus catatan <strong>"{{ noteToDelete.title || 'Tanpa Judul' }}"</strong>? Tindakan ini tidak dapat dibatalkan.</p>
        <div class="confirm-modal-actions">
          <button class="confirm-cancel-btn" @click="noteToDelete = null">Batal</button>
          <button class="confirm-delete-btn" @click="deleteNote">Hapus</button>
        </div>
      </div>
    </div>

    <!-- Edit Tag Modal -->
    <div class="confirm-modal-overlay" v-if="tagToEdit">
      <div class="confirm-modal">
        <h3>Edit Nama Tag</h3>
        <p>Ubah nama tag <strong>#{{ tagToEdit }}</strong> di semua catatan.</p>
        <div class="modal-input-wrapper" style="margin: 16px 0;">
          <input 
            type="text" 
            v-model="editTagNewValue" 
            class="modal-text-input" 
            placeholder="Nama tag baru..." 
            @keyup.enter="renameTagGlobally"
            style="width: 100%; padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background-color: var(--color-panel); color: var(--color-ink);"
          />
        </div>
        <div class="confirm-modal-actions">
          <button class="confirm-cancel-btn" @click="tagToEdit = null">Batal</button>
          <button class="confirm-delete-btn" style="background-color: var(--color-brand);" :disabled="!editTagNewValue.trim() || editTagNewValue.trim() === tagToEdit" @click="renameTagGlobally">Simpan</button>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Tag Modal -->
    <div class="confirm-modal-overlay" v-if="tagToDelete">
      <div class="confirm-modal">
        <h3>Hapus Tag secara Global?</h3>
        <p>Apakah Anda yakin ingin menghapus tag <strong>#{{ tagToDelete }}</strong> dari semua catatan? Catatan itu sendiri tidak akan dihapus.</p>
        <div class="confirm-modal-actions">
          <button class="confirm-cancel-btn" @click="tagToDelete = null">Batal</button>
          <button class="confirm-delete-btn" @click="deleteTagGlobally">Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { marked } from 'marked'

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true
})

// Mock Palette
const colorPalette = [
  { name: 'Default', value: '#767B94' },
  { name: 'Mint Green', value: '#2F7A5D' },
  { name: 'Warm Orange', value: '#E8562F' },
  { name: 'Golden Yellow', value: '#B8860B' },
  { name: 'Ocean Blue', value: '#3E4C8A' },
  { name: 'Lilac Purple', value: '#7b2cbf' }
]

// Note template
const DEFAULT_NOTES = [
  {
    id: 'n1',
    title: '📝 Panduan Penggunaan Markdown',
    content: `# Selamat datang di Quick Notes!

Catatan cepat ini mendukung **Markdown** secara penuh. Berikut adalah beberapa contoh pemformatan yang bisa Anda gunakan:

## 1. Pemformatan Teks
* Gunakan **teks tebal** untuk memberikan penekanan yang kuat.
* Gunakan *teks miring* untuk catatan ringan.
* Anda juga dapat menggabungkan keduanya seperti ***tebal dan miring***.

## 2. Checklist / Tugas Harian
- [x] Selesaikan integrasi UI/UX RSS Feed
- [x] Implementasikan Markdown Editor untuk Quick Notes
- [ ] Lakukan ujicoba responsive design di mobile device
- [ ] Hubungkan API dengan server backend

## 3. Kutipan
> "Produktivitas bukanlah tentang melakukan lebih banyak hal, melainkan tentang menyelesaikan hal yang paling penting dengan kualitas terbaik."

## 4. Blok Kode
\`\`\`javascript
// Contoh penulisan fungsi sederhana
function sapaPengguna(nama) {
  console.log(\`Halo, \${nama}! Selamat produktif.\`);
}
sapaPengguna('TaskFlow AI User');
\`\`\`

Silakan edit catatan ini atau buat catatan baru di menu sebelah kiri!`,
    tags: ['Panduan', 'Tugas'],
    color: '#3E4C8A',
    updatedAt: '17 Agu 2026, 12:00'
  },
  {
    id: 'n2',
    title: '💡 Ide Rilis Fitur Baru',
    content: `# Rencana Pengembangan TaskFlow AI - Q3

Berikut ide fitur produktivitas tambahan yang akan dibuat di kuartal berikutnya:

### A. RSS Feed Hub
Mendukung pembaca berita internal agar user tidak perlu keluar dari workspace untuk membaca update tech terkini.
* Fitur Bookmark artikel
* Auto-save artikel terpilih langsung menjadi catatan baru di Quick Notes (Done! 🚀)
* Folder pengelompokan feed

### B. Widget Pomodoro Timer
Timer terintegrasi di pojok kanan atas layar dengan alarm suara alam penenang pikiran.`,
    tags: ['Ide', 'Rencana'],
    color: '#E8562F',
    updatedAt: '17 Agu 2026, 11:15'
  },
  {
    id: 'n3',
    title: '🛒 Belanja Kebutuhan Kantor',
    content: `# Daftar Belanjaan Bulan Ini

Catatan logistik bulanan tim:
- [x] Kopi Biji Arabika Premium (2 Pack)
- [ ] Sticky Notes warna-warni (3 Set)
- [ ] Kabel Type-C Braided 2 Meter (2 Pcs)
- [ ] Whiteboard Cleaner & Marker Baru (1 Set)

*Catatan: Pastikan minta struk / invoice resmi untuk reimbursement ke tim finance.*`,
    tags: ['Belanja', 'Logistik'],
    color: '#B8860B',
    updatedAt: '16 Agu 2026, 18:30'
  }
]

// State variables
const notes = ref([])
const selectedNoteId = ref(null)
const searchQuery = ref('')
const activeTagFilter = ref('All')
const viewMode = ref('edit') // 'edit', 'split', 'preview'
const tagsInputString = ref('')
const isHelpOpen = ref(false)
const isMobileEditing = ref(false) // Toggle state on mobile devices
const textareaRef = ref(null)
const noteToDelete = ref(null)

// Tag Manager state
const showNewTagInput = ref(false)
const newTagValue = ref('')
const newTagInputRef = ref(null)

const tagToEdit = ref(null)
const editTagNewValue = ref('')
const tagToDelete = ref(null)

// Computed active note object
const selectedNote = computed(() => {
  return notes.value.find(n => n.id === selectedNoteId.value) || null
})

// Rendered Markdown HTML
const renderedMarkdown = computed(() => {
  if (!selectedNote.value || !selectedNote.value.content) return '<p class="empty-preview">Catatan kosong</p>'
  try {
    return marked(selectedNote.value.content)
  } catch (err) {
    return `<div class="error-preview">Gagal merender Markdown: ${err.message}</div>`
  }
})

// Extract list of all unique tags from notes
const allTags = computed(() => {
  const tagsSet = new Set()
  notes.value.forEach(note => {
    if (note.tags) {
      note.tags.forEach(t => tagsSet.add(t))
    }
  })
  return Array.from(tagsSet)
})

// Filtered notes list based on search query and active tag
const filteredNotes = computed(() => {
  return notes.value.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesTag = 
      activeTagFilter.value === 'All' || 
      (note.tags && note.tags.includes(activeTagFilter.value))
      
    return matchesSearch && matchesTag
  }).sort((a, b) => {
    // Sort by latest update (simulated by simple sorting or text parsing, but since it's mock we can just sort by id descending)
    return b.updatedAt.localeCompare(a.updatedAt)
  })
})

// Excerpt helper
const getExcerpt = (content) => {
  if (!content) return 'Catatan kosong'
  // Remove markdown headings and symbols for clean preview
  const cleanText = content
    .replace(/[#*`>_\-[\]]/g, '')
    .trim()
  return cleanText.length > 80 ? cleanText.substring(0, 80) + '...' : cleanText || 'Catatan kosong'
}

// Character and Word counter
const charCount = computed(() => {
  return selectedNote.value?.content?.length || 0
})

const wordCount = computed(() => {
  if (!selectedNote.value?.content) return 0
  const words = selectedNote.value.content.trim().split(/\s+/)
  return words.filter(w => w.length > 0).length
})

// Sync tags string from selected note
watch(selectedNoteId, (newId) => {
  if (newId) {
    const note = notes.value.find(n => n.id === newId)
    if (note) {
      tagsInputString.value = note.tags ? note.tags.join(', ') : ''
    }
  } else {
    tagsInputString.value = ''
  }
})

// Load notes from localStorage on mount
onMounted(() => {
  const localData = localStorage.getItem('taskflow_quick_notes')
  if (localData) {
    try {
      notes.value = JSON.parse(localData)
    } catch (e) {
      notes.value = [...DEFAULT_NOTES]
    }
  } else {
    notes.value = [...DEFAULT_NOTES]
    saveToLocalStorage()
  }

  // Select first note by default
  if (notes.value.length > 0) {
    selectedNoteId.value = notes.value[0].id
  }
})

// Save to localStorage
const saveToLocalStorage = () => {
  localStorage.setItem('taskflow_quick_notes', JSON.stringify(notes.value))
}

// Watch notes deeply and save automatically
watch(notes, () => {
  saveToLocalStorage()
}, { deep: true })

// Selection handler
const selectNote = (id) => {
  selectedNoteId.value = id
  isMobileEditing.value = true // Activate editor on mobile
}

// Create new note
const createNewNote = () => {
  const newId = 'n_' + Date.now()
  const now = new Date()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const newNote = {
    id: newId,
    title: 'Catatan Baru',
    content: '# Catatan Baru\n\nMulai tulis catatan penting Anda di sini...',
    tags: [],
    color: colorPalette[Math.floor(Math.random() * colorPalette.length)].value,
    updatedAt: dateStr
  }

  notes.value.unshift(newNote)
  selectedNoteId.value = newId
  isMobileEditing.value = true

  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus()
    }
  })
}

// Confirm delete note
const confirmDeleteNote = (note) => {
  noteToDelete.value = note
}

// Delete note
const deleteNote = () => {
  if (!noteToDelete.value) return
  const idToDelete = noteToDelete.value.id
  notes.value = notes.value.filter(n => n.id !== idToDelete)
  
  if (selectedNoteId.value === idToDelete) {
    selectedNoteId.value = notes.value.length > 0 ? notes.value[0].id : null
    isMobileEditing.value = false
  }
  noteToDelete.value = null
}

// Update note timestamp
const updateTimestamp = () => {
  if (!selectedNote.value) return
  const now = new Date()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  selectedNote.value.updatedAt = dateStr
}

// Parse tags input
const parseTags = () => {
  if (!selectedNote.value) return
  if (!tagsInputString.value.trim()) {
    selectedNote.value.tags = []
    return
  }
  const cleanTags = tagsInputString.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0)
  
  selectedNote.value.tags = Array.from(new Set(cleanTags))
}

const removeTag = (tagToRemove) => {
  if (!selectedNote.value) return
  selectedNote.value.tags = selectedNote.value.tags.filter(t => t !== tagToRemove)
  updateTimestamp()
}

const addNewTag = () => {
  if (!selectedNote.value || !newTagValue.value.trim()) return
  const tag = newTagValue.value.trim().replace(/#/g, '')
  if (!selectedNote.value.tags) {
    selectedNote.value.tags = []
  }
  if (!selectedNote.value.tags.includes(tag)) {
    selectedNote.value.tags.push(tag)
    updateTimestamp()
  }
  newTagValue.value = ''
  showNewTagInput.value = false
}

const handleTagBlur = () => {
  setTimeout(() => {
    showNewTagInput.value = false
    newTagValue.value = ''
  }, 150)
}

const startEditTag = (tag) => {
  tagToEdit.value = tag
  editTagNewValue.value = tag
}

const renameTagGlobally = () => {
  const oldTag = tagToEdit.value
  const newTag = editTagNewValue.value.trim().replace(/#/g, '')
  if (!oldTag || !newTag || oldTag === newTag) {
    tagToEdit.value = null
    return
  }

  notes.value.forEach(note => {
    if (note.tags && note.tags.includes(oldTag)) {
      const updatedTags = note.tags.map(t => t === oldTag ? newTag : t)
      note.tags = Array.from(new Set(updatedTags))
    }
  })

  if (activeTagFilter.value === oldTag) {
    activeTagFilter.value = newTag
  }

  saveToLocalStorage()
  tagToEdit.value = null
}

const confirmDeleteTagGlobally = (tag) => {
  tagToDelete.value = tag
}

const deleteTagGlobally = () => {
  const tag = tagToDelete.value
  if (!tag) return

  notes.value.forEach(note => {
    if (note.tags) {
      note.tags = note.tags.filter(t => t !== tag)
    }
  })

  if (activeTagFilter.value === tag) {
    activeTagFilter.value = 'All'
  }

  saveToLocalStorage()
  tagToDelete.value = null
}

watch(showNewTagInput, (val) => {
  if (val) {
    nextTick(() => {
      if (newTagInputRef.value) {
        newTagInputRef.value.focus()
      }
    })
  }
})

// Textarea shortcut key listener
const handleTextareaKey = (e) => {
  // Command or Control + Key shortcuts
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
    if (e.key === 'b') {
      e.preventDefault()
      insertMarkdown('bold')
    } else if (e.key === 'i') {
      e.preventDefault()
      insertMarkdown('italic')
    }
  }
}

// Insert Markdown helper
const insertMarkdown = (syntax) => {
  const textarea = textareaRef.value
  if (!textarea || !selectedNote.value) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = selectedNote.value.content
  const selectedText = text.substring(start, end)
  
  let replacement = ''
  let cursorOffset = 0
  
  switch(syntax) {
    case 'bold':
      replacement = `**${selectedText || 'teks tebal'}**`
      cursorOffset = selectedText ? replacement.length : 2
      break
    case 'italic':
      replacement = `*${selectedText || 'teks miring'}*`
      cursorOffset = selectedText ? replacement.length : 1
      break
    case 'h1':
      replacement = `\n# ${selectedText || 'Heading 1'}\n`
      cursorOffset = replacement.length
      break
    case 'h2':
      replacement = `\n## ${selectedText || 'Heading 2'}\n`
      cursorOffset = replacement.length
      break
    case 'h3':
      replacement = `\n### ${selectedText || 'Heading 3'}\n`
      cursorOffset = replacement.length
      break
    case 'ul':
      replacement = `\n- ${selectedText || 'List item'}`
      cursorOffset = replacement.length
      break
    case 'ol':
      replacement = `\n1. ${selectedText || 'List item'}`
      cursorOffset = replacement.length
      break
    case 'todo':
      replacement = `\n- [ ] ${selectedText || 'Tugas baru'}`
      cursorOffset = replacement.length
      break
    case 'code':
      replacement = `\n\`\`\`javascript\n${selectedText || '// Tulis kode di sini'}\n\`\`\`\n`
      cursorOffset = replacement.length - 4
      break
    case 'quote':
      replacement = `\n> ${selectedText || 'Kutipan teks'}\n`
      cursorOffset = replacement.length
      break
    case 'link':
      replacement = `[${selectedText || 'Teks Link'}](https://example.com)`
      cursorOffset = selectedText ? replacement.length : 1
      break
  }
  
  selectedNote.value.content = text.substring(0, start) + replacement + text.substring(end)
  updateTimestamp()
  
  // Refocus and place selection cursor back
  nextTick(() => {
    textarea.focus()
    const newCursorPos = start + (selectedText ? replacement.length : cursorOffset)
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  })
}

// Function to expose for saving notes from external triggers (like RSS copy)
const addNoteExternally = (title, content, tags) => {
  const newId = 'n_' + Date.now()
  const now = new Date()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const newNote = {
    id: newId,
    title: title,
    content: content,
    tags: tags || ['RSS'],
    color: '#2F7A5D', // Mint green for external notes
    updatedAt: dateStr
  }

  notes.value.unshift(newNote)
  selectedNoteId.value = newId
  saveToLocalStorage()
}

// Expose the external method so parents or other modules can call it
defineExpose({
  addNoteExternally
})
</script>

<style scoped>
.notes-dashboard {
  display: flex;
  height: calc(100vh - 80px); /* Adjust based on top header */
  width: 100%;
  background-color: var(--color-paper);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

/* Sidebar Notes List */
.notes-sidebar {
  width: 320px;
  min-width: 320px;
  background-color: var(--color-panel);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.3s ease;
}

.sidebar-top {
  padding: 16px;
  display: flex;
  gap: 10px;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
}

.search-box {
  flex-grow: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--color-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 8px 10px 8px 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-paper);
  color: var(--color-ink);
  font-size: var(--text-sm);
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: var(--color-brand);
  background-color: var(--color-panel);
  outline: none;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background-color: var(--color-brand);
  color: #FFFFFF;
  border: none;
  border-radius: var(--radius-sm);
  font-family: 'Inter', sans-serif;
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background-color: var(--color-brand-dark);
}

.tag-filters {
  padding: 10px 16px;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none; /* Hide scrollbar for clean design */
  border-bottom: 1px solid var(--color-border);
}

.tag-filters::-webkit-scrollbar {
  display: none;
}

.tag-filter-chip {
  padding: 4px 10px;
  font-size: 11px;
  border-radius: 99px;
  border: 1px solid var(--color-border);
  background-color: var(--color-paper);
  color: var(--color-muted);
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.tag-filter-chip:hover {
  color: var(--color-ink);
  border-color: var(--color-muted);
}

.tag-filter-chip.is-active {
  background-color: var(--color-brand);
  color: #FFFFFF;
  border-color: var(--color-brand);
}

.tag-filter-chip-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px 4px 10px;
  font-size: 11px;
  border-radius: 99px;
  border: 1px solid var(--color-border);
  background-color: var(--color-paper);
  color: var(--color-muted);
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.tag-filter-chip-wrapper:hover {
  border-color: var(--color-muted);
  color: var(--color-ink);
}

.tag-filter-chip-wrapper.is-active {
  background-color: var(--color-brand);
  color: #FFFFFF;
  border-color: var(--color-brand);
}

.tag-filter-chip-label {
  cursor: pointer;
}

.tag-chip-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  width: 0;
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.tag-filter-chip-wrapper:hover .tag-chip-actions {
  opacity: 1;
  width: 28px;
  pointer-events: auto;
}

.tag-chip-action-btn {
  background: none;
  border: none;
  padding: 2px;
  border-radius: 50%;
  color: var(--color-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
}

.tag-filter-chip-wrapper.is-active .tag-chip-action-btn {
  color: rgba(255, 255, 255, 0.8);
}

.tag-chip-action-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-ink);
}

.tag-filter-chip-wrapper.is-active .tag-chip-action-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
}

.tag-chip-action-btn.delete-tag-btn:hover {
  color: var(--color-signal);
}


.notes-list-scroll {
  flex-grow: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty-list-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-muted);
}

.empty-list-state .empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
  display: block;
}

.note-item-card {
  padding: 16px;
  border-radius: var(--radius-md);
  background-color: var(--color-paper);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-brand);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.note-item-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
  border-color: var(--color-muted);
}

.note-item-card.is-active {
  background-color: var(--color-panel);
  border-color: var(--color-brand);
  box-shadow: var(--shadow-card);
}

.note-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.note-color-badge {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.note-date {
  font-size: 11px;
  color: var(--color-muted);
  font-family: 'IBM Plex Mono', monospace;
}

.delete-btn {
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s, color 0.2s, background-color 0.2s;
}

.note-item-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: var(--color-signal);
  background-color: rgba(232, 86, 47, 0.1);
}

.note-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
  margin-bottom: 6px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-card-excerpt {
  font-size: 12px;
  color: var(--color-muted);
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.note-card-tag {
  font-size: 10px;
  background-color: rgba(62, 76, 138, 0.08);
  color: var(--color-brand);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
}

/* Editor Workspace */
.editor-workspace {
  flex-grow: 1;
  background-color: var(--color-panel);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.editor-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-list-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  color: var(--color-muted);
  font-size: var(--text-sm);
  cursor: pointer;
}

.editor-title-input {
  flex-grow: 1;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-ink);
  border: none;
  background: transparent;
  padding: 4px 0;
}

.editor-title-input:focus {
  outline: none;
}

.view-mode-toggles {
  display: flex;
  background-color: var(--color-paper);
  padding: 3px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.mode-btn {
  padding: 6px 12px;
  font-size: var(--text-sm);
  border: none;
  background: none;
  color: var(--color-muted);
  cursor: pointer;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s;
}

.mode-btn.is-active {
  background-color: var(--color-panel);
  color: var(--color-brand);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.meta-row {
  padding: 10px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  background-color: rgba(247, 246, 243, 0.4);
}

:root[data-theme="dark"] .meta-row {
  background-color: rgba(11, 15, 25, 0.4);
}

.meta-tags-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-grow: 1;
}

.tags-label-row {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-muted);
}

.tag-meta-icon {
  color: var(--color-muted);
  flex-shrink: 0;
}

.tags-label {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tags-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.active-tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: var(--text-xs);
  border-radius: var(--radius-sm);
  background-color: var(--color-paper);
  border: 1px solid var(--color-border);
  color: var(--color-ink);
  font-weight: 500;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  padding: 0 2px;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-tag-btn:hover {
  color: var(--color-signal);
}

.add-tag-box {
  display: flex;
  align-items: center;
}

.add-tag-trigger-btn {
  background-color: transparent;
  border: 1px dashed var(--color-border);
  color: var(--color-muted);
  font-size: var(--text-xs);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 500;
  transition: all 150ms ease;
}

.add-tag-trigger-btn:hover {
  border-color: var(--color-brand);
  color: var(--color-brand);
  background-color: rgba(62, 76, 138, 0.03);
}

.new-tag-input-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--color-brand);
  background-color: var(--color-paper);
  border-radius: var(--radius-sm);
  padding: 2px 4px;
}

.new-tag-field {
  border: none;
  background: transparent;
  color: var(--color-ink);
  font-size: var(--text-xs);
  padding: 2px;
  width: 90px;
  outline: none;
}

.save-tag-btn {
  background-color: var(--color-brand);
  color: #FFFFFF;
  border: none;
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 2px;
  cursor: pointer;
  font-weight: 600;
}

.save-tag-btn:hover {
  background-color: var(--color-brand-dark);
}

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.color-palette {
  display: flex;
  gap: 6px;
}

.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.2s;
  padding: 0;
}

.color-dot:hover {
  transform: scale(1.2);
}

.color-dot.is-selected {
  border-color: var(--color-ink);
  transform: scale(1.1);
}

/* Toolbar */
.editor-toolbar {
  padding: 8px 24px;
  background-color: var(--color-panel);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-muted);
  font-family: 'Inter', sans-serif;
  font-size: var(--text-base);
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background-color: var(--color-paper);
  color: var(--color-ink);
}

.toolbar-btn.help-btn {
  width: auto;
  padding: 0 8px;
  font-size: var(--text-xs);
  font-weight: 500;
  border: 1px solid var(--color-border);
  color: var(--color-brand);
}

.toolbar-divider {
  width: 1px;
  height: 18px;
  background-color: var(--color-border);
  margin: 0 4px;
}

/* Help Drawer */
.help-drawer {
  position: absolute;
  top: 140px;
  right: 24px;
  width: 260px;
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-modal);
  z-index: 10;
  padding: 12px;
}

.help-drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 6px;
}

.help-drawer-header h5 {
  font-size: 13px;
  color: var(--color-ink);
}

.close-help-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--color-muted);
}

.help-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.help-table td {
  padding: 4px 0;
  vertical-align: middle;
}

.help-table code {
  background-color: var(--color-paper);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'IBM Plex Mono', monospace;
}

/* Workspace Body */
.workspace-body {
  flex-grow: 1;
  display: flex;
  overflow: hidden;
}

.workspace-body.view-edit .textarea-wrapper {
  width: 100%;
}

.workspace-body.view-preview .markdown-preview {
  width: 100%;
}

.workspace-body.view-split .textarea-wrapper {
  width: 50%;
  border-right: 1px solid var(--color-border);
}

.workspace-body.view-split .markdown-preview {
  width: 50%;
}

.textarea-wrapper {
  height: 100%;
  padding: 24px;
}

.editor-textarea {
  width: 100%;
  height: 100%;
  resize: none;
  border: none;
  background: transparent;
  color: var(--color-ink);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.editor-textarea:focus {
  outline: none;
}

.markdown-preview {
  height: 100%;
  overflow-y: auto;
  padding: 24px;
  background-color: var(--color-paper);
}

:root[data-theme="dark"] .markdown-preview {
  background-color: #0d1321;
}

/* Markdown Typography styling (similar to github-markdown) */
.markdown-body {
  font-family: 'Inter', sans-serif;
  color: var(--color-ink);
  line-height: 1.6;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  font-family: 'Space Grotesk', sans-serif;
  margin-top: 24px;
  margin-bottom: 12px;
  font-weight: 700;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 6px;
}

.markdown-body :deep(h1) { font-size: 1.8em; }
.markdown-body :deep(h2) { font-size: 1.4em; }
.markdown-body :deep(h3) { font-size: 1.2em; }

.markdown-body :deep(p) {
  margin-bottom: 16px;
}

.markdown-body :deep(strong) {
  font-weight: 600;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin-bottom: 16px;
  padding-left: 20px;
}

.markdown-body :deep(li) {
  margin-bottom: 6px;
}

.markdown-body :deep(code) {
  font-family: 'IBM Plex Mono', monospace;
  background-color: rgba(27, 31, 59, 0.05);
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 85%;
}

:root[data-theme="dark"] .markdown-body :deep(code) {
  background-color: rgba(255, 255, 255, 0.08);
}

.markdown-body :deep(pre) {
  background-color: #1e293b;
  color: #f8fafc;
  padding: 16px;
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin-bottom: 16px;
}

.markdown-body :deep(pre code) {
  background: none;
  color: inherit;
  font-size: 13px;
  padding: 0;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid var(--color-brand);
  color: var(--color-muted);
  padding-left: 16px;
  margin: 0 0 16px 0;
  font-style: italic;
}

.markdown-body :deep(a) {
  color: var(--color-brand);
  text-decoration: none;
  font-weight: 500;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(input[type="checkbox"]) {
  margin-right: 6px;
  accent-color: var(--color-brand);
}

/* Empty Workspace State */
.editor-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  color: var(--color-muted);
}

.editor-empty-state .empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.editor-empty-state h3 {
  color: var(--color-ink);
  margin-bottom: 8px;
}

.editor-empty-state p {
  max-width: 380px;
  font-size: var(--text-sm);
  line-height: 1.5;
  margin-bottom: 24px;
}

.create-first-btn {
  padding: 10px 20px;
  background-color: var(--color-brand);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-first-btn:hover {
  background-color: var(--color-brand-dark);
}

/* Editor Footer */
.editor-footer {
  padding: 10px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-xs);
  color: var(--color-muted);
  background-color: var(--color-panel);
}

.footer-stats {
  display: flex;
  gap: 8px;
}

.save-status {
  display: flex;
  align-items: center;
  gap: 4px;
}

.save-icon {
  color: var(--color-success);
  font-weight: bold;
}

/* Confirmation Modal */
.confirm-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0,0,0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-modal {
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: var(--shadow-modal);
}

.confirm-modal h3 {
  margin-bottom: 12px;
  color: var(--color-ink);
}

.confirm-modal p {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: 1.5;
  margin-bottom: 24px;
}

.confirm-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.confirm-cancel-btn {
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  background: none;
  color: var(--color-ink);
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
}

.confirm-delete-btn {
  padding: 8px 16px;
  border: none;
  background-color: var(--color-signal);
  color: white;
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 600;
}

.confirm-delete-btn:hover {
  background-color: #d13d17;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .notes-dashboard {
    height: calc(100vh - 70px);
  }

  .notes-sidebar {
    width: 100%;
    min-width: 100%;
  }

  .editor-workspace {
    display: none;
  }

  /* When mobile editor is active, swap display */
  .mobile-editor-active .notes-sidebar {
    display: none;
  }

  .mobile-editor-active .editor-workspace {
    display: flex;
    width: 100%;
  }

  .workspace-body.view-split .textarea-wrapper {
    width: 100%;
    border-right: none;
  }

  .workspace-body.view-split .markdown-preview {
    display: none;
  }

  .help-drawer {
    right: 12px;
    width: calc(100% - 24px);
    top: 150px;
  }
}

.desktop-only {
  display: inline-flex;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
  .mobile-only {
    display: inline-flex !important;
  }
}
</style>
