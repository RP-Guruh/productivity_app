<template>
  <div class="rss-module-container">
    <!-- RSS Top Tab Menu -->
    <div class="rss-top-tabs">
      <button 
        :class="['rss-tab-btn', { 'is-active': activeSubTab === 'dashboard' }]" 
        @click="activeSubTab = 'dashboard'"
      >
        <span class="tab-icon">📰</span>
        Dashboard Baca
      </button>
      <button 
        :class="['rss-tab-btn', { 'is-active': activeSubTab === 'manage' }]" 
        @click="activeSubTab = 'manage'"
      >
        <span class="tab-icon">⚙️</span>
        Kelola Sumber Feed
      </button>
    </div>

    <!-- Active View Content -->
    <div class="rss-tab-content">
      <!-- 1. DASHBOARD BACA (FULL-WIDTH READING LAYOUT) -->
      <div v-if="activeSubTab === 'dashboard'" class="rss-dashboard-view" :class="{ 'mobile-reader-active': isMobileReaderActive && activeArticle }">
        
        <!-- Filter Bar -->
        <div class="rss-filters-bar">
          <button 
            :class="['rss-filter-chip', { 'is-active': activeFilter === 'all' }]"
            @click="selectFilter('all')"
          >
            📰 Semua ({{ totalUnreadCount }})
          </button>
          <button 
            :class="['rss-filter-chip', { 'is-active': activeFilter === 'starred' }]"
            @click="selectFilter('starred')"
          >
            ⭐ Favorit ({{ starredCount }})
          </button>
          <button 
            :class="['rss-filter-chip', { 'is-active': activeFilter === 'unread' }]"
            @click="selectFilter('unread')"
          >
            🔵 Belum Dibaca
          </button>
          <div class="filter-divider"></div>
          <button 
            v-for="cat in categories" 
            :key="cat"
            :class="['rss-filter-chip', { 'is-active': activeFilter === `cat:${cat}` }]"
            @click="selectFilter(`cat:${cat}`)"
          >
            🏷️ #{{ cat }}
          </button>
          <div class="filter-divider"></div>
          <button 
            v-for="feed in feeds" 
            :key="feed.id"
            :class="['rss-filter-chip', { 'is-active': activeFilter === `feed:${feed.id}` }]"
            @click="selectFilter(`feed:${feed.id}`)"
          >
            {{ feed.favicon }} {{ feed.name }}
          </button>
        </div>

        <div class="rss-dashboard-main">
          <!-- RSS Articles Column -->
          <div class="rss-articles-list">
            <div class="list-header">
              <div class="search-bar">
                <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input 
                  type="text" 
                  placeholder="Cari artikel..." 
                  v-model="searchQuery" 
                  class="rss-search-input"
                />
              </div>
              <div class="header-actions">
                <button class="action-btn" @click="refreshFeeds" title="Segarkan Feed" :disabled="isRefreshing">
                  <svg :class="{ 'rotating': isRefreshing }" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                </button>
                <button class="action-btn" @click="markAllAsRead" title="Tandai semua dibaca">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
              </div>
            </div>

            <!-- Articles Scroll Area -->
            <div class="articles-scroll">
              <div v-if="isRefreshing" class="rss-loading-state">
                <div class="spinner"></div>
                <p>Membaca feed terbaru...</p>
              </div>
              <div v-else-if="filteredArticles.length === 0" class="rss-empty-articles">
                <span class="empty-icon">📭</span>
                <h4>Tidak ada artikel</h4>
                <p>Tidak ada artikel yang cocok dengan filter atau pencarian Anda.</p>
              </div>
              <div 
                v-else
                v-for="article in filteredArticles" 
                :key="article.id"
                :class="['article-item-card', { 'is-read': article.isRead, 'is-active': activeArticleId === article.id }]"
                @click="selectArticle(article)"
              >
                <div class="article-meta">
                  <span class="article-source-tag">
                    {{ getFeedFavicon(article.feedId) }} {{ getFeedName(article.feedId) }}
                  </span>
                  <span class="article-dot" v-if="!article.isRead"></span>
                  <span class="article-time">{{ article.publishedAt }}</span>
                </div>
                <h4 class="article-title">{{ article.title }}</h4>
                <p class="article-summary">{{ article.summary }}</p>
                <div class="article-card-footer">
                  <div class="footer-meta-left">
                    <span class="article-category-badge">{{ article.category }}</span>
                    <span class="article-reading-time">⏱️ {{ getReadingTime(article.content) }}</span>
                  </div>
                  <button class="star-btn" @click.stop="toggleStar(article)" :title="article.isStarred ? 'Hapus bintang' : 'Bintangi'">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      :fill="article.isStarred ? 'var(--color-warning)' : 'none'" 
                      :stroke="article.isStarred ? 'var(--color-warning)' : 'currentColor'" 
                      stroke-width="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- RSS Reader Column -->
          <div class="rss-reader-pane">
            <div v-if="activeArticle" class="reader-container">
              <!-- Reader Toolbar -->
              <div class="reader-toolbar">
                <button class="back-list-btn mobile-only" @click="isMobileReaderActive = false">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  Artikel
                </button>
                <div class="reader-actions-left">
                  <span class="source-pill">
                    {{ getFeedFavicon(activeArticle.feedId) }} {{ getFeedName(activeArticle.feedId) }}
                  </span>
                </div>
                <div class="reader-actions-right">
                  <button class="btn-action-primary" @click="saveToNotes(activeArticle)" title="Salin artikel ini ke Quick Notes">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Simpan ke Notes
                  </button>
                  <button class="btn-action-secondary" @click="toggleStar(activeArticle)">
                    {{ activeArticle.isStarred ? '⭐ Berbintang' : '☆ Bintangi' }}
                  </button>
                </div>
              </div>

              <!-- Reader Scrollable Content -->
              <div class="reader-content-scroll">
                <div class="article-hero-banner" v-if="activeArticle.image">
                  <img :src="activeArticle.image" :alt="activeArticle.title" class="hero-image" />
                </div>
                <div class="article-body-wrapper">
                  <div class="article-header-info">
                    <h1 class="reader-title">{{ activeArticle.title }}</h1>
                    <div class="reader-meta">
                      <span class="reader-author" v-if="activeArticle.author">Oleh <strong>{{ activeArticle.author }}</strong></span>
                      <span class="meta-separator" v-if="activeArticle.author">•</span>
                      <span class="reader-date">{{ activeArticle.publishedAt }}</span>
                      <span class="meta-separator">•</span>
                      <span class="reader-reading-time">⏱️ {{ getReadingTime(activeArticle.content) }}</span>
                    </div>
                  </div>
                  <div class="reader-article-body font-lora" v-html="activeArticle.content"></div>
                  <div class="reader-footer-actions">
                    <a :href="activeArticle.link" target="_blank" rel="noopener noreferrer" class="visit-original-btn">
                      Baca Artikel Asli di Website
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left: 6px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="reader-empty-state">
              <span class="reader-empty-icon">📖</span>
              <h3>Pilih Artikel untuk Dibaca</h3>
              <p>Pilih salah satu artikel di daftar samping untuk membacanya di sini.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. KELOLA SUMBER FEED (MANAGEMENT LAYOUT) -->
      <div v-else class="rss-manage-view">
        <div class="rss-manage-grid">
          <!-- Left Panel: Categories -->
          <div class="manage-card">
            <div class="card-header-row">
              <h3>Kelola Kategori</h3>
              <button class="btn-add-cat" @click="showNewCatInput = true" v-if="!showNewCatInput">
                + Tambah Kategori
              </button>
            </div>

            <!-- Add Category Inline -->
            <div v-if="showNewCatInput" class="inline-add-cat-form" style="margin-bottom: 16px;">
              <input 
                type="text" 
                v-model="newCatValue" 
                placeholder="Nama kategori..." 
                class="form-input-cat"
                @keyup.enter="addNewCategory"
                ref="newCatInputRef"
                style="width: 100%; padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background-color: var(--color-panel); color: var(--color-ink);"
              />
              <div class="inline-form-actions" style="margin-top: 8px; display: flex; gap: 8px;">
                <button class="btn-small-submit" @click="addNewCategory" style="padding: 4px 10px; background: var(--color-brand); border: none; color: white; border-radius: var(--radius-sm); font-size: 11px; cursor: pointer;">Simpan</button>
                <button class="btn-small-cancel" @click="showNewCatInput = false" style="padding: 4px 10px; background: var(--color-border); border: none; color: var(--color-muted); border-radius: var(--radius-sm); font-size: 11px; cursor: pointer;">Batal</button>
              </div>
            </div>

            <div class="categories-list-scroll">
              <div class="category-item-row" v-for="cat in categories" :key="cat" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid var(--color-border); font-size: 13px;">
                <span class="cat-label">🏷️ #{{ cat }}</span>
                <!-- Allow deleting only custom categories -->
                <button 
                  v-if="customCategories.includes(cat)" 
                  class="btn-delete-item" 
                  @click="deleteCategory(cat)"
                  title="Hapus Kategori"
                  style="background: none; border: none; color: var(--color-signal); cursor: pointer;"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
                <span v-else class="system-badge" style="font-size: 10px; opacity: 0.5; font-style: italic;">Bawaan</span>
              </div>
            </div>
          </div>

          <!-- Right Panel: Channels -->
          <div class="manage-card span-two-cols">
            <div class="card-header-row">
              <h3>Saluran Feed RSS</h3>
              <button class="btn-add-feed" @click="isAddModalOpen = true">
                + Tambah Saluran RSS
              </button>
            </div>

            <div class="feeds-table-container">
              <table class="feeds-table">
                <thead>
                  <tr>
                    <th>Saluran</th>
                    <th>URL Feed</th>
                    <th>Kategori</th>
                    <th style="width: 100px; text-align: center;">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="feed in feeds" :key="feed.id">
                    <td>
                      <div class="feed-cell-name">
                        <span class="feed-favicon-cell">{{ feed.favicon }}</span>
                        <strong>{{ feed.name }}</strong>
                      </div>
                    </td>
                    <td><code class="feed-url-code">{{ feed.url }}</code></td>
                    <td><span class="feed-cat-badge">{{ feed.category }}</span></td>
                    <td>
                      <div class="actions-cell">
                        <button class="btn-icon-action edit-btn" @click="startEditFeed(feed)" title="Edit Feed">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-icon-action delete-btn" @click="confirmDeleteFeed(feed)" title="Hapus Feed">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Feed Modal Dialog -->
    <div class="modal-overlay" v-if="isAddModalOpen">
      <div class="modal-box animate-fade-in">
        <div class="modal-header">
          <h3>Tambah Feed RSS Baru</h3>
          <button class="modal-close" @click="isAddModalOpen = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">URL RSS Feed</label>
            <input 
              type="url" 
              v-model="newFeedUrl" 
              placeholder="https://example.com/rss.xml" 
              class="form-input"
              required
            />
            <p class="form-help">Pastikan URL yang dimasukkan mengarah ke file RSS/Atom XML yang valid.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Nama Saluran (Opsional)</label>
            <input 
              type="text" 
              v-model="newFeedName" 
              placeholder="Contoh: Blog Teknologi Utama" 
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Kategori</label>
            <select v-model="newFeedCategory" class="form-select">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="isAddModalOpen = false">Batal</button>
          <button class="btn-submit" @click="addNewFeed" :disabled="!newFeedUrl">Simpan Feed</button>
        </div>
      </div>
    </div>

    <!-- Edit Feed Modal Dialog -->
    <div class="modal-overlay" v-if="isEditModalOpen">
      <div class="modal-box animate-fade-in">
        <div class="modal-header">
          <h3>Edit Saluran Feed RSS</h3>
          <button class="modal-close" @click="isEditModalOpen = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">URL RSS Feed</label>
            <input 
              type="url" 
              v-model="editFeedUrl" 
              placeholder="https://example.com/rss.xml" 
              class="form-input"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">Nama Saluran</label>
            <input 
              type="text" 
              v-model="editFeedName" 
              placeholder="Contoh: Blog Teknologi Utama" 
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Kategori</label>
            <select v-model="editFeedCategory" class="form-select">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="isEditModalOpen = false">Batal</button>
          <button class="btn-submit" @click="saveEditFeed" :disabled="!editFeedUrl">Simpan Perubahan</button>
        </div>
      </div>
    </div>

    <!-- Alert / Toast Toast Notification -->
    <div class="rss-toast animate-fade-in" v-if="toastMessage">
      <span class="toast-icon">✨</span>
      <span class="toast-text">{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'

const emit = defineEmits(['save-to-notes'])

// Mock Feeds
const INITIAL_FEEDS = [
  { id: 'f1', name: 'Dev.to (Tech & Dev)', url: 'https://dev.to/feed', category: 'Teknologi', favicon: '🚀' },
  { id: 'f2', name: 'TechCrunch', url: 'https://techcrunch.com/feed', category: 'Teknologi', favicon: '💚' },
  { id: 'f3', name: 'Smashing Magazine', url: 'https://smashingmagazine.com/feed', category: 'Desain', favicon: '🔴' },
  { id: 'f4', name: 'BBC News - World', url: 'http://feeds.bbci.co.uk/news/rss.xml', category: 'Berita', favicon: '🌐' }
]

// Mock Articles
const INITIAL_ARTICLES = [
  {
    id: 'a1',
    feedId: 'f1',
    title: 'Cara Meningkatkan Produktivitas Developer di Tahun 2026',
    author: 'Ahmad Nurdiansyah',
    summary: 'Artikel ini membahas alat bantu AI terbaru, teknik manajemen waktu Pomodoro modern, dan cara merancang alur kerja coding bebas gangguan.',
    content: `<p>Meningkatnya tuntutan kecepatan development menuntut developer untuk beradaptasi dengan alat bantu terbaru. Di tahun 2026, produktivitas bukan hanya tentang menulis baris kode lebih banyak, tapi menulis kode yang lebih pintar.</p>
              <h3>1. Optimalisasi AI Coding Assistant</h3>
              <p>Menggunakan AI assistant seperti TaskFlow AI untuk merancang task board, mendesain mockup, dan menguji kode secara otomatis dapat memangkas waktu kerja hingga 40%. Pastikan Anda menggunakan prompt yang spesifik dan terstruktur.</p>
              <h3>2. Teknik Deep Work yang Efektif</h3>
              <p>Membatasi notifikasi media sosial, email, dan Slack pada jam-jam tertentu. Mengalokasikan 2 jam sehari untuk sesi "Deep Work" di mana Anda tidak boleh diganggu sama sekali untuk menyelesaikan coding kompleks.</p>
              <h3>3. Dokumentasi Instan</h3>
              <p>Membiasakan mencatat coretan ide coding di <strong>Quick Notes</strong> langsung saat Anda mendapat inspirasi di tengah pengerjaan project agar alur pikir tidak terputus.</p>`,
    image: 'https://picsum.photos/800/400?random=1',
    link: 'https://dev.to/productivity-2026',
    publishedAt: '17 Agu 2026, 10:30',
    category: 'Teknologi',
    isRead: false,
    isStarred: false
  },
  {
    id: 'a2',
    feedId: 'f2',
    title: 'Generasi Baru LLM Berukuran Kecil Mengubah Alur Kerja Perusahaan Startup',
    author: 'Sarah Jenkins',
    summary: 'Model bahasa besar berukuran kecil (SLM) kini dapat berjalan lokal di perangkat mobile, mengurangi biaya API backend dan meningkatkan keamanan data.',
    content: `<p>Lanskap AI global sedang mengalami pergeseran besar dari model raksasa berbasis cloud ke arah Small Language Models (SLM) yang dapat dideploy di perangkat lokal secara mandiri.</p>
              <p>Startup teknologi kini memilih SLM karena beberapa alasan utama:</p>
              <ul>
                <li><strong>Efisiensi Biaya:</strong> Mengurangi ketergantungan pada API komersial pihak ketiga yang mahal.</li>
                <li><strong>Privasi Data:</strong> Seluruh data diproses lokal di server internal tanpa risiko kebocoran data sensitif.</li>
                <li><strong>Latency Rendah:</strong> Respon instan tanpa bergantung pada kestabilan koneksi internet global.</li>
              </ul>
              <p>Dengan integrasi mulus di aplikasi lokal (seperti board notes internal), pengguna dapat langsung meminta saran tanpa khawatir performa melambat.</p>`,
    image: 'https://picsum.photos/800/400?random=2',
    link: 'https://techcrunch.com/small-llms-startup',
    publishedAt: '17 Agu 2026, 09:15',
    category: 'Teknologi',
    isRead: false,
    isStarred: false
  },
  {
    id: 'a3',
    feedId: 'f3',
    title: 'Tren Desain Glassmorphism & Micro-animations untuk Web Modern',
    author: 'Vitaly Friedman',
    summary: 'Panduan praktis merancang antarmuka web yang tampak premium dengan efek frosted-glass dan animasi transisi hover CSS yang halus.',
    content: `<p>Estetika UI di tahun 2026 berfokus pada kedalaman visual dan responsivitas interaksi. Glassmorphism, dipadukan dengan dark/light mode yang elegan, memberikan kesan premium sejak detik pertama user membuka web.</p>
              <h3>Prinsip Utama Glassmorphism CSS</h3>
              <p>Untuk membuat container bergaya kaca buram yang elegan, kita menggunakan perpaduan filter blur dan border semi-transparan:</p>
              <pre><code>.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}</code></pre>
              <h3>Pentingnya Micro-animations</h3>
              <p>Micro-animations pada tombol hover, ikon menu, dan check-in status membuat aplikasi terasa "hidup". Animasi ini sebaiknya berdurasi antara 150ms hingga 250ms agar terasa instan dan tidak membuang waktu user.</p>`,
    image: 'https://picsum.photos/800/400?random=3',
    link: 'https://smashingmagazine.com/glassmorphism-trends',
    publishedAt: '16 Agu 2026, 15:45',
    category: 'Desain',
    isRead: true,
    isStarred: true
  },
  {
    id: 'a4',
    feedId: 'f4',
    title: 'Konferensi Iklim Global 2026 Menyepakati Kuota Energi Terbarukan Baru',
    author: 'James Wilson',
    summary: 'Lebih dari 120 negara menandatangani pakta percepatan transisi energi surya dan angin guna menggandakan kapasitas grid global pada tahun 2030.',
    content: `<p>Delegasi dari seluruh belahan dunia telah mencapai konsensus bersejarah dalam konferensi iklim tahunan di Jenewa. Pakta baru ini mewajibkan negara-negara industri untuk menyuplai minimal 50% kebutuhan listrik mereka dari sumber terbarukan per tahun 2030.</p>
              <p>Kesepakatan ini diprediksi akan membuka jutaan lapangan kerja hijau baru di bidang teknik sipil, panel surya, turbin angin, dan management grid cerdas berbasis AI.</p>`,
    image: 'https://picsum.photos/800/400?random=4',
    link: 'https://bbc.com/climate-summit-2026',
    publishedAt: '16 Agu 2026, 08:20',
    category: 'Berita',
    isRead: true,
    isStarred: false
  }
]

// State variables
const feeds = ref([])
const articles = ref([])
const activeArticleId = ref(null)
const activeFilter = ref('all') // 'all', 'starred', 'unread', 'cat:Category', 'feed:FeedId'
const searchQuery = ref('')
const isRefreshing = ref(false)
const isAddModalOpen = ref(false)
const isMobileReaderActive = ref(false)

const activeSubTab = ref('dashboard')

// Edit Feed state
const isEditModalOpen = ref(false)
const feedToEdit = ref(null)
const editFeedUrl = ref('')
const editFeedName = ref('')
const editFeedCategory = ref('Teknologi')

// Add Feed Form State
const newFeedUrl = ref('')
const newFeedName = ref('')
const newFeedCategory = ref('Teknologi')

// Dynamic Category Management state
const customCategories = ref([])
const showNewCatInput = ref(false)
const newCatValue = ref('')
const newCatInputRef = ref(null)

const addNewCategory = () => {
  const cat = newCatValue.value.trim()
  if (!cat) return
  if (!customCategories.value.includes(cat)) {
    customCategories.value.push(cat)
    localStorage.setItem('taskflow_rss_categories', JSON.stringify(customCategories.value))
    showToast(`Kategori "${cat}" berhasil ditambahkan!`)
  }
  newCatValue.value = ''
  showNewCatInput.value = false
}

const handleCatBlur = () => {
  setTimeout(() => {
    showNewCatInput.value = false
    newCatValue.value = ''
  }, 150)
}

watch(showNewCatInput, (val) => {
  if (val) {
    nextTick(() => {
      if (newCatInputRef.value) {
        newCatInputRef.value.focus()
      }
    })
  }
})

// Reading Time Estimator
const getReadingTime = (content) => {
  if (!content) return '1 menit baca'
  const text = content.replace(/<[^>]*>/g, '')
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return `${minutes} menit baca`
}

// Toast State
const toastMessage = ref('')

// Selected article computer
const activeArticle = computed(() => {
  return articles.value.find(a => a.id === activeArticleId.value) || null
})

// Feed Metadata Helper Computeds
const getFeedName = (feedId) => {
  return feeds.value.find(f => f.id === feedId)?.name || 'Feed RSS'
}

const getFeedFavicon = (feedId) => {
  return feeds.value.find(f => f.id === feedId)?.favicon || '📰'
}

// Categories list computed from feeds
const categories = computed(() => {
  const cats = new Set(['Teknologi', 'Desain', 'Berita', 'Lainnya'])
  customCategories.value.forEach(c => cats.add(c))
  feeds.value.forEach(f => {
    if (f.category) cats.add(f.category)
  })
  return Array.from(cats)
})

// Starred articles count
const starredCount = computed(() => {
  return articles.value.filter(a => a.isStarred).length
})

// Total unread articles count
const totalUnreadCount = computed(() => {
  return articles.value.filter(a => !a.isRead).length
})

// Filtered articles list based on active sidebar selection & search query
const filteredArticles = computed(() => {
  return articles.value.filter(article => {
    // 1. Search Query filter
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    if (!matchesSearch) return false

    // 2. Sidebar Navigation Filter
    if (activeFilter.value === 'all') return true
    if (activeFilter.value === 'starred') return article.isStarred
    if (activeFilter.value === 'unread') return !article.isRead
    
    if (activeFilter.value.startsWith('cat:')) {
      const targetCat = activeFilter.value.replace('cat:', '')
      return article.category === targetCat
    }

    if (activeFilter.value.startsWith('feed:')) {
      const targetFeedId = activeFilter.value.replace('feed:', '')
      return article.feedId === targetFeedId
    }

    return true
  }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)) // Latest first
})

