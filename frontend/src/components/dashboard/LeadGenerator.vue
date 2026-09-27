<template>
  <div class="lead-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h2 class="title">Lead Generator</h2>
        <p class="subtitle">Cari tempat usaha dan data kontak di sekitar lokasi target.</p>
      </div>

      <div class="header-actions">
        <button class="btn-subtle" @click="copyAllContacts" :disabled="leads.length === 0" title="Salin nomor kontak">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          <span>{{ copiedContacts ? 'Tersalin' : 'Salin Kontak' }}</span>
        </button>
        <button class="btn-subtle" @click="exportToCsv" :disabled="leads.length === 0" title="Download data CSV">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>Unduh CSV</span>
        </button>
      </div>
    </div>

    <!-- Search Box -->
    <div class="search-card">
      <form @submit.prevent="handleSearch" class="search-bar">
        <div class="search-field flex-2">
          <label>Kategori / Tempat</label>
          <div class="input-wrap">
            <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              v-model="searchKeyword" 
              placeholder="Masukkan jenis tempat usaha (misal: Tukang Cukur, Kafe, Bengkel...)"
              required
            />
          </div>
        </div>

        <div class="search-field flex-2">
          <div class="field-label-row">
            <label>Lokasi / Alamat</label>
            <button 
              type="button" 
              class="btn-text-link" 
              @click="getUserCurrentLocation(true)"
              :disabled="isLocating"
              title="Gunakan posisi riil saya saat ini"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
              <span>{{ isLocating ? 'Mencari...' : 'Pakai Lokasi Saya' }}</span>
            </button>
          </div>
          <div class="input-wrap">
            <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <input 
              type="text" 
              v-model="searchLocation" 
              placeholder="Masukkan kota, kecamatan, atau alamat target..."
              required
            />
            <button 
              type="button" 
              class="btn-input-gps" 
              @click="getUserCurrentLocation(true)"
              :disabled="isLocating"
              title="Deteksi lokasi riil saya (GPS)"
            >
              <svg v-if="!isLocating" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
              <span v-else class="gps-spinner"></span>
            </button>
          </div>
        </div>

        <div class="search-field radius-select-field">
          <label>Radius</label>
          <div class="input-wrap">
            <select v-model.number="searchRadius" @change="onRadiusChange">
              <option :value="1">1 km</option>
              <option :value="2">2 km</option>
              <option :value="3">3 km</option>
              <option :value="5">5 km</option>
              <option :value="10">10 km</option>
              <option :value="20">20 km</option>
              <option :value="0">Semua Jarak</option>
            </select>
          </div>
        </div>

        <div class="search-action">
          <button type="submit" class="btn-primary" :disabled="isSearching">
            <svg v-if="!isSearching" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span v-else class="btn-spinner"></span>
            <span>{{ isSearching ? 'Mencari...' : 'Cari' }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Metrics Bar -->
    <div class="metrics-bar" v-if="leads.length > 0">
      <div class="metric-item">
        <span class="live-pulse-badge"></span>
        <span class="metric-label">Google Maps Riil</span>
        <span class="metric-value">{{ leads.length }} tempat</span>
      </div>
      <div class="metric-divider"></div>
      <div class="metric-item">
        <span class="metric-label">Pusat Lokasi</span>
        <span class="metric-value">{{ currentSearchPoint.name }}</span>
      </div>
      <div class="metric-divider"></div>
      <div class="metric-item">
        <span class="metric-label">Radius</span>
        <span class="metric-value">{{ searchRadius > 0 ? `${searchRadius} km` : 'Semua Area' }}</span>
      </div>
      <div class="metric-divider"></div>
      <div class="metric-item">
        <span class="metric-label">Rata-rata Rating</span>
        <span class="metric-value">★ {{ averageRating }} / 5.0</span>
      </div>
      <div class="metric-divider"></div>
      <div class="metric-item">
        <span class="metric-label">Ada No. Kontak</span>
        <span class="metric-value">{{ leadsWithPhoneCount }} dari {{ leads.length }} tempat</span>
      </div>
    </div>

    <!-- Map View -->
    <div 
      class="map-card" 
      :class="{ 'is-fullscreen': isFullscreen }" 
      ref="mapCardRef"
    >
      <div class="map-header">
        <div class="map-title-row">
          <span class="dot-indicator"></span>
          <span class="map-title">Peta Persebaran & Radius</span>
          <span class="map-meta" v-if="searchKeyword && searchLocation">({{ searchKeyword }} di sekitar {{ searchLocation }})</span>
          <span class="map-meta" v-else-if="currentSearchPoint.name">({{ currentSearchPoint.name }})</span>
          <span v-if="isFullscreen" class="esc-hint">Tekan ESC untuk keluar</span>
        </div>

        <div class="map-controls">
          <button 
            class="btn-map-tool" 
            @click="getUserCurrentLocation(true)" 
            :disabled="isLocating"
            title="Arahkan peta ke posisi riil saya saat ini"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
            <span>{{ isLocating ? 'Mencari...' : 'Lokasi Saya' }}</span>
          </button>

          <button class="btn-map-tool" @click="recenterMap" title="Pusatkan kembali ke radius pencarian">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
            <span>Pusatkan</span>
          </button>

          <button 
            class="btn-map-tool btn-fullscreen" 
            :class="{ 'btn-active': isFullscreen }" 
            @click="toggleFullscreen" 
            :title="isFullscreen ? 'Keluar Layar Penuh (Esc)' : 'Perbesar Peta ke Layar Penuh'"
          >
            <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>
            <span>{{ isFullscreen ? 'Keluar' : 'Layar Penuh' }}</span>
          </button>
        </div>
      </div>

      <!-- Map Element -->
      <div class="map-canvas" ref="mapContainerRef"></div>

      <!-- Active Pin Drawer / Popover (bottom right) -->
      <transition name="card-pop">
        <div class="active-place-card" v-if="selectedLead">
          <!-- Subtle Glow Accent -->
          <div class="card-glow-bg"></div>

          <div class="place-header">
            <div class="header-badges">
              <span class="place-category-chip">
                {{ (selectedLead.category || 'Tempat Usaha').replace(/[\uE000-\uF8FF]/g, '').trim() }}
              </span>
              <span class="status-pill" :class="selectedLead.isOpen ? 'is-open' : 'is-closed'">
                <span class="status-dot"></span>
                {{ selectedLead.isOpen ? 'Buka' : 'Tutup' }}
              </span>
              <span class="gmaps-chip" v-if="selectedLead.isRealGoogleMaps">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Google Maps
              </span>
            </div>
            <button class="btn-close-card" @click="selectedLead = null" aria-label="Tutup" title="Tutup">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <h4 class="place-name">{{ selectedLead.name }}</h4>

          <div class="place-address-row">
            <svg class="addr-pin-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span class="place-address-text">{{ selectedLead.address }}</span>
          </div>

          <!-- Highlight Metric Chips -->
          <div class="place-chips-row">
            <div class="metric-chip rating-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <span>{{ selectedLead.rating }}</span>
              <span class="chip-sub">({{ selectedLead.reviews }} ulasan)</span>
            </div>

            <div class="metric-chip distance-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
              <span>{{ selectedLead.distanceText }}</span>
            </div>
          </div>

          <!-- Action Buttons Stack -->
          <div class="place-action-stack">
            <!-- Primary WhatsApp Button -->
            <a 
              v-if="selectedLead.phoneRaw"
              :href="'https://wa.me/' + selectedLead.phoneRaw" 
              target="_blank" 
              class="btn-wa-primary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span class="wa-main-text">Hubungi via WhatsApp</span>
              <span class="wa-sub-text" v-if="selectedLead.phoneFormatted">({{ selectedLead.phoneFormatted }})</span>
            </a>

            <!-- Secondary Actions Grid -->
            <div class="secondary-btn-grid">
              <a 
                v-if="selectedLead.maps_url" 
                :href="selectedLead.maps_url" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn-action-ghost"
                title="Buka langsung di Google Maps"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                <span>Google Maps</span>
              </a>
              <button class="btn-action-ghost" @click="openLeadDetails(selectedLead)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <span>Detail Tempat</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Table Section -->
    <div class="table-card">
      <div class="table-header">
        <div>
          <div class="table-title-row">
            <h3 class="table-title">Daftar Tempat Usaha</h3>
            <span class="badge-gmaps-verified" v-if="leads.length > 0">✓ 100% Real Google Maps Scraper</span>
          </div>
          <p class="table-subtitle" v-if="leads.length > 0">Data langsung dari hasil scraping Google Maps Playwright. Klik baris untuk melihat posisi di peta.</p>
          <p class="table-subtitle" v-else>Hasil pencarian masih kosong. Silakan isi form pencarian di atas lalu klik tombol Cari.</p>
        </div>

        <div class="table-search">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            v-model="tableFilterText" 
            placeholder="Saring nama, alamat, atau layanan..."
          />
        </div>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 40px;">No</th>
              <th>Nama Tempat</th>
              <th style="width: 130px;">Rating</th>
              <th>Alamat</th>
              <th style="width: 100px;">Jarak</th>
              <th style="width: 170px;">WhatsApp / Telepon</th>
              <th style="width: 130px;">Jam Buka</th>
              <th>Perkiraan Tarif & Layanan</th>
              <th style="width: 110px; text-align: center;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(lead, idx) in filteredLeads" 
              :key="lead.id" 
              :class="{ 'is-selected': selectedLead?.id === lead.id }"
              @click="focusLeadOnMap(lead)"
            >
              <td class="cell-index">{{ idx + 1 }}</td>
              
              <!-- Nama -->
              <td class="cell-name">
                <div class="name-box">
                  <span class="place-title">{{ lead.name }}</span>
                  <span class="place-sub">{{ lead.category }}</span>
                </div>
              </td>

              <!-- Rating -->
              <td class="cell-rating">
                <div class="rating-display">
                  <span class="rating-stars">★ {{ lead.rating }}</span>
                  <span class="review-count">({{ lead.reviews }})</span>
                </div>
              </td>

              <!-- Alamat -->
              <td class="cell-address">
                <span class="text-clamp">{{ lead.address }}</span>
              </td>

              <!-- Jarak -->
              <td class="cell-distance">
                <span class="distance-tag">{{ lead.distanceText }}</span>
              </td>

              <!-- Kontak -->
              <td class="cell-contact" @click.stop>
                <div class="contact-row">
                  <a :href="'https://wa.me/' + lead.phoneRaw" target="_blank" class="contact-link" title="Kirim Pesan WhatsApp">
                    {{ lead.phoneFormatted }}
                  </a>
                  <button class="btn-copy-inline" @click="copyText(lead.phoneFormatted)" title="Salin nomor">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  </button>
                </div>
              </td>

              <!-- Jam Operasional -->
              <td class="cell-hours">
                <span :class="['badge-status', lead.isOpen ? 'open' : 'closed']">
                  {{ lead.isOpen ? 'Buka' : 'Tutup' }}
                </span>
                <span class="hours-sub">{{ lead.hours }}</span>
              </td>

              <!-- Layanan & Tarif -->
              <td class="cell-services">
                <div class="price-val">{{ lead.priceRange }}</div>
                <div class="service-desc">{{ lead.features }}</div>
              </td>

              <!-- Aksi -->
              <td class="cell-actions" @click.stop>
                <div class="action-btn-group">
                  <a 
                    v-if="lead.maps_url" 
                    :href="lead.maps_url" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="btn-icon" 
                    title="Buka langsung di Google Maps"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </a>
                  <button class="btn-icon" @click="focusLeadOnMap(lead)" title="Lihat di Peta">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </button>
                  <button class="btn-icon" @click="openLeadDetails(lead)" title="Detail Lengkap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  </button>
                </div>
              </td>
            </tr>

            <!-- Baris Loading saat sedang scraping secara live -->
            <tr v-if="isSearching">
              <td colspan="9" class="cell-empty">
                <div class="empty-state-box">
                  <div class="scraper-live-spinner"></div>
                  <p style="font-weight: 600; color: var(--color-ink); margin-bottom: 4px; margin-top: 12px;">Sedang Mengambil Data Riil dari Google Maps...</p>
                  <p style="font-size: 12px; color: var(--color-muted); max-width: 440px; margin: 0 auto;">Bot Playwright sedang membuka Google Maps untuk mengekstrak tempat usaha terverifikasi secara langsung. Mohon tunggu beberapa detik.</p>
                </div>
              </td>
            </tr>

            <!-- Baris Kosong jika belum ada pencarian atau hasil kosong -->
            <tr v-else-if="leads.length === 0">
              <td colspan="9" class="cell-empty">
                <div class="empty-state-box">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-muted); margin-bottom: 8px;">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <p style="font-weight: 600; color: var(--color-ink); margin-bottom: 4px;">Hasil Pencarian Masih Kosong</p>
                  <p style="font-size: 12px; color: var(--color-muted); max-width: 420px; margin: 0 auto;">Silakan masukkan kata kunci kategori usaha dan lokasi target pada form di atas, lalu klik <strong>Cari</strong>.</p>
                </div>
              </td>
            </tr>

            <!-- Baris Kosong jika filter tidak cocok -->
            <tr v-else-if="filteredLeads.length === 0">
              <td colspan="9" class="cell-empty">
                <p>Tidak ada hasil yang sesuai dengan kata kunci pencarian tabel.</p>
                <button class="btn-subtle-sm" @click="tableFilterText = ''">Hapus Filter</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Detail Tempat -->
    <div class="modal-backdrop" v-if="detailModalLead" @click.self="detailModalLead = null">
      <div class="modal-card">
        <div class="modal-head">
          <div>
            <span class="modal-badge">{{ detailModalLead.category }}</span>
            <h3 class="modal-title">{{ detailModalLead.name }}</h3>
          </div>
          <button class="btn-close-modal" @click="detailModalLead = null">✕</button>
        </div>

        <div class="modal-content">
          <div class="info-row">
            <span class="info-label">Alamat</span>
            <span class="info-value">{{ detailModalLead.address }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">Jarak</span>
            <span class="info-value">{{ detailModalLead.distanceText }} dari posisi pusat</span>
          </div>

          <div class="info-row">
            <span class="info-label">Rating</span>
            <span class="info-value">★ {{ detailModalLead.rating }} ({{ detailModalLead.reviews }} ulasan di Google Maps)</span>
          </div>

          <div class="info-row">
            <span class="info-label">Kontak WhatsApp</span>
            <span class="info-value">
              <a :href="'https://wa.me/' + detailModalLead.phoneRaw" target="_blank" class="contact-link">
                {{ detailModalLead.phoneFormatted }}
              </a>
            </span>
          </div>

          <div class="info-row">
            <span class="info-label">Jam Operasional</span>
            <span class="info-value">{{ detailModalLead.isOpen ? 'Sedang Buka' : 'Tutup' }} • {{ detailModalLead.hours }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">Tarif & Layanan</span>
            <span class="info-value">{{ detailModalLead.priceRange }} ({{ detailModalLead.features }})</span>
          </div>

          <div class="info-row" v-if="detailModalLead.maps_url">
            <span class="info-label">Link Google Maps</span>
            <span class="info-value">
              <a :href="detailModalLead.maps_url" target="_blank" rel="noopener noreferrer" class="contact-link">
                Buka Lokasi Langsung di Google Maps ↗
              </a>
            </span>
          </div>

          <div class="info-row full-width">
            <span class="info-label">Catatan Tambahan</span>
            <textarea 
              v-model="detailModalLead.customNote" 
              class="notes-input" 
              placeholder="Tambahkan catatan khusus untuk tempat ini..."
              rows="3"
            ></textarea>
          </div>
        </div>

        <div class="modal-foot">
          <button class="btn-subtle" @click="detailModalLead = null">Tutup</button>
          <a 
            v-if="detailModalLead.maps_url" 
            :href="detailModalLead.maps_url" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="btn-subtle"
          >
            Google Maps ↗
          </a>
          <button class="btn-secondary" @click="saveLeadAsNote(detailModalLead)">
            Simpan ke Quick Notes
          </button>
          <a :href="'https://wa.me/' + detailModalLead.phoneRaw" target="_blank" class="btn-primary">
            Kirim WhatsApp
          </a>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast" v-if="toastMessage">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const emit = defineEmits(['save-to-notes'])

// Search inputs - form kosong tanpa default
const searchKeyword = ref('')
const searchLocation = ref('')
const searchRadius = ref(5)
const isSearching = ref(false)
const isLocating = ref(false)
const userLocationCoords = ref(null)
const copiedContacts = ref(false)
const tableFilterText = ref('')
const selectedLead = ref(null)
const detailModalLead = ref(null)
const toastMessage = ref('')
const hasSearched = ref(false)

// Map setup
const mapContainerRef = ref(null)
const mapCardRef = ref(null)
const isFullscreen = ref(false)

let leafletMap = null
let radiusCircleLayer = null
let centerMarkerLayer = null
let leadMarkersGroup = null
let currentTileLayer = null

// Current center coordinates (Default Jabodetabek)
const currentSearchPoint = ref({
  name: 'Jabodetabek',
  lat: -6.2088,
  lng: 106.8456
})

// OpenStreetMap Tile Layer (100% Free, Tanpa API Key)
const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const OSM_TILE_OPTIONS = {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  subdomains: ['a', 'b', 'c'],
  maxZoom: 19
}

// Rumus Haversine untuk kalkulasi jarak riil (km) berdasarkan koordinat
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // radius bumi dalam km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const allScrapedLeads = ref([])
const leads = ref([])

// Terapkan penyaringan ketat berdasarkan radius yang dipilih pengguna
const applyRadiusFilter = (showFeedback = false) => {
  const maxRadius = Number(searchRadius.value) || 0
  if (maxRadius > 0) {
    // Saring ketat: hanya data dengan jarak <= radius yang akan ditampilkan
    leads.value = allScrapedLeads.value.filter(item => item.distanceKm <= maxRadius)
    if (showFeedback) {
      if (leads.value.length > 0) {
        showToast(`Ditemukan ${leads.value.length} tempat dalam radius ${maxRadius} km.`)
      } else if (allScrapedLeads.value.length > 0) {
        showToast(`Tidak ada tempat dalam radius ${maxRadius} km (terdekat: ${allScrapedLeads.value[0].distanceText}). Silakan naikkan pilihan radius.`)
      }
    }
  } else {
    leads.value = [...allScrapedLeads.value]
    if (showFeedback && leads.value.length > 0) {
      showToast(`Menampilkan semua ${leads.value.length} tempat hasil pencarian.`)
    }
  }

  if (leafletMap) {
    renderLeadMarkers()
    recenterMap()
  }
}

// Hitung ulang jarak tempat usaha terhadap titik pusat pencarian
const recalculateLeadDistances = (centerLat, centerLng) => {
  allScrapedLeads.value = allScrapedLeads.value.map(item => {
    const itemLat = item.lat || centerLat
    const itemLng = item.lng || centerLng
    const dist = calculateDistanceKm(centerLat, centerLng, itemLat, itemLng)
    const formattedKm = parseFloat(dist.toFixed(2))
    return {
      ...item,
      distanceKm: formattedKm,
      distanceText: formattedKm < 1 ? `${Math.round(formattedKm * 1000)} m` : `${formattedKm.toFixed(1).replace('.', ',')} km`
    }
  }).sort((a, b) => a.distanceKm - b.distanceKm)

  applyRadiusFilter(false)
}

// Computed Metrics
const filteredLeads = computed(() => {
  if (!tableFilterText.value.trim()) return leads.value
  const q = tableFilterText.value.toLowerCase().trim()
  return leads.value.filter(item => 
    item.name.toLowerCase().includes(q) ||
    item.address.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q) ||
    item.phoneFormatted.includes(q) ||
    item.features.toLowerCase().includes(q)
  )
})

const averageRating = computed(() => {
  if (leads.value.length === 0) return '0.0'
  const sum = leads.value.reduce((acc, curr) => acc + curr.rating, 0)
  return (sum / leads.value.length).toFixed(1)
})

const leadsWithPhoneCount = computed(() => {
  return leads.value.filter(l => l.phoneRaw).length
})

// Map Initialization
const initMap = () => {
  if (!mapContainerRef.value) return
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }

  leafletMap = L.map(mapContainerRef.value, {
    center: [currentSearchPoint.value.lat, currentSearchPoint.value.lng],
    zoom: 14,
    zoomControl: true
  })

  // Basemap OpenStreetMap (100% Free, Tanpa API Key)
  currentTileLayer = L.tileLayer(OSM_TILE_URL, OSM_TILE_OPTIONS).addTo(leafletMap)

  leadMarkersGroup = L.layerGroup().addTo(leafletMap)

  // Klik di area peta kosong akan menutup panel rincian tempat
  leafletMap.on('click', (e) => {
    if (!e.originalEvent?.target?.closest('.leaflet-marker-icon') && !e.originalEvent?.target?.closest('.active-place-card')) {
      selectedLead.value = null
    }
  })

  renderCenterAndRadius()
  renderLeadMarkers()

  // Invalidate size to ensure proper rendering
  setTimeout(() => {
    if (leafletMap) leafletMap.invalidateSize()
  }, 150)
  setTimeout(() => {
    if (leafletMap) leafletMap.invalidateSize()
  }, 500)
}

