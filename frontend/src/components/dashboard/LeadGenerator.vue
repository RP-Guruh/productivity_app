<template>
  <div class="lead-generator animate-fade-in">
    <!-- Top Header & Actions -->
    <div class="lead-header-banner">
      <div class="banner-content">
        <div class="badge-tag">
          <span class="pulse-dot"></span>
          <span>Market Explorer & Visual Prospecting</span>
        </div>
        <h2 class="banner-title">🎯 Lead Generator & Pemetaan Bisnis</h2>
        <p class="banner-subtitle">
          Temukan calon prospek, tempat usaha, dan kompetitor di sekitar wilayah target dengan radius akurat dan data kontak siap pakai.
        </p>
      </div>

      <div class="banner-actions">
        <button class="btn-action-outline" @click="exportToCsv" :disabled="leads.length === 0" title="Download data dalam format Excel / CSV">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>Ekspor CSV</span>
        </button>
        <button class="btn-action-outline" @click="copyAllContacts" :disabled="leads.length === 0" title="Salin semua nomor kontak ke clipboard">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          <span>{{ copiedContacts ? 'Tersalin! ✓' : 'Salin Kontak' }}</span>
        </button>
      </div>
    </div>

    <!-- Search Controls Card -->
    <div class="search-panel-card">
      <form @submit.prevent="handleSearch" class="search-form-grid">
        <!-- Field 1: Category / Keyword -->
        <div class="form-group-field">
          <label class="field-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span>Jenis Tempat / Kata Kunci</span>
          </label>
          <div class="input-icon-wrapper">
            <input 
              type="text" 
              v-model="searchKeyword" 
              class="custom-input" 
              placeholder="Contoh: Tukang Cukur, Coffee Shop, Bengkel..."
              required
            />
            <button v-if="searchKeyword" type="button" class="clear-input-btn" @click="searchKeyword = ''">✕</button>
          </div>
        </div>

        <!-- Field 2: Location Free-text -->
        <div class="form-group-field">
          <label class="field-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>Lokasi / Wilayah</span>
          </label>
          <div class="input-icon-wrapper">
            <input 
              type="text" 
              v-model="searchLocation" 
              class="custom-input" 
              placeholder="Contoh: Cipayung Depok, Tebet, Margonda..."
              required
            />
            <button v-if="searchLocation" type="button" class="clear-input-btn" @click="searchLocation = ''">✕</button>
          </div>
        </div>

        <!-- Field 3: Radius Slider & Presets -->
        <div class="form-group-field radius-field">
          <div class="radius-header">
            <label class="field-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
              <span>Radius Jangkauan</span>
            </label>
            <span class="radius-badge">{{ searchRadius }} KM</span>
          </div>

          <div class="radius-control-row">
            <input 
              type="range" 
              min="0.5" 
              max="10" 
              step="0.5" 
              v-model.number="searchRadius" 
              class="radius-slider"
              @input="onRadiusChange"
            />
            <div class="radius-presets">
              <button 
                v-for="r in [1, 2, 3, 5, 8]" 
                :key="r" 
                type="button" 
                :class="['preset-chip', { active: searchRadius === r }]"
                @click="searchRadius = r; onRadiusChange()"
              >
                {{ r }} km
              </button>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="form-group-action">
          <button type="submit" class="search-submit-btn" :disabled="isSearching">
            <svg v-if="!isSearching" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span v-else class="spinner-small"></span>
            <span>{{ isSearching ? 'Memetakan...' : 'Cari Prospek' }}</span>
          </button>
        </div>
      </form>

      <!-- Suggested Quick Scenarios -->
      <div class="scenario-suggestions">
        <span class="scenario-label">Rekomendasi Skenario Cepat:</span>
        <div class="scenario-chips">
          <button 
            v-for="(sc, idx) in scenarioPresets" 
            :key="idx" 
            type="button" 
            class="scenario-pill"
            @click="applyScenario(sc)"
          >
            <span>{{ sc.icon }}</span>
            <span class="sc-title">{{ sc.keyword }}</span>
            <span class="sc-loc">di {{ sc.location }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Summary KPI Cards -->
    <div class="stats-overview-grid" v-if="leads.length > 0">
      <div class="kpi-card">
        <div class="kpi-icon-box brand">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="kpi-content">
          <span class="kpi-label">Total Lead Ditemukan</span>
          <div class="kpi-number">{{ leads.length }} Bisnis</div>
          <span class="kpi-sub">Sesuai kriteria radius</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon-box success">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="kpi-content">
          <span class="kpi-label">Radius Pemetaan</span>
          <div class="kpi-number">{{ searchRadius }} KM</div>
          <span class="kpi-sub">Pusat: {{ currentSearchPoint.name }}</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon-box warning">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </div>
        <div class="kpi-content">
          <span class="kpi-label">Rata-rata Rating</span>
          <div class="kpi-number">⭐ {{ averageRating }} / 5.0</div>
          <span class="kpi-sub">Dari {{ totalReviewsCount }} ulasan konsumen</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon-box signal">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
        </div>
        <div class="kpi-content">
          <span class="kpi-label">Kelengkapan Kontak</span>
          <div class="kpi-number">{{ verifiedPhonePercentage }}%</div>
          <span class="kpi-sub">Tersedia kontak WhatsApp aktif</span>
        </div>
      </div>
    </div>

    <!-- MAP CONTAINER SECTION -->
    <div class="map-view-wrapper">
      <div class="map-toolbar-header">
        <div class="map-toolbar-left">
          <span class="map-title-icon">🗺️</span>
          <h3 class="map-section-title">Pemetaan Wilayah & Radius Jangkauan</h3>
          <span class="map-subtitle">({{ searchKeyword }} di {{ searchLocation }})</span>
        </div>

        <div class="map-toolbar-right">
          <button class="map-control-btn" @click="recenterMap" title="Pusatkan peta ke target radius">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
            <span>Pusatkan Peta</span>
          </button>
          <div class="map-legend">
            <span class="legend-item"><span class="legend-dot center"></span> Titik Pencarian</span>
            <span class="legend-item"><span class="legend-dot lead"></span> Lokasi Lead</span>
            <span class="legend-item"><span class="legend-circle"></span> Lingkaran Radius</span>
          </div>
        </div>
      </div>

      <!-- Leaflet Map Mount Point -->
      <div class="leaflet-map-element" ref="mapContainerRef"></div>

      <!-- Floating Map Info Badge -->
      <div class="map-floating-overlay" v-if="selectedLead">
        <div class="floating-lead-info">
          <div class="floating-header">
            <span class="floating-badge">{{ selectedLead.category }}</span>
            <button class="close-floating-btn" @click="selectedLead = null">✕</button>
          </div>
          <h4 class="floating-title">{{ selectedLead.name }}</h4>
          <p class="floating-address">{{ selectedLead.address }}</p>
          <div class="floating-meta">
            <span class="meta-rating">⭐ {{ selectedLead.rating }} ({{ selectedLead.reviews }} ulasan)</span>
            <span class="meta-distance">📍 {{ selectedLead.distanceText }}</span>
          </div>
          <div class="floating-actions">
            <a :href="'https://wa.me/' + selectedLead.phoneRaw" target="_blank" class="btn-wa-sm">
              💬 WhatsApp
            </a>
            <button class="btn-detail-sm" @click="openLeadDetails(selectedLead)">
              Detail Lengkap
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- LEADS DATA TABLE SECTION -->
    <div class="leads-table-container">
      <div class="table-header-row">
        <div class="table-title-area">
          <h3 class="table-section-title">
            <span>Daftar Informasi Prospek / Tempat Terpetakan</span>
            <span class="table-count-badge">{{ filteredLeads.length }} Data</span>
          </h3>
          <p class="table-section-desc">
            Informasi detail bisnis, alamat, kontak WhatsApp, kisaran tarif, dan estimasi jarak dari pusat pencarian.
          </p>
        </div>

        <div class="table-filter-area">
          <div class="table-search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              v-model="tableFilterText" 
              placeholder="Saring hasil di tabel..."
              class="table-search-input"
            />
          </div>
        </div>
      </div>

      <!-- Main Data Table -->
      <div class="table-responsive-wrapper">
        <table class="leads-table">
          <thead>
            <tr>
              <th style="width: 45px;">#</th>
              <th>Nama Bisnis & Kategori</th>
              <th style="width: 140px;">Rating & Ulasan</th>
              <th>Alamat Lengkap</th>
              <th style="width: 110px;">Jarak</th>
              <th style="width: 160px;">Kontak WhatsApp</th>
              <th style="width: 130px;">Jam Buka</th>
              <th style="width: 170px;">Kisaran Harga</th>
              <th style="width: 130px; text-align: center;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(lead, index) in filteredLeads" 
              :key="lead.id" 
              :class="{ 'row-active': selectedLead?.id === lead.id }"
              @click="focusLeadOnMap(lead)"
            >
              <td class="col-num">{{ index + 1 }}</td>
              
              <!-- Business Name & Category -->
              <td class="col-biz">
                <div class="biz-name-wrapper">
                  <div class="biz-avatar">{{ lead.icon }}</div>
                  <div class="biz-info">
                    <span class="biz-title">{{ lead.name }}</span>
                    <span class="biz-badge">{{ lead.category }}</span>
                  </div>
                </div>
              </td>

              <!-- Rating -->
              <td class="col-rating">
                <div class="rating-box">
                  <span class="stars-val">⭐ {{ lead.rating }}</span>
                  <span class="reviews-count">({{ lead.reviews }} ulasan)</span>
                </div>
              </td>

              <!-- Address -->
              <td class="col-address">
                <div class="address-text" :title="lead.address">
                  {{ lead.address }}
                </div>
              </td>

              <!-- Distance -->
              <td class="col-distance">
                <span class="distance-pill">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
                  {{ lead.distanceText }}
                </span>
              </td>

              <!-- Contact -->
              <td class="col-contact">
                <div class="contact-box" @click.stop>
                  <a :href="'https://wa.me/' + lead.phoneRaw" target="_blank" class="wa-link" title="Buka Chat WhatsApp">
                    <span class="wa-icon">🟢</span>
                    <span class="wa-number">{{ lead.phoneFormatted }}</span>
                  </a>
                  <button class="copy-cell-btn" @click="copyText(lead.phoneFormatted)" title="Salin nomor">
                    📋
                  </button>
                </div>
              </td>

              <!-- Status & Hours -->
              <td class="col-hours">
                <span :class="['status-chip', lead.isOpen ? 'open' : 'closed']">
                  {{ lead.isOpen ? '● Buka' : '○ Tutup' }}
                </span>
                <span class="hours-text">{{ lead.hours }}</span>
              </td>

              <!-- Price & Services -->
              <td class="col-price">
                <div class="price-range">{{ lead.priceRange }}</div>
                <div class="features-list">{{ lead.features }}</div>
              </td>

              <!-- Actions -->
              <td class="col-actions" @click.stop>
                <div class="row-actions">
                  <button class="btn-tbl-icon" @click="focusLeadOnMap(lead)" title="Lihat di Peta">
                    📍
                  </button>
                  <button class="btn-tbl-icon" @click="openLeadDetails(lead)" title="Detail Lengkap">
                    ℹ️
                  </button>
                  <button class="btn-tbl-icon" @click="saveLeadAsNote(lead)" title="Simpan ke Quick Notes">
                    📌
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty Row if No Filter Match -->
            <tr v-if="filteredLeads.length === 0">
              <td colspan="9" class="empty-table-cell">
                <div class="empty-table-state">
                  <span>🔍</span>
                  <p>Tidak ada lead yang cocok dengan filter pencarian tabel.</p>
                  <button class="btn-action-outline" @click="tableFilterText = ''">Reset Filter</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Lead Detail Modal -->
    <div class="lead-modal-backdrop" v-if="detailModalLead" @click.self="detailModalLead = null">
      <div class="lead-modal-card animate-scale-up">
        <div class="modal-top">
          <div class="modal-category-tag">{{ detailModalLead.category }}</div>
          <button class="modal-close-btn" @click="detailModalLead = null">✕</button>
        </div>

        <div class="modal-body-content">
          <div class="modal-title-row">
            <span class="modal-avatar">{{ detailModalLead.icon }}</span>
            <div>
              <h3 class="modal-title">{{ detailModalLead.name }}</h3>
              <div class="modal-rating">
                <span>⭐ {{ detailModalLead.rating }} dari 5.0</span>
                <span>• {{ detailModalLead.reviews }} ulasan di Google Maps</span>
              </div>
            </div>
          </div>

          <div class="modal-info-grid">
            <div class="modal-info-item">
              <span class="m-label">Alamat Lengkap</span>
              <p class="m-val">{{ detailModalLead.address }}</p>
            </div>

            <div class="modal-info-item">
              <span class="m-label">Jarak dari Titik Pusat</span>
              <p class="m-val">{{ detailModalLead.distanceText }} (Radius {{ searchRadius }} KM)</p>
            </div>

            <div class="modal-info-item">
              <span class="m-label">Kontak WhatsApp / Telp</span>
              <p class="m-val phone-link">
                <a :href="'https://wa.me/' + detailModalLead.phoneRaw" target="_blank">
                  {{ detailModalLead.phoneFormatted }} (Chat Langsung)
                </a>
              </p>
            </div>

            <div class="modal-info-item">
              <span class="m-label">Status & Jam Operasional</span>
              <p class="m-val">{{ detailModalLead.isOpen ? 'Sedang Buka' : 'Tutup' }} • {{ detailModalLead.hours }}</p>
            </div>

            <div class="modal-info-item full">
              <span class="m-label">Estimasi Harga & Layanan Unggulan</span>
              <p class="m-val highlight">{{ detailModalLead.priceRange }} — {{ detailModalLead.features }}</p>
            </div>

            <div class="modal-info-item full">
              <span class="m-label">Catatan Follow-up Prospek</span>
              <textarea 
                v-model="detailModalLead.customNote" 
                class="modal-textarea" 
                placeholder="Tulis catatan prospek di sini (misal: Sudah dihubungi via WA, tertarik penawaran kerjasama, dll)..."
              ></textarea>
            </div>
          </div>
        </div>

        <div class="modal-footer-row">
          <button class="btn-modal-sec" @click="detailModalLead = null">Tutup</button>
          <button class="btn-modal-pri" @click="saveLeadAsNote(detailModalLead)">
            📌 Simpan ke Quick Notes
          </button>
          <a :href="'https://wa.me/' + detailModalLead.phoneRaw" target="_blank" class="btn-modal-wa">
            💬 Buka WhatsApp
          </a>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast-notification" v-if="toastMessage">
      <span>{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Emits to allow saving to notes in BoardsOverview
const emit = defineEmits(['save-to-notes'])

// Search States
const searchKeyword = ref('Tukang Cukur')
const searchLocation = ref('Cipayung Depok')
const searchRadius = ref(3) // in KM
const isSearching = ref(false)
const copiedContacts = ref(false)
const tableFilterText = ref('')
const selectedLead = ref(null)
const detailModalLead = ref(null)
const toastMessage = ref('')

// Map References
const mapContainerRef = ref(null)
let leafletMap = null
let radiusCircleLayer = null
let centerMarkerLayer = null
let leadMarkersGroup = null

// Current center coordinates (Default: Cipayung, Kota Depok: -6.4255, 106.8150)
const currentSearchPoint = ref({
  name: 'Cipayung, Kota Depok',
  lat: -6.4255,
  lng: 106.8150
})

// Scenario Presets
const scenarioPresets = [
  { icon: '💈', keyword: 'Tukang Cukur', location: 'Cipayung Depok', radius: 3 },
  { icon: '☕', keyword: 'Coffee Shop', location: 'Tebet Jakarta Selatan', radius: 2.5 },
  { icon: '🍜', keyword: 'Kuliner & Cafe', location: 'Margonda Depok', radius: 4 },
  { icon: '🚗', keyword: 'Bengkel Mobil', location: 'Fatmawati Jakarta', radius: 3.5 },
  { icon: '🏥', keyword: 'Apotek & Klinik', location: 'Sawangan Depok', radius: 5 }
]

// Primary Pre-defined Datasets for realistic scenarios
const MOCK_DATASETS = {
  // Scenario 1: Tukang Cukur di Cipayung Depok
  'tukang cukur_cipayung depok': {
    center: { name: 'Cipayung, Kota Depok', lat: -6.4255, lng: 106.8150 },
    items: [
      {
        id: 'lead-tc-1',
        name: 'Captain Barbershop Cipayung',
        category: 'Modern Barbershop',
        icon: '💈',
        rating: 4.9,
        reviews: 248,
        address: 'Jl. Raya Cipayung No. 28, RT 02/RW 04, Cipayung, Kota Depok',
        distanceKm: 0.45,
        distanceText: '450 meter',
        lat: -6.4231,
        lng: 106.8142,
        phoneRaw: '6281288997711',
        phoneFormatted: '0812-8899-7711',
        isOpen: true,
        hours: '09:00 - 21:30 WIB',
        priceRange: 'Rp 45.000 - Rp 75.000',
        features: 'Full AC, Cuci Rambut, Hot Towel, Free Pomade, Free Wi-Fi'
      },
      {
        id: 'lead-tc-2',
        name: 'Pangkas Rambut Asli Garut Barokah',
        category: 'Pangkas Tradisional',
        icon: '✂️',
        rating: 4.8,
        reviews: 135,
        address: 'Jl. Jembatan Serong RT 03/RW 02, Cipayung, Kota Depok',
        distanceKm: 0.78,
        distanceText: '780 meter',
        lat: -6.4278,
        lng: 106.8165,
        phoneRaw: '6285712349876',
        phoneFormatted: '0857-1234-9876',
        isOpen: true,
        hours: '08:00 - 22:00 WIB',
        priceRange: 'Rp 20.000 - Rp 30.000',
        features: 'Cukur Cepat Rapi, Pijat Leher Tradisional, Ramah Anak'
      },
      {
        id: 'lead-tc-3',
        name: "D'Kins Barbershop & Studio",
        category: 'Barbershop & Grooming',
        icon: '💈',
        rating: 4.7,
        reviews: 98,
        address: 'Jl. Pitara Raya No. 88, Cipayung Jaya, Kec. Cipayung, Depok',
        distanceKm: 1.1,
        distanceText: '1.1 KM',
        lat: -6.4215,
        lng: 106.8192,
        phoneRaw: '6281390112233',
        phoneFormatted: '0813-9011-2233',
        isOpen: true,
        hours: '10:00 - 21:00 WIB',
        priceRange: 'Rp 35.000 - Rp 60.000',
        features: 'Hair Coloring, Hair Tattoo, Ruang Tunggu Nyaman, Audio Musik'
      },
      {
        id: 'lead-tc-4',
        name: 'Retro Fade Barbershop',
        category: 'Premium Cuts',
        icon: '💈',
        rating: 4.9,
        reviews: 182,
        address: 'Jl. Raya Citayam No. 105, Cipayung, Kota Depok',
        distanceKm: 1.35,
        distanceText: '1.35 KM',
        lat: -6.4312,
        lng: 106.8115,
        phoneRaw: '6282144556677',
        phoneFormatted: '0821-4455-6677',
        isOpen: true,
        hours: '09:30 - 21:00 WIB',
        priceRange: 'Rp 40.000 - Rp 65.000',
        features: 'Spesialis Fade Cut, Cuci Rambut, Facial Scrub, Free Teh/Kopi'
      },
      {
        id: 'lead-tc-5',
        name: 'Pangkas Rambut Madura Bintang Jaya',
        category: 'Pangkas Tradisional',
        icon: '✂️',
        rating: 4.6,
        reviews: 64,
        address: 'Jl. Bulak Barat No. 12, Cipayung, Kota Depok',
        distanceKm: 1.6,
        distanceText: '1.6 KM',
        lat: -6.4262,
        lng: 106.8225,
        phoneRaw: '6287833445566',
        phoneFormatted: '0878-3344-5566',
        isOpen: true,
        hours: '07:30 - 22:30 WIB',
        priceRange: 'Rp 18.000 - Rp 25.000',
        features: 'Buka Pagi Sampai Malam, Murah & Bersih, Parkir Motor Luas'
      },
      {
        id: 'lead-tc-6',
        name: 'Gentleman & Co Grooming Hub',
        category: 'Executive Barbershop',
        icon: '💈',
        rating: 4.8,
        reviews: 210,
        address: 'Jl. Raya Cipayung Jembatan Serong KM 2 No. 5, Kota Depok',
        distanceKm: 1.9,
        distanceText: '1.9 KM',
        lat: -6.4185,
        lng: 106.8095,
        phoneRaw: '6281277889900',
        phoneFormatted: '0812-7788-9900',
        isOpen: false,
        hours: '11:00 - 22:00 WIB (Buka jam 11:00)',
        priceRange: 'Rp 50.000 - Rp 90.000',
        features: 'Shaving Master, Head Massage, Beard Oil Treatment, Ruang VIP'
      }
    ]
  },

  // Scenario 2: Coffee Shop di Tebet
  'coffee shop_tebet jakarta selatan': {
    center: { name: 'Tebet, Jakarta Selatan', lat: -6.2372, lng: 106.8528 },
    items: [
      {
        id: 'lead-cs-1',
        name: 'Kopi Kenari Tebet Timur',
        category: 'Specialty Coffee',
        icon: '☕',
        rating: 4.8,
        reviews: 512,
        address: 'Jl. Tebet Timur Dalam Raya No. 45, Jakarta Selatan',
        distanceKm: 0.35,
        distanceText: '350 meter',
        lat: -6.2361,
        lng: 106.8539,
        phoneRaw: '6281122334455',
        phoneFormatted: '0811-2233-4455',
        isOpen: true,
        hours: '08:00 - 23:00 WIB',
        priceRange: 'Rp 25.000 - Rp 55.000',
        features: 'Outdoor Garden, Wi-Fi 100Mbps, Stopkontak Tiap Meja, Mocktails'
      },
      {
        id: 'lead-cs-2',
        name: 'Seduh Silang Coffee & Roastery',
        category: 'Artisan Cafe',
        icon: '☕',
        rating: 4.9,
        reviews: 320,
        address: 'Jl. Tebet Barat IX No. 12, Tebet, Jakarta Selatan',
        distanceKm: 0.8,
        distanceText: '800 meter',
        lat: -6.2395,
        lng: 106.8505,
        phoneRaw: '6281988776655',
        phoneFormatted: '0819-8877-6655',
        isOpen: true,
        hours: '07:00 - 22:00 WIB',
        priceRange: 'Rp 30.000 - Rp 65.000',
        features: 'Single Origin Beans, Manual Brew V60, Pastry Fresh, Live Roasting'
      }
    ]
  }
}

// Current Active Leads List
const leads = ref([])

// Computed Statistics
const filteredLeads = computed(() => {
  if (!tableFilterText.value.trim()) return leads.value
  const query = tableFilterText.value.toLowerCase().trim()
  return leads.value.filter(item => 
    item.name.toLowerCase().includes(query) ||
    item.address.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query) ||
    item.phoneFormatted.includes(query) ||
    item.features.toLowerCase().includes(query)
  )
})

const averageRating = computed(() => {
  if (leads.value.length === 0) return '0.0'
  const sum = leads.value.reduce((acc, curr) => acc + curr.rating, 0)
  return (sum / leads.value.length).toFixed(1)
})

const totalReviewsCount = computed(() => {
  return leads.value.reduce((acc, curr) => acc + curr.reviews, 0)
})

const verifiedPhonePercentage = computed(() => {
  if (leads.value.length === 0) return 0
  const count = leads.value.filter(l => l.phoneRaw).length
  return Math.round((count / leads.value.length) * 100)
})

// Initialize Map
const initMap = () => {
  if (!mapContainerRef.value) return
  if (leafletMap) {
    leafletMap.remove()
  }

  // Create Leaflet instance
  leafletMap = L.map(mapContainerRef.value, {
    center: [currentSearchPoint.value.lat, currentSearchPoint.value.lng],
    zoom: 14,
    zoomControl: true
  })

  // Add clean modern tile layer (CartoDB Positron / OSM compatible)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(leafletMap)

  // Initialize Layer Groups
  leadMarkersGroup = L.layerGroup().addTo(leafletMap)

  // Render search center and radius
  renderCenterAndRadius()

  // Render initial leads markers
  renderLeadMarkers()
}

// Render Search Center Marker and Radius Circle
const renderCenterAndRadius = () => {
  if (!leafletMap) return

  // Remove existing center layers if present
  if (radiusCircleLayer) leafletMap.removeLayer(radiusCircleLayer)
  if (centerMarkerLayer) leafletMap.removeLayer(centerMarkerLayer)

  const { lat, lng, name } = currentSearchPoint.value
  const radiusInMeters = searchRadius.value * 1000

  // 1. Draw Radius Circle
  radiusCircleLayer = L.circle([lat, lng], {
    radius: radiusInMeters,
    color: '#3E4C8A',
    fillColor: '#3E4C8A',
    fillOpacity: 0.12,
    weight: 2,
    dashArray: '6, 8'
  }).addTo(leafletMap)

  // 2. Center Marker with Ripple Pulse HTML
  const centerIconHtml = `
    <div class="custom-center-pin">
      <div class="pulse-ring"></div>
      <div class="pin-core">🎯</div>
    </div>
  `
  const centerIcon = L.divIcon({
    html: centerIconHtml,
    className: 'custom-leaflet-div-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  })

  centerMarkerLayer = L.marker([lat, lng], { icon: centerIcon })
    .bindPopup(`
      <div style="font-family: inherit; font-size: 13px; text-align: center; padding: 4px;">
        <strong style="color: #3E4C8A; font-size: 14px;">📍 Titik Pencarian</strong>
        <p style="margin: 4px 0 0 0; color: #555;">${name}</p>
        <div style="margin-top: 6px; font-size: 11px; background: #EEF2FF; color: #3730A3; padding: 2px 6px; border-radius: 4px; display: inline-block;">
          Radius: ${searchRadius.value} KM
        </div>
      </div>
    `)
    .addTo(leafletMap)
}

// Render Pins for each lead
const renderLeadMarkers = () => {
  if (!leafletMap || !leadMarkersGroup) return
  leadMarkersGroup.clearLayers()

  leads.value.forEach((lead, idx) => {
    const isSelected = selectedLead.value?.id === lead.id
    const pinHtml = `
      <div class="custom-lead-pin ${isSelected ? 'active-pin' : ''}">
        <span class="pin-icon">${lead.icon || '💈'}</span>
        <span class="pin-index">${idx + 1}</span>
      </div>
    `
    const leadIcon = L.divIcon({
      html: pinHtml,
      className: 'custom-leaflet-div-icon',
      iconSize: [36, 42],
      iconAnchor: [18, 42],
      popupAnchor: [0, -40]
    })

    const marker = L.marker([lead.lat, lead.lng], { icon: leadIcon })

    // Popup Content
    const popupContent = `
      <div class="leaflet-popup-card">
        <div class="pop-header">
          <span class="pop-cat">${lead.category}</span>
          <span class="pop-rate">⭐ ${lead.rating}</span>
        </div>
        <h4 class="pop-title">${lead.name}</h4>
        <p class="pop-addr">${lead.address}</p>
        <div class="pop-meta">
          <span>📍 ${lead.distanceText}</span>
          <span style="color: ${lead.isOpen ? '#2F7A5D' : '#888'}">
            ${lead.isOpen ? '● Buka' : '○ Tutup'}
          </span>
        </div>
        <div class="pop-actions">
          <a href="https://wa.me/${lead.phoneRaw}" target="_blank" class="pop-btn-wa">
            💬 Hubungi WA
          </a>
        </div>
      </div>
    `
    marker.bindPopup(popupContent)

    marker.on('click', () => {
      selectedLead.value = lead
      // Highlight matching row
    })

    leadMarkersGroup.addLayer(marker)
  })
}

// When radius slider changes
const onRadiusChange = () => {
  if (radiusCircleLayer) {
    radiusCircleLayer.setRadius(searchRadius.value * 1000)
  }
}

// Recenter Map to fit both radius circle and all markers
const recenterMap = () => {
  if (!leafletMap) return
  if (radiusCircleLayer) {
    leafletMap.fitBounds(radiusCircleLayer.getBounds(), { padding: [30, 30] })
  } else {
    leafletMap.setView([currentSearchPoint.value.lat, currentSearchPoint.value.lng], 14)
  }
}

// Focus a single lead on map
const focusLeadOnMap = (lead) => {
  selectedLead.value = lead
  if (!leafletMap) return

  leafletMap.flyTo([lead.lat, lead.lng], 16, {
    animate: true,
    duration: 1
  })

  // Re-render markers to update active pin class
  renderLeadMarkers()

  // Open popup if found
  if (leadMarkersGroup) {
    leadMarkersGroup.eachLayer(layer => {
      const latLng = layer.getLatLng()
      if (Math.abs(latLng.lat - lead.lat) < 0.0001 && Math.abs(latLng.lng - lead.lng) < 0.0001) {
        layer.openPopup()
      }
    })
  }
}

// Dynamic Mock Generator for any custom search query
const generateDynamicLeads = (keyword, location, count = 6) => {
  // Hash seed from string
  const str = (keyword + location).toLowerCase()
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }

  // Base coordinates approximation for known areas or default
  let baseLat = -6.4255
  let baseLng = 106.8150
  let cleanLocName = location

  if (str.includes('cipayung') || str.includes('depok')) {
    baseLat = -6.4255; baseLng = 106.8150
    cleanLocName = 'Cipayung, Kota Depok'
  } else if (str.includes('tebet') || str.includes('jakarta')) {
    baseLat = -6.2372; baseLng = 106.8528
    cleanLocName = 'Tebet, Jakarta Selatan'
  } else if (str.includes('margonda')) {
    baseLat = -6.3725; baseLng = 106.8320
    cleanLocName = 'Margonda Raya, Depok'
  } else if (str.includes('fatmawati')) {
    baseLat = -6.2922; baseLng = 106.7972
    cleanLocName = 'Fatmawati, Jakarta Selatan'
  } else if (str.includes('bandung')) {
    baseLat = -6.9175; baseLng = 107.6191
    cleanLocName = 'Bandung Kota'
  } else if (str.includes('surabaya')) {
    baseLat = -7.2575; baseLng = 112.7521
    cleanLocName = 'Surabaya'
  }

  currentSearchPoint.value = {
    name: cleanLocName,
    lat: baseLat,
    lng: baseLng
  }

  const icons = keyword.toLowerCase().includes('cukur') || keyword.toLowerCase().includes('barber')
    ? ['💈', '✂️', '💈', '💈', '✂️', '💈']
    : keyword.toLowerCase().includes('kopi') || keyword.toLowerCase().includes('cafe')
    ? ['☕', '🍵', '☕', '🥐', '☕', '☕']
    : keyword.toLowerCase().includes('bengkel') || keyword.toLowerCase().includes('motor') || keyword.toLowerCase().includes('mobil')
    ? ['🔧', '🚗', '🛠️', '🏍️', '⚙️', '🔧']
    : ['🏢', '🏪', '⭐', '📍', '🛍️', '📦']

  const prefixes = ['Sentosa', 'Prima', 'Bintang', 'Maju Terus', 'Berkah', 'Utama', 'Kencana', 'Modern']
  const generated = []

  for (let i = 0; i < count; i++) {
    // Generate slight offset within search radius
    const angle = (i / count) * 2 * Math.PI + (hash % 10) * 0.1
    const distRatio = 0.2 + (i / count) * 0.7
    const distKm = parseFloat((distRatio * searchRadius.value).toFixed(2))

    // approx degrees offset
    const latOffset = (distKm / 111) * Math.cos(angle)
    const lngOffset = (distKm / (111 * Math.cos(baseLat * Math.PI / 180))) * Math.sin(angle)

    const randomRating = (4.5 + ((i * 3 + 7) % 5) * 0.1).toFixed(1)
    const randomReviews = 40 + ((i * 37 + hash) % 220)
    const phoneNum = '0812' + String(10000000 + ((i * 87654321 + Math.abs(hash)) % 89999999))

    generated.push({
      id: `gen-lead-${i}`,
      name: `${keyword} ${prefixes[i % prefixes.length]} ${location.split(' ')[0]}`,
      category: `Usaha ${keyword}`,
      icon: icons[i % icons.length],
      rating: parseFloat(randomRating),
      reviews: randomReviews,
      address: `Jl. Raya ${location} No. ${15 + i * 18}, Kel. ${location}, Jawa Barat`,
      distanceKm: distKm,
      distanceText: distKm < 1 ? `${Math.round(distKm * 1000)} meter` : `${distKm} KM`,
      lat: baseLat + latOffset,
      lng: baseLng + lngOffset,
      phoneRaw: '62' + phoneNum.substring(1),
      phoneFormatted: phoneNum.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3'),
      isOpen: i % 5 !== 3,
      hours: i % 2 === 0 ? '08:00 - 21:00 WIB' : '09:00 - 22:00 WIB',
      priceRange: 'Rp 25.000 - Rp 65.000',
      features: 'Pelayanan Ramah, Tempat Nyaman, Pembayaran QRIS/Tunai'
    })
  }

  return generated
}

// Perform Search Action
const handleSearch = () => {
  isSearching.value = true
  selectedLead.value = null

  setTimeout(() => {
    const key = `${searchKeyword.value.toLowerCase().trim()}_${searchLocation.value.toLowerCase().trim()}`
    
    // Check if preset matches exactly
    if (MOCK_DATASETS[key]) {
      const data = MOCK_DATASETS[key]
      currentSearchPoint.value = { ...data.center }
      leads.value = [...data.items]
    } else {
      // Dynamic realistic generator
      leads.value = generateDynamicLeads(searchKeyword.value, searchLocation.value, 6)
    }

    // Refresh map position
    if (leafletMap) {
      leafletMap.setView([currentSearchPoint.value.lat, currentSearchPoint.value.lng], 14)
      renderCenterAndRadius()
      renderLeadMarkers()
      recenterMap()
    }

    isSearching.value = false
    showToast(`✓ Berhasil memetakan ${leads.value.length} prospek di ${searchLocation.value}`)
  }, 450)
}

// Apply quick scenario
const applyScenario = (scenario) => {
  searchKeyword.value = scenario.keyword
  searchLocation.value = scenario.location
  searchRadius.value = scenario.radius
  handleSearch()
}

// Export to CSV
const exportToCsv = () => {
  if (leads.value.length === 0) return

  const headers = ['No', 'Nama Bisnis', 'Kategori', 'Rating', 'Jumlah Ulasan', 'Alamat', 'Jarak (KM)', 'WhatsApp', 'Status Buka', 'Jam Buka', 'Harga & Layanan']
  const rows = leads.value.map((l, i) => [
    i + 1,
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.category}"`,
    l.rating,
    l.reviews,
    `"${l.address.replace(/"/g, '""')}"`,
    l.distanceKm,
    `"${l.phoneFormatted}"`,
    l.isOpen ? 'Buka' : 'Tutup',
    `"${l.hours}"`,
    `"${l.priceRange} - ${l.features.replace(/"/g, '""')}"`
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `Leads_${searchKeyword.value}_${searchLocation.value}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  showToast('✓ File CSV berhasil diunduh!')
}

// Copy All Contacts
const copyAllContacts = () => {
  if (leads.value.length === 0) return
  const text = leads.value
    .map((l, i) => `${i + 1}. ${l.name} | ${l.phoneFormatted} | ${l.address}`)
    .join('\n')

  navigator.clipboard.writeText(text).then(() => {
    copiedContacts.value = true
    showToast('✓ Semua nomor kontak disalin ke clipboard!')
    setTimeout(() => {
      copiedContacts.value = false
    }, 2500)
  })
}

// Copy single string
const copyText = (txt) => {
  navigator.clipboard.writeText(txt).then(() => {
    showToast(`✓ Disalin: ${txt}`)
  })
}

// Open Details Modal
const openLeadDetails = (lead) => {
  detailModalLead.value = { ...lead }
}

// Save lead as note in QuickNotes
const saveLeadAsNote = (lead) => {
  const noteData = {
    title: `Prospek: ${lead.name}`,
    content: `📍 Alamat: ${lead.address}\n📞 Kontak: ${lead.phoneFormatted} (https://wa.me/${lead.phoneRaw})\n⭐ Rating: ${lead.rating} (${lead.reviews} ulasan)\n📏 Jarak: ${lead.distanceText}\n💵 Tarif: ${lead.priceRange}\n✨ Fasilitas: ${lead.features}\n\nCatatan Follow Up: ${lead.customNote || 'Belum dihubungi'}`,
    tags: ['Lead', lead.category.split(' ')[0], searchLocation.value.split(' ')[0]]
  }

  // Also save to localStorage taskflow_quick_notes
  try {
    const localData = localStorage.getItem('taskflow_quick_notes')
    let notes = localData ? JSON.parse(localData) : []
    const now = new Date()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    notes.unshift({
      id: 'lead_note_' + Date.now(),
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags,
      color: '#3E4C8A', // Brand Blue
      updatedAt: dateStr
    })
    localStorage.setItem('taskflow_quick_notes', JSON.stringify(notes))
    showToast(`✓ Prospek "${lead.name}" disimpan ke Quick Notes!`)
  } catch (e) {
    showToast('✓ Berhasil menyimpan catatan')
  }

  emit('save-to-notes', noteData)
}

// Show Toast
const showToast = (msg) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

// Mount Lifecycle
onMounted(() => {
  // Load default scenario: "Tukang Cukur di Cipayung Depok"
  const defaultKey = 'tukang cukur_cipayung depok'
  const defaultData = MOCK_DATASETS[defaultKey]
  currentSearchPoint.value = { ...defaultData.center }
  leads.value = [...defaultData.items]

  nextTick(() => {
    initMap()
  })
})

onBeforeUnmount(() => {
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }
})
</script>

<style scoped>
/* Main Container */
.lead-generator {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  padding-bottom: 40px;
}

/* Header Banner */
.lead-header-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(62, 76, 138, 0.08) 0%, rgba(47, 122, 93, 0.08) 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px 28px;
  backdrop-filter: blur(10px);
}

.banner-content {
  max-width: 680px;
}

.badge-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-brand);
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-success);
  box-shadow: 0 0 0 0 rgba(47, 122, 93, 0.6);
  animation: pulse 1.8s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(47, 122, 93, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(47, 122, 93, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(47, 122, 93, 0); }
}

