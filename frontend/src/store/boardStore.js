import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'

export const useBoardStore = defineStore('board', {
  state: () => ({
    boards: [],
    loading: false,
    error: null,
    // Map boardId to columns list
    columnsMap: {},
    nextColumnId: 1000,
    nextTaskId: 5000
  }),
  getters: {
    getBoardById: (state) => (id) => {
      return state.boards.find(b => b.id === Number(id))
    },
    getColumnsByBoardId: (state) => (id) => {
      if (!state.columnsMap[id]) {
        // Initialize empty columns for new boards
        state.columnsMap[id] = [
          { id: state.nextColumnId++, name: "Backlog", accent: null, tasks: [] },
          { id: state.nextColumnId++, name: "Sedang Dikerjakan", accent: null, tasks: [] },
          { id: state.nextColumnId++, name: "Selesai", accent: "success", tasks: [] }
        ]
      }
      return state.columnsMap[id]
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
          throw new Error('Gagal membuat board')
        }
        const data = await response.json()
        const newBoard = {
          id: data.id,
          name: data.title,
          taskCount: 0,
          doneCount: 0
        }
        this.boards.push(newBoard)
        this.getColumnsByBoardId(newBoard.id)
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
          throw new Error('Gagal mengubah board')
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
          throw new Error('Gagal menghapus board')
        }
        this.boards = this.boards.filter(b => b.id !== id)
        delete this.columnsMap[id]
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    addColumn(boardId, name) {
      const columns = this.getColumnsByBoardId(boardId)
      columns.push({
        id: this.nextColumnId++,
        name,
        accent: null,
        tasks: []
      })
      this.updateBoardCounts(boardId)
    },
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