const renderCenterAndRadius = () => {
  if (!leafletMap) return
  if (radiusCircleLayer) leafletMap.removeLayer(radiusCircleLayer)
  if (centerMarkerLayer) leafletMap.removeLayer(centerMarkerLayer)

  const { lat, lng, name } = currentSearchPoint.value
  const radiusMeters = searchRadius.value * 1000

  // Radius perimeter circle (clean emerald ring) - hanya dimunculkan jika sudah melakukan pencarian
  if (hasSearched.value) {
    radiusCircleLayer = L.circle([lat, lng], {
      radius: radiusMeters,
      color: '#10b981',
      weight: 1.5,
      dashArray: '6, 6',
      fillColor: '#10b981',
      fillOpacity: 0.05
    }).addTo(leafletMap)
  }

  // Bullet hijau kelap-kelip (Green pulsating / blinking bullet for user position)
  const centerIconHtml = `
    <div class="map-pin-user-location" title="Posisi Anda">
      <div class="user-pulse"></div>
      <div class="user-dot"></div>
    </div>
  `

  const centerIcon = L.divIcon({
    html: centerIconHtml,
    className: 'leaflet-clean-pin',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  })

  centerMarkerLayer = L.marker([lat, lng], { icon: centerIcon })
    .bindPopup(`
      <div style="font-size: 12px; line-height: 1.4;">
        <strong>📍 Posisi Anda:</strong><br/>${name}<br/>
        <span style="color: #666;">Radius pencarian: ${searchRadius.value} km</span>
      </div>
    `)
    .addTo(leafletMap)
}