.banner-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}

.banner-subtitle {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: 1.5;
}

.banner-actions {
  display: flex;
  gap: 10px;
}

.btn-action-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-panel);
  color: var(--color-ink);
  border: 1px solid var(--color-border);
  padding: 9px 16px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-card);
}

.btn-action-outline:hover:not(:disabled) {
  border-color: var(--color-brand);
  color: var(--color-brand);
  transform: translateY(-1px);
  box-shadow: var(--shadow-card-hover);
}

.btn-action-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Search Panel Card */
.search-panel-card {
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 22px 24px;
  box-shadow: var(--shadow-card);
}

.search-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1.3fr auto;
  gap: 18px;
  align-items: flex-end;
}

.form-group-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-ink);
}

.input-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.custom-input {
  width: 100%;
  height: 44px;
  padding: 0 34px 0 14px;
  background-color: var(--color-paper);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-ink);
  font-size: var(--text-sm);
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.custom-input:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(62, 76, 138, 0.15);
}

.clear-input-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  font-size: 13px;
  padding: 4px;
}

.radius-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.radius-badge {
  font-size: var(--text-xs);
  font-weight: 700;
  background: rgba(62, 76, 138, 0.12);
  color: var(--color-brand);
  padding: 2px 8px;
  border-radius: 999px;
}

