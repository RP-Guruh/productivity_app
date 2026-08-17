# TaskFlow - Modern Productivity Suite

TaskFlow is a premium, state-of-the-art personal productivity dashboard designed to optimize your daily workflow. It integrates task management, quick notes, and a distraction-free RSS reader into a single responsive application.

---

## 🌟 Key Features

### 1. Collapsible & Responsive Sidebar Navigation
* **Clean Workspaces**: Pruned legacy sections to focus strictly on tasks, notes, RSS feeds, and system settings.
* **Responsive Layout**: Smoothly collapses to icon-only view on desktop (`80px`), maximizing workspace real estate, and scales dynamically down to mobile devices.
* **Theme Support**: Fully integrated light and dark modes matching the UI theme settings.

### 2. Task Management (Kanban Board)
* Agile Kanban columns for organizing tasks.
* Drag-and-drop mechanics or easy inline list updates.

### 3. Quick Notes (Markdown Editor)
* **Rich Markdown Editing**: Write notes with raw Markdown, support for keyboard syntax guides, and custom styling.
* **Tag Management System**: Hover actions (edit & delete) directly on tag filters:
  * **Global Rename**: Updates the tag name across all notes in storage.
  * **Global Delete**: Cleans the tag out of all notes without deleting the notes.

### 4. RSS Feed Reader (Tabbed Layout)
* **Dashboard Baca (Reader View)**:
  * Spacious widescreen layout displaying a 2-column view (Article list & full-screen reader pane).
  * Horizontal scrolling filter bar for tags, categories, starred, unread, or specific channel sources.
  * **Cross-module action**: Instantly convert and copy RSS articles to **Quick Notes** as formatted Markdown with a single click.
* **Kelola Sumber Feed (Settings View)**:
  * Manage, add, edit, or delete RSS feed channels (URLs, names, and categories).
  * Manage categories inline, where deleting custom categories automatically updates associated channels/articles to the default `"Lainnya"`.

---

## 🛠️ Technology Stack

* **Backend**: Spring Boot, Maven, JPA / Hibernate, H2/MySQL
* **Frontend**: Vue 3, Vite, Vanilla CSS design system, Local Storage fallback state
* **Styling**: Highly premium vanilla CSS featuring CSS variables for dark/light themes, frosted glassmorphism, responsive grid systems, and micro-animations.

---

## 🚀 Setup & Installation

### Backend Setup
1. Ensure Java JDK 17+ and Maven are installed.
2. Navigate to the root directory and build/run:
   ```bash
   ./mvnw spring-boot:run
   ```
3. The server runs at `http://localhost:8088`.

### Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. The client will be served locally (typically `http://localhost:5173` or similar).

---

## 📄 License
This project is licensed under the MIT License.