const renderLeadMarkers = () => {
  if (!leafletMap || !leadMarkersGroup) return
  leadMarkersGroup.clearLayers()

  leads.value.forEach((lead, idx) => {
    const isSelected = selectedLead.value?.id === lead.id
    // Lokasi yang didapatkan: warna merah kelap-kelip
    const pinHtml = `
      <div class="map-lead-marker-wrap">
        <div class="marker-pulse-red"></div>
        <div class="map-lead-marker ${isSelected ? 'is-active' : ''}">
          <span>${idx + 1}</span>
        </div>
      </div>
    `
    const leadIcon = L.divIcon({
      html: pinHtml,
      className: 'leaflet-clean-pin',
      iconSize: [32, 40],
      iconAnchor: [16, 38],
      popupAnchor: [0, -36]
    })

    const marker = L.marker([lead.lat, lead.lng], { icon: leadIcon })

    // Tooltip rapi saat hover (tidak ada popup ganda yang bertabrakan dengan kartu detail)
    marker.bindTooltip(`
      <div style="font-weight: 600; font-size: 12px; color: #0f172a; line-height: 1.3;">${lead.name}</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${lead.category} • ${lead.distanceText}</div>
    `, {
      direction: 'top',
      offset: [0, -22],
      opacity: 0.96,
      className: 'custom-map-tooltip'
    })

    marker.on('click', () => {
      selectedLead.value = lead
      if (leafletMap) {
        leafletMap.panTo([lead.lat, lead.lng], { animate: true })
      }
    })

    leadMarkersGroup.addLayer(marker)
  })
}

