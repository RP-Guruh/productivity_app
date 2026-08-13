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
        this.columnsMap[boardId] = data
          .sort((a, b) => a.position - b.position)
          .map(bl => ({
            id: bl.id,
            name: bl.title,
            position: bl.position,
            accent: this.detectAccent(bl.title),
            tasks: []
          }))
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

    // ============================
    // Task operations (still local for now)
    // ============================

    addTask(boardId, columnId, task) {
      const columns = this.getColumnsByBoardId(boardId)
      const column = columns.find(c => c.id === columnId)
      if (column) {
        column.tasks.push({
          id: this.nextTaskId++,
          title: task.title || "Task Baru",
          description: task.description || "",
          priority: task.priority || "rendah",
          dueDate: task.dueDate || null
        })
        this.updateBoardCounts(boardId)
      }
    },
    updateTask(boardId, taskId, updatedFields) {
      const columns = this.getColumnsByBoardId(boardId)
      for (const col of columns) {
        const taskIdx = col.tasks.findIndex(t => t.id === taskId)
        if (taskIdx !== -1) {
          col.tasks[taskIdx] = {
            ...col.tasks[taskIdx],
            ...updatedFields
          }
          break
        }
      }
      this.updateBoardCounts(boardId)
    },
    deleteTask(boardId, taskId) {
      const columns = this.getColumnsByBoardId(boardId)
      for (const col of columns) {
        const taskIdx = col.tasks.findIndex(t => t.id === taskId)
        if (taskIdx !== -1) {
          col.tasks.splice(taskIdx, 1)
          break
        }
      }
      this.updateBoardCounts(boardId)
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
