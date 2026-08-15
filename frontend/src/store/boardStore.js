import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'

/**
 * Parse error response dari API dan kembalikan pesan yang user-friendly.
 * Format response: { message, error, details: [...], status }
 */
async function parseApiError(response, fallbackMessage) {
  try {
    const body = await response.json()
    // Gabungkan details jika ada (validasi)
    if (body.details && body.details.length > 0) {
      return body.details.join(', ')
    }
    return body.message || fallbackMessage
  } catch {
    return fallbackMessage
  }
}

export const useBoardStore = defineStore('board', {
  state: () => ({
    boards: [],
    loading: false,
    error: null,
    // Map boardId to board lists (columns)
    columnsMap: {},
    columnsLoading: false,
    columnsError: null,
    nextTaskId: 5000
  }),
  getters: {
    getBoardById: (state) => (id) => {
      return state.boards.find(b => b.id === Number(id))
    },
    getColumnsByBoardId: (state) => (id) => {
      return state.columnsMap[id] || []
    }
  },
  actions: {
    async fetchBoards() {
      const authStore = useAuthStore()
      this.loading = true
      this.error = null
      try {
        const response = await fetch('/api/boards', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          }
        })
        if (!response.ok) {
          throw new Error('Gagal mengambil data board')
        }
        const data = await response.json()
        this.boards = data.map(b => ({
          id: b.id,
          name: b.title,
          taskCount: 0,
          doneCount: 0
        }))
        // Recalculate counts
        this.boards.forEach(b => {
          this.updateBoardCounts(b.id)
        })
      } catch (err) {
        this.error = err.message
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async addBoard(name) {
      const authStore = useAuthStore()
      this.loading = true
      this.error = null
      try {
        const response = await fetch('/api/boards', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title: name })
        })
        if (!response.ok) {
          throw new Error(await parseApiError(response, 'Gagal membuat board'))
        }
        const data = await response.json()
        const newBoard = {
          id: data.id,
          name: data.title,
          taskCount: 0,
          doneCount: 0
        }
        this.boards.push(newBoard)
        return newBoard.id
      } catch (err) {
        this.error = err.message
        console.error(err)
        throw err
      } finally {
        this.loading = false
      }
    },
    async updateBoard(id, name) {
      const authStore = useAuthStore()
      try {
        const response = await fetch(`/api/boards/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title: name })
        })
        if (!response.ok) {
          throw new Error(await parseApiError(response, 'Gagal mengubah board'))
        }
        const data = await response.json()
        const boardIdx = this.boards.findIndex(b => b.id === id)
        if (boardIdx !== -1) {
          this.boards[boardIdx].name = data.title
        }
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    async deleteBoard(id) {
      const authStore = useAuthStore()
      try {
        const response = await fetch(`/api/boards/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })
        if (!response.ok) {
          throw new Error(await parseApiError(response, 'Gagal menghapus board'))
        }
        this.boards = this.boards.filter(b => b.id !== id)
        delete this.columnsMap[id]
      } catch (err) {
        console.error(err)
        throw err
      }
    },

    // ============================
    // Board List (Column) API calls
    // ============================

    async fetchBoardLists(boardId) {
      const authStore = useAuthStore()
      this.columnsLoading = true
      this.columnsError = null
      try {
        const response = await fetch(`/api/boards/${boardId}/lists`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          }
        })
        if (!response.ok) {
          throw new Error(await parseApiError(response, 'Gagal mengambil data kolom'))
        }
        const data = await response.json()
        // Map API response to column format used by the UI
        const columns = data
          .sort((a, b) => a.position - b.position)
          .map(bl => ({
            id: bl.id,
            name: bl.title,
            position: bl.position,
            accent: this.detectAccent(bl.title),
            tasks: []
          }))

        // Fetch tasks for each column
        await Promise.all(columns.map(async col => {
          try {
            const taskRes = await fetch(`/api/tasks/board-list/${col.id}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${authStore.token}`,
                'Content-Type': 'application/json'
              }
            })
            if (taskRes.ok) {
              const tasksData = await taskRes.ok ? await taskRes.json() : []
              col.tasks = tasksData
                .sort((a, b) => (a.position || 0) - (b.position || 0))
                .map(t => ({
                  id: t.id,
                  title: t.title,
                  description: t.desc || '',
                  priority: this.mapPriorityToFrontend(t.priority),
                  dueDate: t.dueDate ? t.dueDate.split('T')[0] : null,
                  position: t.position
                }))
            }
          } catch (err) {
            console.error(`Gagal mengambil task untuk kolom ${col.id}:`, err)
          }
        }))

        this.columnsMap[boardId] = columns
        this.updateBoardCounts(boardId)
      } catch (err) {
        this.columnsError = err.message
        console.error(err)
      } finally {
        this.columnsLoading = false
      }
    },

    async addColumn(boardId, name, position) {
      const authStore = useAuthStore()
      try {
        const response = await fetch(`/api/boards/${boardId}/lists`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: name,
            position: position
          })
        })
        if (!response.ok) {
          throw new Error(await parseApiError(response, 'Gagal membuat kolom baru'))
        }
        const data = await response.json()
        if (!this.columnsMap[boardId]) {
          this.columnsMap[boardId] = []
        }
        this.columnsMap[boardId].push({
          id: data.id,
          name: data.title,
          position: data.position,
          accent: this.detectAccent(data.title),
          tasks: []
        })
        this.updateBoardCounts(boardId)
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    async updateColumn(boardId, columnId, name, position) {
      const authStore = useAuthStore()
      try {
        const response = await fetch(`/api/boards/${boardId}/lists/${columnId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: name,
            position: position
          })
        })
        if (!response.ok) {
          throw new Error(await parseApiError(response, 'Gagal memperbarui kolom'))
        }
        const data = await response.json()
        if (this.columnsMap[boardId]) {
          const col = this.columnsMap[boardId].find(c => c.id === columnId)
          if (col) {
            col.name = data.title
            col.position = data.position
            col.accent = this.detectAccent(data.title)
          }
          this.columnsMap[boardId].sort((a, b) => a.position - b.position)
        }
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    async deleteColumn(boardId, columnId) {
      const authStore = useAuthStore()
      try {
        const response = await fetch(`/api/boards/${boardId}/lists/${columnId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })
        if (!response.ok) {
          throw new Error(await parseApiError(response, 'Gagal menghapus kolom'))
        }
        if (this.columnsMap[boardId]) {
          this.columnsMap[boardId] = this.columnsMap[boardId].filter(c => c.id !== columnId)
        }
        this.updateBoardCounts(boardId)
      } catch (err) {
        console.error(err)
        throw err
      }
    },

    // Helper to auto-detect column accent based on title
    detectAccent(title) {
      const lower = (title || '').toLowerCase()
      if (lower === 'selesai' || lower === 'done' || lower === 'completed') {
        return 'success'
      }
      return null
    },

    // Priority level mapping helpers
    mapPriorityToFrontend(p) {
      if (!p) return 'rendah'
      const lower = p.toLowerCase()
      if (lower === 'high' || lower === 'tinggi') return 'tinggi'
      if (lower === 'medium' || lower === 'sedang') return 'sedang'
      return 'rendah'
    },
    mapPriorityToBackend(p) {
      if (!p) return 'LOW'
      const lower = p.toLowerCase()
      if (lower === 'tinggi' || lower === 'high') return 'HIGH'
      if (lower === 'sedang' || lower === 'medium') return 'MEDIUM'
      return 'LOW'
    },

    // ============================
    // Task operations (Integrated with Backend API)
    // ============================

    async addTask(boardId, columnId, task) {
      const authStore = useAuthStore()
      try {
        const payload = {
          boardListId: columnId,
          title: task.title || "Task Baru",
          desc: task.description || "",
          priority: this.mapPriorityToBackend(task.priority),
          dueDate: task.dueDate ? `${task.dueDate}T00:00:00` : null,
          position: task.position || null
        }
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        if (!response.ok) {
          throw new Error(await parseApiError(response, 'Gagal membuat task baru'))
        }
        const data = await response.json()
        const columns = this.getColumnsByBoardId(boardId)
        const column = columns.find(c => c.id === columnId)
        if (column) {
          column.tasks.push({
            id: data.id,
            title: data.title,
            description: data.desc || "",
            priority: this.mapPriorityToFrontend(data.priority),
            dueDate: data.dueDate ? data.dueDate.split('T')[0] : null,
            position: data.position
          })
          this.updateBoardCounts(boardId)
        }
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    async updateTask(boardId, taskId, updatedFields) {
      const authStore = useAuthStore()
      try {
        const columns = this.getColumnsByBoardId(boardId)
        let existingTask = null
        let currentColumnId = null
        for (const col of columns) {
          const t = col.tasks.find(x => x.id === taskId)
          if (t) {
            existingTask = t
            currentColumnId = col.id
            break
          }
        }
        if (!existingTask) throw new Error('Task tidak ditemukan')

        const title = updatedFields.title !== undefined ? updatedFields.title : existingTask.title
        const description = updatedFields.description !== undefined ? updatedFields.description : existingTask.description
        const priority = updatedFields.priority !== undefined ? updatedFields.priority : existingTask.priority
        const dueDate = updatedFields.dueDate !== undefined ? updatedFields.dueDate : existingTask.dueDate
        const position = updatedFields.position !== undefined ? updatedFields.position : existingTask.position

        const payload = {
          boardListId: currentColumnId,
          title: title,
          desc: description || "",
          priority: this.mapPriorityToBackend(priority),
          dueDate: dueDate ? (dueDate.includes('T') ? dueDate : `${dueDate}T00:00:00`) : null,
          position: position || null
        }

        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        if (!response.ok) {
          throw new Error(await parseApiError(response, 'Gagal memperbarui task'))
        }
        const data = await response.json()
        
        // Update local state
        for (const col of columns) {
          const idx = col.tasks.findIndex(t => t.id === taskId)
          if (idx !== -1) {
            col.tasks[idx] = {
              id: data.id,
              title: data.title,
              description: data.desc || "",
              priority: this.mapPriorityToFrontend(data.priority),
              dueDate: data.dueDate ? data.dueDate.split('T')[0] : null,
              position: data.position
            }
            break
          }
        }
        this.updateBoardCounts(boardId)
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    async moveTask(boardId, taskId, targetColumnId, targetPosition) {
      const authStore = useAuthStore()
      try {
        const columns = this.getColumnsByBoardId(boardId)
        let existingTask = null
        for (const col of columns) {
          const t = col.tasks.find(x => x.id === taskId)
          if (t) {
            existingTask = t
            break
          }
        }
        if (!existingTask) throw new Error('Task tidak ditemukan')

        const payload = {
          boardListId: targetColumnId,
          title: existingTask.title,
          desc: existingTask.description || "",
          priority: this.mapPriorityToBackend(existingTask.priority),
          dueDate: existingTask.dueDate ? (existingTask.dueDate.includes('T') ? existingTask.dueDate : `${existingTask.dueDate}T00:00:00`) : null,
          position: targetPosition
        }

        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        if (!response.ok) {
          throw new Error(await parseApiError(response, 'Gagal memindahkan task'))
        }
        const data = await response.json()

        // Sync local arrays
        let foundTask = null
        for (const col of columns) {
          const idx = col.tasks.findIndex(t => t.id === taskId)
          if (idx !== -1) {
            foundTask = col.tasks.splice(idx, 1)[0]
            break
          }
        }

        if (foundTask) {
          foundTask.position = data.position
          foundTask.priority = this.mapPriorityToFrontend(data.priority)
          foundTask.dueDate = data.dueDate ? data.dueDate.split('T')[0] : null
          
          const targetCol = columns.find(c => c.id === targetColumnId)
          if (targetCol) {
            const insertIdx = targetPosition - 1
            if (insertIdx >= 0 && insertIdx < targetCol.tasks.length) {
              targetCol.tasks.splice(insertIdx, 0, foundTask)
            } else {
              targetCol.tasks.push(foundTask)
            }
          }
        }
        this.updateBoardCounts(boardId)
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    async deleteTask(boardId, taskId) {
      const authStore = useAuthStore()
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })
        if (!response.ok) {
          throw new Error(await parseApiError(response, 'Gagal menghapus task'))
        }
        // Remove locally
        const columns = this.getColumnsByBoardId(boardId)
        for (const col of columns) {
          const taskIdx = col.tasks.findIndex(t => t.id === taskId)
          if (taskIdx !== -1) {
            col.tasks.splice(taskIdx, 1)
            break
          }
        }
        this.updateBoardCounts(boardId)
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    updateBoardCounts(boardId) {
      const board = this.boards.find(b => b.id === Number(boardId))
      if (!board) return
      const columns = this.getColumnsByBoardId(boardId)
      let total = 0
      let done = 0
      columns.forEach(col => {
        total += col.tasks.length
        if (col.accent === 'success' || col.name.toLowerCase() === 'selesai' || col.name.toLowerCase() === 'done') {
          done += col.tasks.length
        }
      })
      board.taskCount = total
      board.doneCount = done
    }
  }
})