const onRadiusChange = () => {
  if (radiusCircleLayer && hasSearched.value) {
    radiusCircleLayer.setRadius((searchRadius.value || 5) * 1000)
  }
  if (allScrapedLeads.value.length > 0) {
    applyRadiusFilter(true)
  } else if (hasSearched.value) {
    recenterMap()
  }
}

const recenterMap = () => {
  if (!leafletMap) return
  if (radiusCircleLayer && hasSearched.value) {
    leafletMap.fitBounds(radiusCircleLayer.getBounds(), { padding: [25, 25] })
  } else {
    leafletMap.setView([currentSearchPoint.value.lat, currentSearchPoint.value.lng], hasSearched.value ? 14 : 12)
  }
}

const focusLeadOnMap = (lead) => {
  selectedLead.value = lead
  if (!leafletMap) return

  leafletMap.flyTo([lead.lat, lead.lng], 16, {
    animate: true,
    duration: 0.8
  })

  renderLeadMarkers()

  if (leadMarkersGroup) {
    leadMarkersGroup.eachLayer(layer => {
      const latLng = layer.getLatLng()
      if (Math.abs(latLng.lat - lead.lat) < 0.0001 && Math.abs(latLng.lng - lead.lng) < 0.0001) {
        layer.openPopup()
      }
    })
  }
}