.radius-control-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radius-slider {
  width: 100%;
  accent-color: var(--color-brand);
  cursor: pointer;
  height: 6px;
}

.radius-presets {
  display: flex;
  gap: 6px;
}

.preset-chip {
  flex: 1;
  padding: 4px 6px;
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 500;
  color: var(--color-muted);
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
}

.preset-chip:hover {
  border-color: var(--color-brand);
  color: var(--color-brand);
}

.preset-chip.active {
  background-color: var(--color-brand);
  color: #FFFFFF;
  border-color: var(--color-brand);
}

.search-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  padding: 0 24px;
  background-color: var(--color-brand);
  color: #FFFFFF;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(62, 76, 138, 0.25);
}

.search-submit-btn:hover:not(:disabled) {
  background-color: var(--color-brand-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(62, 76, 138, 0.35);
}

.search-submit-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Scenarios Suggestions */
.scenario-suggestions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px dashed var(--color-border);
  flex-wrap: wrap;
}

.scenario-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
  font-weight: 500;
}

.scenario-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.scenario-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-size: var(--text-xs);
  cursor: pointer;
  transition: all 0.2s ease;
}

.scenario-pill:hover {
  border-color: var(--color-brand);
  background: rgba(62, 76, 138, 0.08);
  transform: translateY(-1px);
}