// Select active article
const selectArticle = (article) => {
  activeArticleId.value = article.id
  article.isRead = true
  isMobileReaderActive.value = true
  saveToLocalStorage()
}

// Select sidebar filter
const selectFilter = (filterKey) => {
  activeFilter.value = filterKey
}

// Toggle starred state
const toggleStar = (article) => {
  article.isStarred = !article.isStarred
  showToast(article.isStarred ? 'Ditambahkan ke artikel favorit!' : 'Dihapus dari artikel favorit.')
  saveToLocalStorage()
}

// Mark all articles in current filtered list as read
const markAllAsRead = () => {
  filteredArticles.value.forEach(a => {
    a.isRead = true
  })
  showToast('Semua artikel ditandai sudah dibaca.')
  saveToLocalStorage()
}

// Simulation of refreshing feeds
const refreshFeeds = () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  
  setTimeout(() => {
    isRefreshing.value = false
    
    // Add a new simulated article to show refresh works
    const newId = 'a_new_' + Date.now()
    const now = new Date()
    const dateStr = `${now.getDate()} Agu 2026, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    const freshArticle = {
      id: newId,
      feedId: 'f1',
      title: 'Membongkar Fitur Terbaru Vue 3.6 - Reaktivitas Tanpa Beban',
      author: 'Evan You',
      summary: 'Tim inti Vue baru saja meluncurkan versi beta Vue 3.6 dengan optimasi virtual DOM compiler baru yang menaikkan FPS rendering hingga 2x lipat.',
      content: `<p>Vue 3.6 memperkenalkan Vapor Mode secara opsional untuk rendering bebas Virtual DOM yang sangat cepat untuk komponen statis. Ini adalah tonggak sejarah baru dalam optimalisasi library frontend.</p>
                <p>Fitur unggulan di rilis 3.6:</p>
                <ul>
                  <li><strong>Vapor Mode:</strong> Menghilangkan overhead VDOM untuk aplikasi berskala ultra-besar.</li>
                  <li><strong>CSS-in-JS native integration:</strong> Pengikatan class style yang lebih cepat dan efisien.</li>
                  <li><strong>Memory Leak Inspector:</strong> Tools baru di Vue DevTools untuk mendeteksi reaktivitas yang tidak dihancurkan.</li>
                </ul>`,
      image: 'https://picsum.photos/800/400?random=5',
      link: 'https://dev.to/vue-3-6-release',
      publishedAt: dateStr,
      category: 'Teknologi',
      isRead: false,
      isStarred: false
    }

    articles.value.unshift(freshArticle)
    showToast('Feed RSS berhasil diperbarui!')
    saveToLocalStorage()
  }, 1500)
}

// Confirm Delete Feed
const confirmDeleteFeed = (feed) => {
  if (confirm(`Hapus saluran feed "${feed.name}" beserta artikelnya?`)) {
    feeds.value = feeds.value.filter(f => f.id !== feed.id)
    articles.value = articles.value.filter(a => a.feedId !== feed.id)
    
    if (activeArticle.value && activeArticle.value.feedId === feed.id) {
      activeArticleId.value = null
      isMobileReaderActive.value = false
    }
    
    if (activeFilter.value === `feed:${feed.id}`) {
      activeFilter.value = 'all'
    }
    
    showToast(`Feed "${feed.name}" berhasil dihapus.`)
    saveToLocalStorage()
  }
}

// Add New Feed RSS Action (Simulation)
const addNewFeed = () => {
  if (!newFeedUrl.value) return
  
  const newId = 'f_' + Date.now()
  const customName = newFeedName.value.trim() || new URL(newFeedUrl.value).hostname || 'Custom Feed'
  
  const newFeedItem = {
    id: newId,
    name: customName,
    url: newFeedUrl.value,
    category: newFeedCategory.value,
    favicon: '📡'
  }

  feeds.value.push(newFeedItem)

  // Generate some realistic mock articles for this newly added feed
  const newArticles = [
    {
      id: 'a_add_1_' + Date.now(),
      feedId: newId,
      title: `Artikel Terbaru dari ${customName}`,
      author: 'Admin',
      summary: `Ini adalah artikel simulasi yang dihasilkan setelah Anda menambahkan RSS feed dari ${newFeedUrl.value}.`,
      content: `<p>Selamat! Anda berhasil menguji pengerjaan integrasi UI/UX RSS Feed.</p>
                <p>URL feed yang Anda tambahkan adalah: <code>${newFeedUrl.value}</code>.</p>
                <p>Ketika sistem backend dihubungkan nanti, sistem akan otomatis melakukan polling XML parse dan menyimpannya di database Anda agar sinkron secara real-time.</p>`,
      image: 'https://picsum.photos/800/400?random=10',
      link: newFeedUrl.value,
      publishedAt: 'Baru saja',
      category: newFeedCategory.value,
      isRead: false,
      isStarred: false
    }
  ]

  articles.value.unshift(...newArticles)

  // Reset form
  newFeedUrl.value = ''
  newFeedName.value = ''
  newFeedCategory.value = 'Teknologi'
  isAddModalOpen.value = false
  
  showToast(`Feed "${customName}" berhasil ditambahkan!`)
  saveToLocalStorage()
}

const startEditFeed = (feed) => {
  feedToEdit.value = feed
  editFeedUrl.value = feed.url
  editFeedName.value = feed.name
  editFeedCategory.value = feed.category || 'Lainnya'
  isEditModalOpen.value = true
}

const saveEditFeed = () => {
  if (!feedToEdit.value || !editFeedUrl.value) return
  
  const oldCategory = feedToEdit.value.category
  const newCategory = editFeedCategory.value
  
  // Update feed object
  feedToEdit.value.url = editFeedUrl.value
  feedToEdit.value.name = editFeedName.value.trim() || 'Custom Feed'
  feedToEdit.value.category = newCategory
  
  // Also update articles belonging to this feed with the new category
  articles.value.forEach(article => {
    if (article.feedId === feedToEdit.value.id) {
      article.category = newCategory
    }
  })
  
  saveToLocalStorage()
  isEditModalOpen.value = false
  feedToEdit.value = null
  showToast('Saluran feed berhasil diperbarui!')
}

const deleteCategory = (cat) => {
  customCategories.value = customCategories.value.filter(c => c !== cat)
  localStorage.setItem('taskflow_rss_categories', JSON.stringify(customCategories.value))
  
  // Update any feed that is using the deleted category to "Lainnya"
  feeds.value.forEach(f => {
    if (f.category === cat) {
      f.category = 'Lainnya'
    }
  })
  
  // Update any article using the deleted category to "Lainnya"
  articles.value.forEach(a => {
    if (a.category === cat) {
      a.category = 'Lainnya'
    }
  })
  
  saveToLocalStorage()
  showToast(`Kategori "${cat}" berhasil dihapus.`)
}

// Save Article to Quick Notes (Cross-module action)
const saveToNotes = (article) => {
  // Convert HTML content from article to simple Markdown format for note editor
  const cleanMarkdown = `# ${article.title}
*Disalin dari: ${getFeedName(article.feedId)} (${article.link})*
*Tanggal Publikasi: ${article.publishedAt}*

---

${article.summary}

### Isi Artikel:
${article.content.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n').replace(/<h3>/g, '### ').replace(/<\/h3>/g, '\n').replace(/<li>/g, '* ').replace(/<\/li>/g, '').replace(/<ul>/g, '').replace(/<\/ul>/g, '')}
`
  // Emit the event to parent layout so it can call QuickNotes.vue definExpose method
  emit('save-to-notes', {
    title: `📰 RSS: ${article.title.substring(0, 40)}`,
    content: cleanMarkdown,
    tags: ['RSS', article.category]
  })

  showToast('Artikel berhasil disimpan ke Quick Notes! 🚀')
}

// Toast Helper
const showToast = (message) => {
  toastMessage.value = message
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

// Local Storage sync
const saveToLocalStorage = () => {
  localStorage.setItem('taskflow_rss_feeds', JSON.stringify(feeds.value))
  localStorage.setItem('taskflow_rss_articles', JSON.stringify(articles.value))
}

onMounted(() => {
  // Load custom categories
  const localCats = localStorage.getItem('taskflow_rss_categories')
  if (localCats) {
    try {
      customCategories.value = JSON.parse(localCats)
    } catch (e) {
      customCategories.value = ['Teknologi', 'Desain', 'Berita', 'Lainnya']
    }
  } else {
    customCategories.value = ['Teknologi', 'Desain', 'Berita', 'Lainnya']
    localStorage.setItem('taskflow_rss_categories', JSON.stringify(customCategories.value))
  }

  // Load feeds
  const localFeeds = localStorage.getItem('taskflow_rss_feeds')
  if (localFeeds) {
    try {
      feeds.value = JSON.parse(localFeeds)
    } catch (e) {
      feeds.value = [...INITIAL_FEEDS]
    }
  } else {
    feeds.value = [...INITIAL_FEEDS]
  }

  // Load articles
  const localArticles = localStorage.getItem('taskflow_rss_articles')
  if (localArticles) {
    try {
      articles.value = JSON.parse(localArticles)
    } catch (e) {
      articles.value = [...INITIAL_ARTICLES]
    }
  } else {
    articles.value = [...INITIAL_ARTICLES]
  }
  
  saveToLocalStorage()
})
</script>

<style scoped>
.rss-module-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px); /* Fill screen height nicely */
  width: 100%;
  background-color: var(--color-paper);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

/* Sub-tab Layout Styles */
.rss-top-tabs {
  display: flex;
  background-color: var(--color-panel);
  border-bottom: 1px solid var(--color-border);
  padding: 8px 16px 0;
  gap: 8px;
}

.rss-tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: none;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  color: var(--color-muted);
  font-family: 'Inter', sans-serif;
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  top: 1px;
}

.rss-tab-btn:hover {
  color: var(--color-ink);
  background-color: rgba(0, 0, 0, 0.02);
}

.rss-tab-btn.is-active {
  color: var(--color-brand);
  background-color: var(--color-paper);
  border-color: var(--color-border);
  font-weight: 600;
}

.rss-tab-btn.is-active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-paper);
}

.rss-tab-content {
  flex-grow: 1;
  overflow: hidden;
  height: 100%;
  position: relative;
}

/* Widescreen Dashboard View Styles */
.rss-dashboard-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.rss-filters-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: var(--color-panel);
  border-bottom: 1px solid var(--color-border);
  overflow-x: auto;
  scrollbar-width: none;
  white-space: nowrap;
}

.rss-filters-bar::-webkit-scrollbar {
  display: none;
}

.rss-filter-chip {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 99px;
  border: 1px solid var(--color-border);
  background-color: var(--color-paper);
  color: var(--color-muted);
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.rss-filter-chip:hover {
  color: var(--color-ink);
  border-color: var(--color-muted);
}

.rss-filter-chip.is-active {
  background-color: var(--color-brand);
  color: #FFFFFF;
  border-color: var(--color-brand);
}

.filter-divider {
  width: 1px;
  height: 16px;
  background-color: var(--color-border);
  margin: 0 4px;
  flex-shrink: 0;
}

.rss-dashboard-main {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
  height: calc(100% - 49px);
}

/* Management Layout Styles */
.rss-manage-view {
  padding: 24px;
  overflow-y: auto;
  height: 100%;
  background-color: var(--color-panel);
}

.rss-manage-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .rss-manage-grid {
    grid-template-columns: 320px 1fr;
  }
}

.manage-card {
  background-color: var(--color-paper);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
}

.card-header-row h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-ink);
  margin: 0;
}

.btn-add-cat, .btn-add-feed {
  padding: 6px 12px;
  background-color: var(--color-brand);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-add-cat:hover, .btn-add-feed:hover {
  opacity: 0.9;
}

.categories-list-scroll {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-panel);
}

.feeds-table-container {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.feeds-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  text-align: left;
}

.feeds-table th {
  background-color: var(--color-panel);
  padding: 12px;
  font-weight: 600;
  color: var(--color-muted);
  border-bottom: 1px solid var(--color-border);
}

.feeds-table td {
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-ink);
}

.feeds-table tr:last-child td {
  border-bottom: none;
}

.feed-cell-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.feed-favicon-cell {
  font-size: 16px;
}

.feed-url-code {
  font-family: monospace;
  font-size: 11px;
  color: var(--color-muted);
  background-color: var(--color-panel);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.feed-cat-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 11px;
  border-radius: 99px;
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  color: var(--color-muted);
}

.actions-cell {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.btn-icon-action {
  background: none;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
}

.btn-icon-action:hover {
  background-color: var(--color-panel);
}

.btn-icon-action.edit-btn:hover {
  color: var(--color-brand);
}

.btn-icon-action.delete-btn:hover {
  color: var(--color-signal);
}

.new-cat-input-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--color-brand);
  background-color: var(--color-paper);
  border-radius: var(--radius-sm);
  padding: 2px 4px;
  margin: 4px 8px 12px 8px;
}

.new-cat-field {
  border: none;
  background: transparent;
  color: var(--color-ink);
  font-size: var(--text-xs);
  padding: 2px;
  width: 100%;
  outline: none;
}

.save-cat-btn {
  background-color: var(--color-brand);
  color: #FFFFFF;
  border: none;
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 2px;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

.save-cat-btn:hover {
  background-color: var(--color-brand-dark);
}

.feed-count {
  font-size: 10px;
  background-color: rgba(27, 31, 59, 0.08);
  color: var(--color-muted);
  padding: 1px 6px;
  border-radius: 10px;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-muted);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  margin-bottom: 2px;
}

.sidebar-nav-item:hover {
  background-color: var(--color-paper);
  color: var(--color-ink);
}

.sidebar-nav-item.is-active {
  background-color: rgba(62, 76, 138, 0.08);
  color: var(--color-brand);
  font-weight: 600;
}

.sidebar-nav-item .nav-badge {
  margin-left: auto;
  font-size: 10px;
  background-color: rgba(62, 76, 138, 0.15);
  color: var(--color-brand);
  padding: 2px 6px;
  border-radius: 99px;
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 600;
}

.sidebar-nav-item .nav-badge-starred {
  background-color: rgba(184, 134, 11, 0.15);
  color: var(--color-warning);
}

.sidebar-nav-item.sub-item {
  padding-left: 20px;
  font-size: 12px;
}

/* Feeds Channel List */
.feeds-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.feed-channel-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.feed-channel-item:hover {
  background-color: var(--color-paper);
}

.feed-channel-item.is-active {
  background-color: rgba(62, 76, 138, 0.08);
  color: var(--color-brand);
}

.feed-favicon {
  font-size: 16px;
  flex-shrink: 0;
}

.feed-channel-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-grow: 1;
}

.feed-channel-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feed-channel-url {
  font-size: 10px;
  color: var(--color-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-feed-btn {
  opacity: 0;
  position: absolute;
  right: 6px;
  background: rgba(232, 86, 47, 0.1);
  color: var(--color-signal);
  border: none;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 11px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.feed-channel-item:hover .delete-feed-btn {
  opacity: 1;
}

/* 2. Middle Column: Articles list */
.rss-articles-list {
  width: 360px;
  min-width: 360px;
  border-right: 1px solid var(--color-border);
  background-color: var(--color-paper);
  display: flex;
  flex-direction: column;
  height: 100%;
}

:root[data-theme="dark"] .rss-articles-list {
  background-color: #0d1321;
}

.list-header {
  padding: 16px;
  background-color: var(--color-panel);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-bar {
  flex-grow: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--color-muted);
}

.rss-search-input {
  width: 100%;
  padding: 6px 10px 6px 28px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  background-color: var(--color-paper);
  color: var(--color-ink);
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;
}

.rss-search-input:focus {
  border-color: var(--color-brand);
  background-color: var(--color-panel);
  outline: none;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: var(--color-paper);
  color: var(--color-ink);
}

.articles-scroll {
  flex-grow: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rss-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--color-muted);
  gap: 12px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(62, 76, 138, 0.1);
  border-top-color: var(--color-brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.rotating {
  animation: spin 1.5s linear infinite;
}

.rss-empty-articles {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-muted);
}

.rss-empty-articles .empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
  display: block;
}

.rss-empty-articles h4 {
  color: var(--color-ink);
  margin-bottom: 6px;
}

/* Article Card */
.article-item-card {
  padding: 18px;
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.article-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: var(--color-brand);
}

.article-item-card.is-active {
  border-color: var(--color-brand);
  background-color: var(--color-paper);
  box-shadow: 0 4px 16px rgba(62, 76, 138, 0.08);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.article-source-tag {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-brand);
  background-color: rgba(62, 76, 138, 0.06);
  padding: 3px 8px;
  border-radius: 4px;
}

.article-dot {
  width: 6px;
  height: 6px;
  background-color: var(--color-brand);
  border-radius: 50%;
  flex-shrink: 0;
}

.article-time {
  font-size: 11px;
  color: var(--color-muted);
  font-family: 'Inter', sans-serif;
  margin-left: auto;
}

.article-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-ink);
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.article-item-card.is-read .article-title {
  color: var(--color-muted);
  font-weight: 500;
}

.article-summary {
  font-size: 12.5px;
  color: var(--color-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.footer-meta-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.article-category-badge {
  font-size: 10px;
  color: var(--color-muted);
  border: 1px solid var(--color-border);
  padding: 2px 6px;
  border-radius: 4px;
}

.article-reading-time {
  font-size: 10px;
  color: var(--color-muted);
}

.star-btn {
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.star-btn:hover {
  background-color: var(--color-paper);
  color: var(--color-warning);
}

/* 3. Right Column: Reader Pane */
.rss-reader-pane {
  flex-grow: 1;
  background-color: var(--color-panel);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.reader-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.reader-toolbar {
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-panel);
  z-index: 5;
}

.source-pill {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-ink);
  background-color: var(--color-paper);
  padding: 6px 12px;
  border-radius: 99px;
  border: 1px solid var(--color-border);
}

.reader-actions-right {
  display: flex;
  gap: 8px;
}

.btn-action-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background-color: var(--color-success);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-family: 'Inter', sans-serif;
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-action-primary:hover {
  background-color: #26634c;
}

.btn-action-secondary {
  padding: 8px 12px;
  background-color: var(--color-paper);
  color: var(--color-ink);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: 'Inter', sans-serif;
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action-secondary:hover {
  border-color: var(--color-muted);
}

.reader-content-scroll {
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.article-hero-banner {
  width: 100%;
  max-height: 250px;
  overflow: hidden;
  border-bottom: 1px solid var(--color-border);
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-body-wrapper {
  padding: 32px;
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
}

.article-header-info {
  margin-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 20px;
}

.reader-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 26px;
  font-weight: 700;
  color: var(--color-ink);
  line-height: 1.3;
  margin-bottom: 12px;
}

.reader-meta {
  display: flex;
  gap: 8px;
  font-size: 13px;
  color: var(--color-muted);
}

.meta-separator {
  color: var(--color-border);
}

/* Beautiful Typography for Article Content */
.reader-article-body {
  font-family: 'Lora', 'Georgia', serif;
  font-size: 16.5px;
  line-height: 1.85;
  color: var(--color-ink);
  margin-bottom: 40px;
  letter-spacing: -0.003em;
}

.reader-article-body :deep(p) {
  margin-bottom: 24px;
}

.reader-article-body :deep(h3) {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 20px;
  font-weight: 700;
  margin-top: 40px;
  margin-bottom: 16px;
  color: var(--color-ink);
}

.reader-article-body :deep(ul),
.reader-article-body :deep(ol) {
  margin-bottom: 24px;
  padding-left: 24px;
}

.reader-article-body :deep(li) {
  margin-bottom: 10px;
}

.reader-article-body :deep(pre) {
  background-color: #1e293b;
  color: #f8fafc;
  padding: 16px;
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin-bottom: 20px;
}

.reader-article-body :deep(pre code) {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
}

.reader-footer-actions {
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--color-border);
  padding-top: 24px;
  margin-top: 40px;
}

.visit-original-btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  background-color: var(--color-paper);
  color: var(--color-brand);
  border: 1px solid var(--color-brand);
  border-radius: var(--radius-md);
  font-weight: 600;
  text-decoration: none;
  font-size: var(--text-sm);
  transition: all 0.2s;
}

.visit-original-btn:hover {
  background-color: var(--color-brand);
  color: white;
}

.reader-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  color: var(--color-muted);
}

.reader-empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.reader-empty-state h3 {
  color: var(--color-ink);
  margin-bottom: 8px;
}

.reader-empty-state p {
  max-width: 320px;
  font-size: var(--text-sm);
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 460px;
  overflow: hidden;
  box-shadow: var(--shadow-modal);
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--color-muted);
  cursor: pointer;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-ink);
}

.form-input, .form-select {
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-paper);
  color: var(--color-ink);
  font-family: 'Inter', sans-serif;
  font-size: var(--text-sm);
  width: 100%;
}

.form-input:focus, .form-select:focus {
  border-color: var(--color-brand);
  outline: none;
}

.form-help {
  font-size: 11px;
  color: var(--color-muted);
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background-color: var(--color-paper);
}

:root[data-theme="dark"] .modal-footer {
  background-color: #0b0f19;
}

.btn-cancel {
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  background: none;
  color: var(--color-ink);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--text-sm);
}

.btn-submit {
  padding: 8px 16px;
  background-color: var(--color-brand);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: var(--text-sm);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Toast styling */
.rss-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background-color: var(--color-ink);
  color: var(--color-paper);
  padding: 12px 20px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-modal);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-sm);
  font-weight: 500;
}

:root[data-theme="dark"] .rss-toast {
  background-color: #f1f5f9;
  color: #0f172a;
}

/* Responsive styles */
@media (max-width: 1024px) {
  .rss-sidebar {
    width: 220px;
    min-width: 220px;
  }
  .rss-articles-list {
    width: 300px;
    min-width: 300px;
  }
}

@media (max-width: 768px) {
  .rss-dashboard {
    height: calc(100vh - 70px);
  }

  .rss-sidebar {
    display: none;
  }

  .rss-articles-list {
    width: 100%;
    min-width: 100%;
  }

  .rss-reader-pane {
    display: none;
  }

  .mobile-reader-active .rss-articles-list {
    display: none;
  }

  .mobile-reader-active .rss-reader-pane {
    display: flex;
    width: 100%;
  }

  .reader-content-scroll {
    padding: 0;
  }

  .article-body-wrapper {
    padding: 16px;
  }

  .reader-title {
    font-size: 20px;
  }
}
</style>