const handleSearch = async () => {
  if (!searchKeyword.value.trim() && !searchLocation.value.trim()) {
    showToast('Silakan isi kata kunci atau lokasi pencarian.')
    return
  }

  isSearching.value = true
  hasSearched.value = true
  selectedLead.value = null
  leads.value = [] // Kosongkan hasil sebelumnya saat sedang mencari

  const locQuery = searchLocation.value.trim()
  const keyQuery = searchKeyword.value.trim()
  let geoLat = currentSearchPoint.value.lat
  let geoLng = currentSearchPoint.value.lng
  let pointName = locQuery || 'Sekitar Lokasi'

  if (userLocationCoords.value && (locQuery.toLowerCase().includes('saya') || locQuery.toLowerCase().includes('riil') || !locQuery)) {
    geoLat = userLocationCoords.value.lat
    geoLng = userLocationCoords.value.lng
    pointName = currentSearchPoint.value.name
  } else {
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locQuery)}&limit=1`, {
        headers: { 'Accept': 'application/json' }
      })
      if (geoRes.ok) {
        const geoData = await geoRes.json()
        if (geoData && geoData.length > 0) {
          geoLat = parseFloat(geoData[0].lat)
          geoLng = parseFloat(geoData[0].lon)
          pointName = geoData[0].display_name.split(',').slice(0, 2).join(', ').trim()
        }
      }
    } catch (e) {
      // fallback
    }
  }

  currentSearchPoint.value = {
    name: pointName,
    lat: geoLat,
    lng: geoLng
  }

  if (leafletMap) {
    leafletMap.setView([geoLat, geoLng], 14)
    renderCenterAndRadius()
  }

  try {
    showToast(`Bot Google Maps aktif: Mencari "${keyQuery}" di ${pointName}...`)

    // Request ke Live API Playwright Scraper (ambil hingga 30 data tempat Google Maps)
    const apiUrl = `/api/leads/search?keyword=${encodeURIComponent(keyQuery)}&location=${encodeURIComponent(locQuery)}&limit=30`
    const res = await fetch(apiUrl)

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        // Hitung jarak riil tiap tempat terhadap titik pusat pencarian
        const mapped = data.map(item => {
          let itemLat = item.lat
          let itemLng = item.lng
          if (!itemLat || !itemLng) {
            itemLat = geoLat
            itemLng = geoLng
          }
          const dist = calculateDistanceKm(geoLat, geoLng, itemLat, itemLng)
          const formattedKm = parseFloat(dist.toFixed(2))
          return {
            ...item,
            lat: itemLat,
            lng: itemLng,
            distanceKm: formattedKm,
            distanceText: formattedKm < 1 ? `${Math.round(formattedKm * 1000)} m` : `${formattedKm.toFixed(1).replace('.', ',')} km`
          }
        }).sort((a, b) => a.distanceKm - b.distanceKm)

        allScrapedLeads.value = mapped
        applyRadiusFilter(true)
      } else {
        allScrapedLeads.value = []
        leads.value = []
        showToast('Tidak ada tempat yang ditemukan untuk pencarian ini.')
      }
    } else {
      showToast('Gagal menghubungi live scraper API.')
    }
  } catch (err) {
    console.error('Live search error:', err)
    showToast('Terjadi kesalahan saat memproses live scraper.')
  } finally {
    isSearching.value = false
    if (leafletMap) {
      renderLeadMarkers()
      recenterMap()
    }
  }
}

const exportToCsv = () => {
  if (leads.value.length === 0) return

  const headers = ['No', 'Nama Tempat', 'Kategori', 'Rating', 'Ulasan', 'Alamat', 'Jarak', 'WhatsApp', 'Status Buka', 'Jam Operasional', 'Tarif & Layanan', 'Google Maps URL']
  const rows = leads.value.map((l, i) => [
    i + 1,
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.category}"`,
    l.rating,
    l.reviews,
    `"${l.address.replace(/"/g, '""')}"`,
    `"${l.distanceText}"`,
    `"${l.phoneFormatted}"`,
    l.isOpen ? 'Buka' : 'Tutup',
    `"${l.hours}"`,
    `"${l.priceRange} - ${l.features.replace(/"/g, '""')}"`,
    `"${l.maps_url || ''}"`
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const link = document.createElement('a')
  link.setAttribute('href', encodeURI(csvContent))
  link.setAttribute('download', `leads_${searchKeyword.value}_${searchLocation.value}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  showToast('File CSV berisi data Google Maps riil berhasil diunduh.')
}

const copyAllContacts = () => {
  if (leads.value.length === 0) return
  const text = leads.value
    .map((l, i) => `${i + 1}. ${l.name} - ${l.phoneFormatted} (${l.address})`)
    .join('\n')

  navigator.clipboard.writeText(text).then(() => {
    copiedContacts.value = true
    showToast('Nomor kontak berhasil disalin ke clipboard.')
    setTimeout(() => {
      copiedContacts.value = false
    }, 2000)
  })
}

const copyText = (txt) => {
  navigator.clipboard.writeText(txt).then(() => {
    showToast(`Disalin: ${txt}`)
  })
}

const openLeadDetails = (lead) => {
  detailModalLead.value = { ...lead }
}

const saveLeadAsNote = (lead) => {
  const noteData = {
    title: lead.name,
    content: `Alamat: ${lead.address}\nWhatsApp: ${lead.phoneFormatted}\nRating: ★ ${lead.rating} (${lead.reviews} ulasan)\nJarak: ${lead.distanceText}\nLayanan: ${lead.features}\nTarif: ${lead.priceRange}\nGoogle Maps: ${lead.maps_url || '-'}\nCatatan: ${lead.customNote || '-'}`,
    tags: ['Lead', 'Google Maps', searchKeyword.value]
  }

  try {
    const local = localStorage.getItem('taskflow_quick_notes')
    let notes = local ? JSON.parse(local) : []
    const now = new Date()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`

    notes.unshift({
      id: 'lead_' + Date.now(),
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags,
      color: '#34495E',
      updatedAt: dateStr
    })
    localStorage.setItem('taskflow_quick_notes', JSON.stringify(notes))
    showToast(`Tersimpan ke Quick Notes.`)
  } catch (e) {
    showToast('Catatan disimpan.')
  }

  emit('save-to-notes', noteData)
}