.sc-title {
  font-weight: 600;
  color: var(--color-ink);
}

.sc-loc {
  color: var(--color-muted);
}

/* Stats Overview Grid */
.stats-overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px 18px;
  box-shadow: var(--shadow-card);
}

.kpi-icon-box {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-icon-box.brand { background: rgba(62, 76, 138, 0.12); color: var(--color-brand); }
.kpi-icon-box.success { background: rgba(47, 122, 93, 0.12); color: var(--color-success); }
.kpi-icon-box.warning { background: rgba(184, 134, 11, 0.12); color: var(--color-warning); }
.kpi-icon-box.signal { background: rgba(232, 86, 47, 0.12); color: var(--color-signal); }

.kpi-content {
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 11px;
  color: var(--color-muted);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.kpi-number {
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--color-ink);
  line-height: 1.2;
  margin: 2px 0;
}

.kpi-sub {
  font-size: 11px;
  color: var(--color-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Map Section */
.map-view-wrapper {
  position: relative;
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.map-toolbar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background-color: var(--color-panel);
  border-bottom: 1px solid var(--color-border);
}

.map-toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.map-title-icon {
  font-size: 18px;
}

.map-section-title {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-ink);
}

.map-subtitle {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.map-toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.map-control-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-ink);
  cursor: pointer;
  transition: all 0.2s ease;
}

.map-control-btn:hover {
  background: var(--color-brand);
  color: #FFFFFF;
  border-color: var(--color-brand);
}

.map-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: var(--color-muted);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.center { background: #3E4C8A; }
.legend-dot.lead { background: #E8562F; }

.legend-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px dashed #3E4C8A;
}

.leaflet-map-element {
  width: 100%;
  height: 420px;
  background-color: var(--color-paper);
  z-index: 1;
}

/* Floating Lead Detail on Map */
.map-floating-overlay {
  position: absolute;
  top: 60px;
  right: 18px;
  width: 310px;
  z-index: 1000;
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
  box-shadow: var(--shadow-modal);
  backdrop-filter: blur(12px);
  animation: slideInRight 0.25s ease;
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(12px); }
  to { opacity: 1; transform: translateX(0); }
}

.floating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.floating-badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  background: rgba(62, 76, 138, 0.1);
  color: var(--color-brand);
  padding: 2px 8px;
  border-radius: 4px;
}