const showToast = (msg) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 2500)
}

const handleWindowResize = () => {
  if (leafletMap) {
    leafletMap.invalidateSize()
  }
}

// Fullscreen toggle logic
const toggleFullscreen = async () => {
  isFullscreen.value = !isFullscreen.value

  if (isFullscreen.value) {
    if (mapCardRef.value?.requestFullscreen) {
      try {
        await mapCardRef.value.requestFullscreen()
      } catch (err) {
        // Fallback to CSS fullscreen
      }
    }
  } else {
    if (document.fullscreenElement && document.exitFullscreen) {
      try {
        await document.exitFullscreen()
      } catch (err) {
        // Handled
      }
    }
  }

  nextTick(() => {
    setTimeout(() => {
      if (leafletMap) leafletMap.invalidateSize()
    }, 150)
    setTimeout(() => {
      if (leafletMap) leafletMap.invalidateSize()
    }, 450)
  })
}

const handleFullscreenChange = () => {
  const isDocFs = !!document.fullscreenElement
  if (!isDocFs && isFullscreen.value) {
    isFullscreen.value = false
    nextTick(() => {
      setTimeout(() => {
        if (leafletMap) leafletMap.invalidateSize()
      }, 150)
    })
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}

// Geolocation function for real user location
const getUserCurrentLocation = (isUserTriggered = false) => {
  if (!navigator.geolocation) {
    if (isUserTriggered) {
      showToast('Browser Anda tidak mendukung deteksi lokasi.')
    }
    return
  }

  isLocating.value = true

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      userLocationCoords.value = { lat, lng }

      let resolvedAddress = ''
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
          { headers: { 'Accept': 'application/json' } }
        )
        if (res.ok) {
          const data = await res.json()
          if (data && data.address) {
            const addr = data.address
            const local = addr.suburb || addr.neighbourhood || addr.village || addr.quarter || addr.residential
            const city = addr.city || addr.town || addr.municipality || addr.city_district || addr.county
            if (local && city) {
              resolvedAddress = `${local}, ${city}`
            } else if (city) {
              resolvedAddress = city
            } else if (local) {
              resolvedAddress = local
            } else if (data.display_name) {
              resolvedAddress = data.display_name.split(',').slice(0, 2).join(', ').trim()
            }
          }
        }
      } catch (err) {
        console.warn('Reverse geocoding error:', err)
      }

      if (!resolvedAddress) {
        resolvedAddress = `Lokasi Riil (${lat.toFixed(4)}, ${lng.toFixed(4)})`
      }

      if (isUserTriggered) {
        searchLocation.value = resolvedAddress
      }

      currentSearchPoint.value = {
        name: resolvedAddress,
        lat,
        lng
      }

      // Hanya hitung ulang jarak data jika ada hasil pencarian
      if (hasSearched.value && leads.value.length > 0) {
        recalculateLeadDistances(lat, lng)
      }

      if (leafletMap) {
        leafletMap.setView([lat, lng], hasSearched.value ? 14 : 12, { animate: true })
        renderCenterAndRadius()
        if (hasSearched.value) {
          renderLeadMarkers()
        }
      }

      isLocating.value = false
      if (isUserTriggered) {
        showToast(`Lokasi diperbarui ke: ${resolvedAddress}`)
      }
    },
    (error) => {
      isLocating.value = false
      console.warn('Geolocation error:', error)
      if (isUserTriggered) {
        let errMessage = 'Gagal mendeteksi lokasi GPS.'
        if (error.code === 1) {
          errMessage = 'Izin akses lokasi ditolak oleh browser.'
        } else if (error.code === 2) {
          errMessage = 'Posisi GPS sedang tidak tersedia.'
        } else if (error.code === 3) {
          errMessage = 'Permintaan waktu lokasi habis (timeout).'
        }
        showToast(errMessage)
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  )
}

onMounted(() => {
  // Hasil pencarian awal dibuat kosong sesuai instruksi
  leads.value = []

  nextTick(() => {
    initMap()
    // Deteksi posisi GPS user secara pasif (tidak mengisi form atau memuat hasil sebelum dicari)
    getUserCurrentLocation(false)
  })

  window.addEventListener('resize', handleWindowResize)
  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowResize)
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }
})
</script>

<style scoped>
.lead-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  padding-bottom: 32px;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 4px;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 4px;
  letter-spacing: -0.01em;
}

.subtitle {
  font-size: 13px;
  color: var(--color-muted);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-subtle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  color: var(--color-ink);
  padding: 7px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-subtle:hover:not(:disabled) {
  border-color: var(--color-ink);
  background: var(--color-paper);
}

.btn-subtle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Search Card */
.search-card {
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.search-bar {
  display: flex;
  gap: 14px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
}

.search-field.flex-2 {
  flex: 2;
}

.search-field.radius-select-field {
  flex: 1;
  min-width: 110px;
}

.search-field label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-ink);
}

.field-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-text-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--color-brand);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s ease;
}

.btn-text-link:hover:not(:disabled) {
  text-decoration: underline;
}

.btn-text-link:disabled {
  opacity: 0.6;
  cursor: wait;
}

.btn-input-gps {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 6px;
  color: var(--color-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
}

.btn-input-gps:hover:not(:disabled) {
  color: var(--color-brand);
  background: var(--color-border);
}

.btn-input-gps:disabled {
  cursor: wait;
}

.gps-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrap input,
.input-wrap select {
  width: 100%;
  height: 40px;
  padding: 0 12px 0 34px;
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-ink);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s ease;
}

.input-wrap select {
  padding-left: 12px;
  cursor: pointer;
}

.input-wrap input:focus,
.input-wrap select:focus {
  border-color: var(--color-brand);
}

.field-icon {
  position: absolute;
  left: 10px;
  color: var(--color-muted);
  pointer-events: none;
}

.search-action {
  display: flex;
  align-items: flex-end;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  padding: 0 20px;
  background: var(--color-brand);
  color: #FFFFFF;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.15s ease;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: wait;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.quick-examples {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.quick-examples .label {
  font-size: 11px;
  color: var(--color-muted);
  font-weight: 500;
}