.close-floating-btn {
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  font-size: 14px;
}

.floating-title {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 4px;
}

.floating-address {
  font-size: 11px;
  color: var(--color-muted);
  line-height: 1.4;
  margin-bottom: 10px;
}

.floating-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border);
}

.meta-rating { color: var(--color-warning); }
.meta-distance { color: var(--color-brand); }

.floating-actions {
  display: flex;
  gap: 8px;
}

.btn-wa-sm {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-success);
  color: #FFFFFF;
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
}

.btn-detail-sm {
  flex: 1;
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  color: var(--color-ink);
  font-size: 11px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

/* Leads Table Section */
.leads-table-container {
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.table-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
  gap: 16px;
}

.table-title-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.table-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--color-ink);
}

.table-count-badge {
  font-size: 11px;
  font-weight: 700;
  background: rgba(47, 122, 93, 0.12);
  color: var(--color-success);
  padding: 3px 8px;
  border-radius: 999px;
}

.table-section-desc {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.table-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  padding: 6px 12px;
  border-radius: var(--radius-md);
  color: var(--color-muted);
  width: 250px;
}

.table-search-input {
  background: none;
  border: none;
  outline: none;
  color: var(--color-ink);
  font-size: var(--text-xs);
  font-family: inherit;
  width: 100%;
}

.table-responsive-wrapper {
  width: 100%;
  overflow-x: auto;
}

.leads-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: var(--text-sm);
}

.leads-table th {
  background-color: var(--color-paper);
  color: var(--color-muted);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.leads-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-ink);
  vertical-align: middle;
}

.leads-table tbody tr {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.leads-table tbody tr:hover {
  background-color: rgba(62, 76, 138, 0.04);
}

.leads-table tbody tr.row-active {
  background-color: rgba(62, 76, 138, 0.09);
  border-left: 3px solid var(--color-brand);
}

.col-num {
  font-weight: 600;
  color: var(--color-muted);
  font-size: var(--text-xs);
}

.biz-name-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.biz-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.biz-info {
  display: flex;
  flex-direction: column;
}

.biz-title {
  font-weight: 600;
  color: var(--color-ink);
  font-size: var(--text-sm);
}

.biz-badge {
  font-size: 10px;
  color: var(--color-muted);
}

.rating-box {
  display: flex;
  flex-direction: column;
}

.stars-val {
  font-weight: 700;
  color: var(--color-warning);
  font-size: var(--text-xs);
}

.reviews-count {
  font-size: 11px;
  color: var(--color-muted);
}

.address-text {
  font-size: var(--text-xs);
  color: var(--color-ink);
  line-height: 1.4;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.distance-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(62, 76, 138, 0.08);
  color: var(--color-brand);
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.contact-box {
  display: flex;
  align-items: center;
  gap: 6px;
}

.wa-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(47, 122, 93, 0.1);
  color: var(--color-success);
  padding: 5px 10px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  font-size: var(--text-xs);
  font-weight: 600;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.wa-link:hover {
  background: var(--color-success);
  color: #FFFFFF;
}

.copy-cell-btn {
  background: none;
  border: 1px solid var(--color-border);
  padding: 4px 6px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 11px;
  color: var(--color-muted);
  transition: background 0.15s ease;
}

.copy-cell-btn:hover {
  background: var(--color-paper);
}

.status-chip {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  margin-bottom: 2px;
}

.status-chip.open { background: rgba(47, 122, 93, 0.12); color: var(--color-success); }
.status-chip.closed { background: rgba(232, 86, 47, 0.12); color: var(--color-signal); }

.hours-text {
  display: block;
  font-size: 11px;
  color: var(--color-muted);
}

.price-range {
  font-weight: 600;
  font-size: var(--text-xs);
  color: var(--color-ink);
}

.features-list {
  font-size: 10px;
  color: var(--color-muted);
  line-height: 1.3;
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-tbl-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 14px;
}

.btn-tbl-icon:hover {
  border-color: var(--color-brand);
  background: rgba(62, 76, 138, 0.1);
  transform: scale(1.08);
}

.empty-table-cell {
  text-align: center;
  padding: 40px !important;
}

.empty-table-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--color-muted);
}