.example-tag {
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  color: var(--color-ink);
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.example-tag:hover {
  border-color: var(--color-brand);
  color: var(--color-brand);
}

/* Metrics Bar */
.metrics-bar {
  display: flex;
  align-items: center;
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 10px 18px;
  gap: 16px;
  flex-wrap: wrap;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.metric-label {
  font-size: 11px;
  color: var(--color-muted);
}

.metric-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-ink);
}

.metric-divider {
  width: 1px;
  height: 14px;
  background: var(--color-border);
}

/* Map Card */
.map-card {
  position: relative;
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all 0.2s ease;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-panel);
}

.map-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.dot-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-brand);
}

.map-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-ink);
}

.map-meta {
  font-size: 12px;
  color: var(--color-muted);
}

.esc-hint {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-muted);
  background: var(--color-paper);
  border: 1px dashed var(--color-border);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.map-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}


.btn-map-tool {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 500;
  color: var(--color-ink);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-map-tool:hover {
  background: var(--color-border);
}

.btn-map-tool.btn-active {
  background: var(--color-brand);
  color: #FFFFFF;
  border-color: var(--color-brand);
}

.btn-map-tool.btn-active svg {
  stroke: #FFFFFF;
}

.map-canvas {
  width: 100%;
  height: 440px;
  background: var(--color-paper);
  z-index: 1;
}

/* Fullscreen Map Mode */
.map-card.is-fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 99999 !important;
  border-radius: 0 !important;
  border: none !important;
  display: flex !important;
  flex-direction: column !important;
  background: var(--color-paper) !important;
  margin: 0 !important;
}

.map-card.is-fullscreen .map-header {
  flex-shrink: 0;
  padding: 12px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
  z-index: 1002;
}

.map-card.is-fullscreen .map-canvas {
  flex: 1;
  height: 100% !important;
}

.map-card.is-fullscreen .active-place-card {
  bottom: 24px;
  right: 24px;
  z-index: 1003;
}

/* Active Place Floating Card - Luxury Glassmorphic Design */
.active-place-card {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 360px;
  max-width: calc(100% - 40px);
  background: rgba(15, 23, 42, 0.94);
  backdrop-filter: blur(24px) saturate(190%);
  -webkit-backdrop-filter: blur(24px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-top: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 20px;
  padding: 18px 20px;
  box-shadow: 0 24px 50px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.06);
  z-index: 1000;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-glow-bg {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(15, 23, 42, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
}

.place-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.header-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.place-category-chip {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #a5b4fc;
  background: rgba(99, 102, 241, 0.18);
  border: 1px solid rgba(129, 140, 248, 0.3);
  padding: 3px 8px;
  border-radius: 9999px;
  line-height: 1.2;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 9999px;
  line-height: 1.2;
}

.status-pill.is-open {
  background: rgba(16, 185, 129, 0.16);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-pill.is-closed {
  background: rgba(239, 68, 68, 0.16);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 6px currentColor;
}

.gmaps-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 600;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 3px 7px;
  border-radius: 9999px;
}

.btn-close-card {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.btn-close-card:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  transform: scale(1.08);
}

.place-name {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.35;
  margin: 0 0 6px 0;
  letter-spacing: -0.2px;
}

.place-address-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 12px;
}

.addr-pin-icon {
  flex-shrink: 0;
  color: #94a3b8;
  margin-top: 2px;
}

.place-address-text {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.45;
}

.place-chips-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.metric-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.rating-chip {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.chip-sub {
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 500;
}

.distance-chip {
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.25);
}

.place-action-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-wa-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff !important;
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
  transition: all 0.25s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-wa-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
  filter: brightness(1.06);
}

.wa-main-text {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1px;
}

.wa-sub-text {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.92;
}

.secondary-btn-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.btn-action-ghost {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f1f5f9;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action-ghost:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.25);
  color: #ffffff;
  transform: translateY(-1px);
}

/* Card pop transition */
.card-pop-enter-active,
.card-pop-leave-active {
  transition: all 0.26s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-pop-enter-from,
.card-pop-leave-to {
  opacity: 0;
  transform: translateY(14px) scale(0.96);
}

/* Table Section */
.table-card {
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
  gap: 12px;
}

.table-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-ink);
}

.table-subtitle {
  font-size: 12px;
  color: var(--color-muted);
  margin-top: 2px;
}

.table-search {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  width: 240px;
}

.table-search input {
  background: none;
  border: none;
  outline: none;
  font-size: 12px;
  color: var(--color-ink);
  font-family: inherit;
  width: 100%;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.data-table th {
  background: var(--color-paper);
  color: var(--color-muted);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.data-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-ink);
  vertical-align: middle;
}

.data-table tbody tr {
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.data-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.data-table tbody tr.is-selected {
  background-color: rgba(62, 76, 138, 0.08);
}

.cell-index {
  color: var(--color-muted);
  font-size: 12px;
}

.name-box {
  display: flex;
  flex-direction: column;
}

.place-title {
  font-weight: 600;
  color: var(--color-ink);
}

.place-sub {
  font-size: 11px;
  color: var(--color-muted);
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-stars {
  font-weight: 700;
  color: #d97706;
}

.review-count {
  font-size: 11px;
  color: var(--color-muted);
}

.text-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 240px;
  line-height: 1.35;
  font-size: 12px;
}

.distance-tag {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-brand);
  background: rgba(62, 76, 138, 0.08);
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.contact-link {
  color: #27ae60;
  font-weight: 600;
  text-decoration: none;
  font-size: 12px;
  white-space: nowrap;
}

.contact-link:hover {
  text-decoration: underline;
}

.btn-copy-inline {
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  padding: 2px;
  display: flex;
}

.badge-status {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 3px;
}

.badge-status.open { background: rgba(39, 174, 96, 0.12); color: #27ae60; }
.badge-status.closed { background: rgba(231, 76, 60, 0.12); color: #e74c3c; }

.hours-sub {
  display: block;
  font-size: 11px;
  color: var(--color-muted);
  margin-top: 2px;
}

.price-val {
  font-weight: 600;
  font-size: 12px;
}

.service-desc {
  font-size: 11px;
  color: var(--color-muted);
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-btn-group {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.btn-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  color: var(--color-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s ease;
}

.btn-icon:hover {
  border-color: var(--color-brand);
  color: var(--color-brand);
}

.cell-empty {
  text-align: center;
  padding: 30px !important;
  color: var(--color-muted);
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 520px;
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.modal-badge {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-brand);
}

.modal-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-ink);
  margin-top: 2px;
}

.btn-close-modal {
  background: none;
  border: none;
  font-size: 16px;
  color: var(--color-muted);
  cursor: pointer;
}

.modal-content {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-row.full-width {
  margin-top: 6px;
}

.info-label {
  font-size: 11px;
  color: var(--color-muted);
  font-weight: 600;
}

.info-value {
  font-size: 13px;
  color: var(--color-ink);
  line-height: 1.4;
}

.notes-input {
  width: 100%;
  padding: 8px 10px;
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 12px;
  color: var(--color-ink);
  outline: none;
  resize: vertical;
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  background: var(--color-paper);
  border-top: 1px solid var(--color-border);
}

.btn-secondary {
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  color: var(--color-ink);
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #1B1F3B;
  color: #FFFFFF;
  padding: 10px 18px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  z-index: 10000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Leaflet Clean Markers & Popups */
:deep(.leaflet-clean-pin) {
  background: transparent;
  border: none;
}

/* Subtle clean tone on OpenStreetMap tiles */
:deep(.leaflet-tile-pane) {
  filter: contrast(1.02) saturate(0.88) brightness(1.02);
}

:deep(.map-pin-center) {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(44, 62, 80, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.map-pin-center .pin-dot) {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #2C3E50;
  border: 2px solid #FFFFFF;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

/* Posisi Saya: Bullet Hijau Kelap-Kelip */
:deep(.map-pin-user-location) {
  position: relative;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.map-pin-user-location .user-pulse) {
  position: absolute;
  top: 0;
  left: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.45);
  animation: green-user-pulse 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

:deep(.map-pin-user-location .user-dot) {
  position: absolute;
  top: 5px;
  left: 5px;
  width: 16px;
  height: 16px;
  background: #10b981;
  border: 3px solid #FFFFFF;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.8), 0 2px 6px rgba(0, 0, 0, 0.3);
  z-index: 2;
  animation: green-bullet-blink 1.4s ease-in-out infinite alternate;
}

@keyframes green-user-pulse {
  0% {
    transform: scale(0.5);
    opacity: 0.95;
  }
  70% {
    transform: scale(2.8);
    opacity: 0;
  }
  100% {
    transform: scale(2.8);
    opacity: 0;
  }
}

@keyframes green-bullet-blink {
  0% {
    transform: scale(0.9);
    filter: brightness(0.9);
    box-shadow: 0 0 4px rgba(16, 185, 129, 0.5), 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  100% {
    transform: scale(1.15);
    filter: brightness(1.2);
    box-shadow: 0 0 14px rgba(16, 185, 129, 0.95), 0 2px 8px rgba(0, 0, 0, 0.35);
  }
}

/* Lokasi yang Didapatkan: Warna Merah Kelap-Kelip */
:deep(.map-lead-marker-wrap) {
  position: relative;
  width: 32px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.map-lead-marker-wrap .marker-pulse-red) {
  position: absolute;
  bottom: 2px;
  left: 50%;
  width: 22px;
  height: 22px;
  margin-left: -11px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.5);
  animation: red-marker-pulse 1.8s cubic-bezier(0.2, 0.6, 0.35, 1) infinite;
  pointer-events: none;
}

:deep(.map-lead-marker) {
  position: relative;
  width: 26px;
  height: 32px;
  background: #ef4444;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6), 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: transform 0.15s ease;
  animation: red-marker-blink 1.5s ease-in-out infinite alternate;
  z-index: 2;
}

:deep(.map-lead-marker.is-active) {
  background: #b91c1c;
  transform: rotate(-45deg) scale(1.2);
  box-shadow: 0 0 16px rgba(239, 68, 68, 0.95), 0 4px 10px rgba(0, 0, 0, 0.35);
}

:deep(.map-lead-marker span) {
  transform: rotate(45deg);
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 700;
}

@keyframes red-marker-pulse {
  0% {
    transform: scale(0.5);
    opacity: 0.95;
  }
  70% {
    transform: scale(2.8);
    opacity: 0;
  }
  100% {
    transform: scale(2.8);
    opacity: 0;
  }
}

@keyframes red-marker-blink {
  0% {
    filter: brightness(0.95);
    box-shadow: 0 0 4px rgba(239, 68, 68, 0.4), 0 2px 4px rgba(0, 0, 0, 0.25);
  }
  100% {
    filter: brightness(1.2);
    box-shadow: 0 0 14px rgba(239, 68, 68, 0.9), 0 2px 8px rgba(0, 0, 0, 0.35);
  }
}

:deep(.leaflet-tooltip.custom-map-tooltip) {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
  padding: 6px 10px;
  font-family: inherit;
}

:deep(.leaflet-tooltip-top.custom-map-tooltip:before) {
  border-top-color: rgba(255, 255, 255, 0.96);
}

:deep(.map-popup) {
  font-family: inherit;
  min-width: 200px;
}

:deep(.map-popup .popup-cat) {
  font-size: 10px;
  font-weight: 600;
  color: #7f8c8d;
}

:deep(.map-popup .popup-title) {
  font-size: 13px;
  font-weight: 700;
  margin: 2px 0 4px 0;
  color: #2c3e50;
}

:deep(.map-popup .popup-addr) {
  font-size: 11px;
  color: #666;
  margin: 0 0 6px 0;
  line-height: 1.3;
}

:deep(.map-popup .popup-meta) {
  display: flex;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #d35400;
  margin-bottom: 8px;
}

:deep(.map-popup .popup-wa-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #27ae60;
  color: #FFFFFF !important;
  text-decoration: none;
  padding: 5px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

:deep(.map-popup .popup-gmaps-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #f1f5f9;
  color: #334155 !important;
  border: 1px solid #cbd5e1;
  text-decoration: none;
  padding: 5px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.15s ease;
}

:deep(.map-popup .popup-gmaps-btn:hover) {
  background: #e2e8f0;
  border-color: #94a3b8;
  color: #0f172a !important;
}

.table-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge-gmaps-verified {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.25);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
}

.live-pulse-badge {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 rgba(16, 185, 129, 0.4);
  animation: pulse-badge 1.8s infinite;
}

@keyframes pulse-badge {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
  70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.scraper-live-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(16, 185, 129, 0.2);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-field, .search-field.flex-2, .search-field.radius-select-field {
    width: 100%;
  }
  .btn-primary {
    width: 100%;
  }
  .active-place-card {
    position: static;
    width: 100%;
    border-radius: 0;
  }
}
</style>