/* Modal Dialog */
.lead-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.lead-modal-card {
  width: 100%;
  max-width: 580px;
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  overflow: hidden;
}

.modal-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 22px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-paper);
}

.modal-category-tag {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-brand);
  background: rgba(62, 76, 138, 0.1);
  padding: 3px 10px;
  border-radius: 999px;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: var(--color-muted);
  cursor: pointer;
}

.modal-body-content {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.modal-title-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modal-avatar {
  font-size: 32px;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-ink);
}

.modal-rating {
  font-size: var(--text-xs);
  color: var(--color-muted);
  display: flex;
  gap: 6px;
  margin-top: 2px;
}

.modal-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.modal-info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-info-item.full {
  grid-column: span 2;
}

.m-label {
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--color-muted);
}

.m-val {
  font-size: var(--text-sm);
  color: var(--color-ink);
  line-height: 1.4;
}

.m-val.highlight {
  font-weight: 600;
  color: var(--color-brand);
}

.m-val.phone-link a {
  color: var(--color-success);
  font-weight: 600;
  text-decoration: none;
}

.modal-textarea {
  width: 100%;
  height: 70px;
  padding: 10px;
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: var(--text-xs);
  color: var(--color-ink);
  outline: none;
  resize: vertical;
}

.modal-footer-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding: 16px 22px;
  border-top: 1px solid var(--color-border);
  background: var(--color-paper);
}

.btn-modal-sec {
  background: none;
  border: 1px solid var(--color-border);
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-ink);
  cursor: pointer;
}

.btn-modal-pri {
  background: var(--color-brand);
  border: none;
  color: #FFFFFF;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
}

.btn-modal-wa {
  background: var(--color-success);
  color: #FFFFFF;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
}

/* Toast Message */
.toast-notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #1B1F3B;
  color: #FFFFFF;
  padding: 12px 20px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  z-index: 10000;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Leaflet Custom Marker & Popup Styles */
:deep(.custom-leaflet-div-icon) {
  background: transparent;
  border: none;
}

:deep(.custom-center-pin) {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.custom-center-pin .pin-core) {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #3E4C8A;
  color: #FFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(62, 76, 138, 0.5);
  z-index: 2;
}

:deep(.custom-center-pin .pulse-ring) {
  position: absolute;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid #3E4C8A;
  animation: centerPulse 2s infinite ease-out;
  z-index: 1;
}

@keyframes centerPulse {
  0% { transform: scale(0.6); opacity: 1; }
  100% { transform: scale(1.8); opacity: 0; }
}

:deep(.custom-lead-pin) {
  width: 36px;
  height: 42px;
  background: #E8562F;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(0,0,0,0.3);
  transition: transform 0.2s ease;
  position: relative;
}

:deep(.custom-lead-pin.active-pin) {
  background: #2F7A5D;
  transform: rotate(-45deg) scale(1.2);
  box-shadow: 0 0 16px rgba(47, 122, 93, 0.8);
  z-index: 999;
}

:deep(.custom-lead-pin .pin-icon) {
  transform: rotate(45deg);
  font-size: 14px;
}

:deep(.custom-lead-pin .pin-index) {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #FFFFFF;
  color: #1B1F3B;
  font-size: 10px;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(45deg);
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

:deep(.leaflet-popup-card) {
  font-family: 'Inter', sans-serif;
  min-width: 220px;
  padding: 4px;
}

:deep(.leaflet-popup-card .pop-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

:deep(.leaflet-popup-card .pop-cat) {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #3E4C8A;
}

:deep(.leaflet-popup-card .pop-rate) {
  font-size: 11px;
  font-weight: 700;
  color: #B8860B;
}

:deep(.leaflet-popup-card .pop-title) {
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #1B1F3B;
}

:deep(.leaflet-popup-card .pop-addr) {
  font-size: 11px;
  color: #555;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

:deep(.leaflet-popup-card .pop-meta) {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 8px;
}

:deep(.leaflet-popup-card .pop-btn-wa) {
  display: block;
  text-align: center;
  background: #2F7A5D;
  color: #FFF !important;
  text-decoration: none;
  padding: 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

/* Responsive Breakpoints */
@media (max-width: 1024px) {
  .search-form-grid {
    grid-template-columns: 1fr 1fr;
  }
  .form-group-action {
    grid-column: span 2;
  }
  .stats-overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .lead-header-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .banner-actions {
    width: 100%;
  }
  .btn-action-outline {
    flex: 1;
    justify-content: center;
  }
  .search-form-grid {
    grid-template-columns: 1fr;
  }
  .form-group-action {
    grid-column: span 1;
  }
  .stats-overview-grid {
    grid-template-columns: 1fr;
  }
  .map-toolbar-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .map-toolbar-right {
    width: 100%;
    justify-content: space-between;
  }
  .map-floating-overlay {
    position: static;
    width: 100%;
    border-radius: 0;
  }
  .table-header-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .table-search-box {
    width: 100%;
  }
}
</style>
