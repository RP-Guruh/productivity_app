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
              placeholder="misal: Tukang Cukur, Barbershop, Kafe..."
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
              placeholder="misal: Cipayung Depok, Tebet, Margonda..."
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

      <!-- Quick Examples -->
      <div class="quick-examples">
        <span class="label">Contoh:</span>
        <button 
          v-for="(item, i) in exampleSearches" 
          :key="i"
          type="button" 
          class="example-tag"
          @click="applyExample(item)"
        >
          {{ item.keyword }} di {{ item.location }}
        </button>
      </div>
    </div>

    <!-- Metrics Bar -->
    <div class="metrics-bar" v-if="leads.length > 0">
      <div class="metric-item">
        <span class="metric-label">Hasil</span>
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
        <span class="metric-value">{{ searchRadius }} km</span>
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
          <span class="map-meta">({{ searchKeyword }} di sekitar {{ searchLocation }})</span>
          <span v-if="isFullscreen" class="esc-hint">Tekan ESC untuk keluar</span>
        </div>

        <div class="map-controls">
          <div class="layer-control">
            <svg class="layer-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            <span>Layer:</span>
            <select v-model="selectedTileProvider" @change="changeTileLayer" title="Pilih tipe peta Leaflet">
              <option value="osm">OpenStreetMap (Standar)</option>
              <option value="esri_sat">Satelit / Foto Udara</option>
              <option value="esri_streets">Esri Jalanan</option>
              <option value="esri_topo">Topografi (Esri)</option>
              <option value="carto_light">Minimalis Terang</option>
              <option value="carto_dark">Mode Gelap (Dark)</option>
              <option value="opentopo">OpenTopoMap (Kontur)</option>
            </select>
          </div>

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
      <div class="active-place-card" v-if="selectedLead">
        <div class="place-header">
          <div>
            <span class="place-category">{{ selectedLead.category }}</span>
            <h4 class="place-name">{{ selectedLead.name }}</h4>
          </div>
          <button class="btn-close-card" @click="selectedLead = null" aria-label="Tutup">✕</button>
        </div>
        <p class="place-address">{{ selectedLead.address }}</p>
        <div class="place-details">
          <span>★ {{ selectedLead.rating }} ({{ selectedLead.reviews }} ulasan)</span>
          <span>•</span>
          <span>Jarak {{ selectedLead.distanceText }}</span>
          <span>•</span>
          <span :class="selectedLead.isOpen ? 'status-open' : 'status-closed'">
            {{ selectedLead.isOpen ? 'Buka' : 'Tutup' }}
          </span>
        </div>
        <div class="place-actions">
          <a :href="'https://wa.me/' + selectedLead.phoneRaw" target="_blank" class="btn-whatsapp">
            Hubungi WhatsApp ({{ selectedLead.phoneFormatted }})
          </a>
          <button class="btn-subtle-sm" @click="openLeadDetails(selectedLead)">
            Lihat Rincian
          </button>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="table-card">
      <div class="table-header">
        <div>
          <h3 class="table-title">Daftar Tempat Usaha</h3>
          <p class="table-subtitle">Klik salah satu baris untuk melihat posisinya di peta.</p>
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
              <th style="width: 90px; text-align: center;">Aksi</th>
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
                  <button class="btn-icon" @click="focusLeadOnMap(lead)" title="Lihat di Peta">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </button>
                  <button class="btn-icon" @click="openLeadDetails(lead)" title="Detail">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  </button>
                </div>
              </td>
            </tr>

            <!-- Baris Kosong jika filter tidak cocok -->
            <tr v-if="filteredLeads.length === 0">
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
            <span class="info-value">{{ detailModalLead.distanceText }} dari pusat pencarian</span>
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

// Search inputs
const searchKeyword = ref('Tukang Cukur')
const searchLocation = ref('Cipayung Depok')
const searchRadius = ref(3)
const isSearching = ref(false)
const isLocating = ref(false)
const userLocationCoords = ref(null)
const copiedContacts = ref(false)
const tableFilterText = ref('')
const selectedLead = ref(null)
const detailModalLead = ref(null)
const toastMessage = ref('')

// Map setup
const mapContainerRef = ref(null)
const mapCardRef = ref(null)
const isFullscreen = ref(false)

let leafletMap = null
let radiusCircleLayer = null
let centerMarkerLayer = null
let leadMarkersGroup = null
let currentTileLayer = null
let leafletLayersControl = null
let baseLayersMap = {}

// Current center coordinates (Cipayung Depok)
const currentSearchPoint = ref({
  name: 'Cipayung, Depok',
  lat: -6.4255,
  lng: 106.8150
})

// Quick example suggestions
const exampleSearches = [
  { keyword: 'Tukang Cukur', location: 'Cipayung Depok', radius: 3 },
  { keyword: 'Coffee Shop', location: 'Tebet Jakarta', radius: 2 },
  { keyword: 'Kuliner', location: 'Margonda Depok', radius: 4 },
  { keyword: 'Bengkel Motor', location: 'Sawangan Depok', radius: 3 }
]

// Tile Providers (No API Key Required - Leaflet Compatible)
const selectedTileProvider = ref('osm')
const TILE_PROVIDERS = {
  osm: {
    name: 'OpenStreetMap (Standar)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      attribution: '&copy; OpenStreetMap contributors',
      subdomains: ['a', 'b', 'c'],
      maxZoom: 19
    }
  },
  esri_sat: {
    name: 'Satelit / Foto Udara',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
      maxZoom: 18
    }
  },
  esri_streets: {
    name: 'Esri Jalanan',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    options: {
      attribution: 'Tiles &copy; Esri',
      maxZoom: 18
    }
  },
  esri_topo: {
    name: 'Topografi (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    options: {
      attribution: 'Tiles &copy; Esri',
      maxZoom: 18
    }
  },
  carto_light: {
    name: 'Minimalis Terang',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    options: {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }
  },
  carto_dark: {
    name: 'Mode Gelap (Dark)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    options: {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }
  },
  opentopo: {
    name: 'OpenTopoMap (Kontur)',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    options: {
      attribution: '&copy; OpenTopoMap (CC-BY-SA)',
      maxZoom: 17
    }
  }
}

// Realistic Indonesian Barber Dataset for Cipayung Depok
const MOCK_DATASETS = {
  'tukang cukur_cipayung depok': {
    center: { name: 'Cipayung, Depok', lat: -6.4255, lng: 106.8150 },
    items: [
      {
        id: 'tc-1',
        name: 'Captain Barbershop Cipayung',
        category: 'Barbershop',
        rating: 4.9,
        reviews: 248,
        address: 'Jl. Raya Cipayung No. 28, RT 02/RW 04, Cipayung, Depok',
        distanceKm: 0.45,
        distanceText: '450 m',
        lat: -6.4231,
        lng: 106.8142,
        phoneRaw: '6281288997711',
        phoneFormatted: '+62 812-8899-7711',
        isOpen: true,
        hours: '09.00 - 21.30 WIB',
        priceRange: 'Rp 45.000 - Rp 70.000',
        features: 'Potong rambut, cuci rambut, pijat kepala, pomade'
      },
      {
        id: 'tc-2',
        name: 'Pangkas Rambut Barokah Garut',
        category: 'Pangkas Tradisional',
        rating: 4.8,
        reviews: 135,
        address: 'Jl. Jembatan Serong RT 03/RW 02, Cipayung, Depok',
        distanceKm: 0.78,
        distanceText: '780 m',
        lat: -6.4278,
        lng: 106.8165,
        phoneRaw: '6285712349876',
        phoneFormatted: '+62 857-1234-9876',
        isOpen: true,
        hours: '08.00 - 22.00 WIB',
        priceRange: 'Rp 20.000 - Rp 25.000',
        features: 'Potong rambut pria & anak, cukur jenggot, pijat leher'
      },
      {
        id: 'tc-3',
        name: "D'Kins Barbershop",
        category: 'Barbershop',
        rating: 4.7,
        reviews: 98,
        address: 'Jl. Pitara Raya No. 88, Cipayung Jaya, Depok',
        distanceKm: 1.1,
        distanceText: '1,1 km',
        lat: -6.4215,
        lng: 106.8192,
        phoneRaw: '6281390112233',
        phoneFormatted: '+62 813-9011-2233',
        isOpen: true,
        hours: '10.00 - 21.00 WIB',
        priceRange: 'Rp 35.000 - Rp 60.000',
        features: 'Hair cut, styling, coloring, cuci rambut'
      },
      {
        id: 'tc-4',
        name: 'Retro Fade Barbershop',
        category: 'Barbershop',
        rating: 4.9,
        reviews: 182,
        address: 'Jl. Raya Citayam No. 105, Cipayung, Depok',
        distanceKm: 1.35,
        distanceText: '1,3 km',
        lat: -6.4312,
        lng: 106.8115,
        phoneRaw: '6282144556677',
        phoneFormatted: '+62 821-4455-6677',
        isOpen: true,
        hours: '09.30 - 21.00 WIB',
        priceRange: 'Rp 40.000 - Rp 65.000',
        features: 'Fade cut, taper fade, shaving, hot towel'
      },
      {
        id: 'tc-5',
        name: 'Pangkas Rambut Madura Bintang Jaya',
        category: 'Pangkas Tradisional',
        rating: 4.6,
        reviews: 64,
        address: 'Jl. Bulak Barat No. 12, Cipayung, Depok',
        distanceKm: 1.6,
        distanceText: '1,6 km',
        lat: -6.4262,
        lng: 106.8225,
        phoneRaw: '6287833445566',
        phoneFormatted: '+62 878-3344-5566',
        isOpen: true,
        hours: '07.30 - 22.30 WIB',
        priceRange: 'Rp 18.000 - Rp 25.000',
        features: 'Potong rambut rapi, kumis, jenggot'
      },
      {
        id: 'tc-6',
        name: 'Gentleman Cut Barbershop',
        category: 'Barbershop',
        rating: 4.8,
        reviews: 210,
        address: 'Jl. Cipayung Raya KM 2 No. 5, Depok',
        distanceKm: 1.9,
        distanceText: '1,9 km',
        lat: -6.4185,
        lng: 106.8095,
        phoneRaw: '6281277889900',
        phoneFormatted: '+62 812-7788-9900',
        isOpen: false,
        hours: '11.00 - 22.00 WIB (Buka jam 11.00)',
        priceRange: 'Rp 50.000 - Rp 85.000',
        features: 'Paket komplit, cuci rambut, pijat, vitamin'
      }
    ]
  }
}

const leads = ref([])

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

  // Pre-generate Leaflet base layers
  baseLayersMap = {
    'OpenStreetMap (Standar)': L.tileLayer(TILE_PROVIDERS.osm.url, TILE_PROVIDERS.osm.options),
    'Satelit / Foto Udara': L.tileLayer(TILE_PROVIDERS.esri_sat.url, TILE_PROVIDERS.esri_sat.options),
    'Esri Jalanan': L.tileLayer(TILE_PROVIDERS.esri_streets.url, TILE_PROVIDERS.esri_streets.options),
    'Topografi (Esri)': L.tileLayer(TILE_PROVIDERS.esri_topo.url, TILE_PROVIDERS.esri_topo.options),
    'Minimalis Terang': L.tileLayer(TILE_PROVIDERS.carto_light.url, TILE_PROVIDERS.carto_light.options),
    'Mode Gelap': L.tileLayer(TILE_PROVIDERS.carto_dark.url, TILE_PROVIDERS.carto_dark.options),
    'OpenTopoMap (Kontur)': L.tileLayer(TILE_PROVIDERS.opentopo.url, TILE_PROVIDERS.opentopo.options)
  }

  const initialKey = selectedTileProvider.value || 'osm'
  const initialLayer = getLayerByKey(initialKey)

  leafletMap = L.map(mapContainerRef.value, {
    center: [currentSearchPoint.value.lat, currentSearchPoint.value.lng],
    zoom: 14,
    zoomControl: true,
    layers: [initialLayer]
  })

  currentTileLayer = initialLayer

  // Add Leaflet native Layer Control on top-right
  leafletLayersControl = L.control.layers(baseLayersMap, null, {
    position: 'topright',
    collapsed: true
  }).addTo(leafletMap)

  // Listen to layer changes made via the Leaflet native control
  leafletMap.on('baselayerchange', (e) => {
    const key = findKeyByLayerName(e.name)
    if (key && selectedTileProvider.value !== key) {
      selectedTileProvider.value = key
    }
  })

  leadMarkersGroup = L.layerGroup().addTo(leafletMap)

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

const getLayerByKey = (key) => {
  switch (key) {
    case 'esri_sat': return baseLayersMap['Satelit / Foto Udara']
    case 'esri_streets': return baseLayersMap['Esri Jalanan']
    case 'esri_topo': return baseLayersMap['Topografi (Esri)']
    case 'carto_light': return baseLayersMap['Minimalis Terang']
    case 'carto_dark': return baseLayersMap['Mode Gelap']
    case 'opentopo': return baseLayersMap['OpenTopoMap (Kontur)']
    case 'osm':
    default: return baseLayersMap['OpenStreetMap (Standar)']
  }
}

const findKeyByLayerName = (name) => {
  if (!name) return 'osm'
  if (name.includes('Satelit')) return 'esri_sat'
  if (name.includes('Esri Jalanan')) return 'esri_streets'
  if (name.includes('Topografi')) return 'esri_topo'
  if (name.includes('Minimalis Terang')) return 'carto_light'
  if (name.includes('Mode Gelap')) return 'carto_dark'
  if (name.includes('OpenTopoMap')) return 'opentopo'
  if (name.includes('OpenStreetMap')) return 'osm'
  return 'osm'
}

const changeTileLayer = () => {
  if (!leafletMap) return
  const newLayer = getLayerByKey(selectedTileProvider.value)
  if (newLayer && newLayer !== currentTileLayer) {
    if (currentTileLayer) {
      leafletMap.removeLayer(currentTileLayer)
    }
    leafletMap.addLayer(newLayer)
    currentTileLayer = newLayer
  }
}

const renderCenterAndRadius = () => {
  if (!leafletMap) return
  if (radiusCircleLayer) leafletMap.removeLayer(radiusCircleLayer)
  if (centerMarkerLayer) leafletMap.removeLayer(centerMarkerLayer)

  const { lat, lng, name } = currentSearchPoint.value
  const radiusMeters = searchRadius.value * 1000

  // Radius perimeter circle
  radiusCircleLayer = L.circle([lat, lng], {
    radius: radiusMeters,
    color: '#2C3E50',
    weight: 1.5,
    dashArray: '5, 5',
    fillColor: '#34495E',
    fillOpacity: 0.08
  }).addTo(leafletMap)

  // Check if center is user's real location
  const isRealUser = !!userLocationCoords.value &&
    Math.abs(lat - userLocationCoords.value.lat) < 0.0002 &&
    Math.abs(lng - userLocationCoords.value.lng) < 0.0002

  const centerIconHtml = isRealUser ? `
    <div class="map-pin-user-location" title="Posisi Anda Saat Ini">
      <div class="user-pulse"></div>
      <div class="user-dot"></div>
    </div>
  ` : `
    <div class="map-pin-center" title="Pusat Pencarian">
      <div class="pin-dot"></div>
    </div>
  `

  const centerIcon = L.divIcon({
    html: centerIconHtml,
    className: 'leaflet-clean-pin',
    iconSize: isRealUser ? [26, 26] : [24, 24],
    iconAnchor: isRealUser ? [13, 13] : [12, 12]
  })

  centerMarkerLayer = L.marker([lat, lng], { icon: centerIcon })
    .bindPopup(`
      <div style="font-size: 12px; line-height: 1.4;">
        <strong>${isRealUser ? '📍 Posisi Anda Saat Ini:' : 'Pusat Pencarian:'}</strong><br/>${name}<br/>
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
    const pinHtml = `
      <div class="map-lead-marker ${isSelected ? 'is-active' : ''}">
        <span>${idx + 1}</span>
      </div>
    `
    const leadIcon = L.divIcon({
      html: pinHtml,
      className: 'leaflet-clean-pin',
      iconSize: [28, 34],
      iconAnchor: [14, 34],
      popupAnchor: [0, -32]
    })

    const marker = L.marker([lead.lat, lead.lng], { icon: leadIcon })

    const popupHtml = `
      <div class="map-popup">
        <span class="popup-cat">${lead.category}</span>
        <h4 class="popup-title">${lead.name}</h4>
        <p class="popup-addr">${lead.address}</p>
        <div class="popup-meta">
          <span>★ ${lead.rating}</span>
          <span>•</span>
          <span>${lead.distanceText}</span>
        </div>
        <a href="https://wa.me/${lead.phoneRaw}" target="_blank" class="popup-wa-btn">
          Chat WhatsApp
        </a>
      </div>
    `
    marker.bindPopup(popupHtml)
    marker.on('click', () => {
      selectedLead.value = lead
    })

    leadMarkersGroup.addLayer(marker)
  })
}

const onRadiusChange = () => {
  if (radiusCircleLayer) {
    radiusCircleLayer.setRadius(searchRadius.value * 1000)
  }
}

const recenterMap = () => {
  if (!leafletMap) return
  if (radiusCircleLayer) {
    leafletMap.fitBounds(radiusCircleLayer.getBounds(), { padding: [25, 25] })
  } else {
    leafletMap.setView([currentSearchPoint.value.lat, currentSearchPoint.value.lng], 14)
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

// Dynamic Mock Fallback for custom queries
const generateRealisticMock = (keyword, location, customLat = null, customLng = null) => {
  let baseLat = customLat !== null ? customLat : -6.4255
  let baseLng = customLng !== null ? customLng : 106.8150
  let cleanLoc = location

  if (customLat === null || customLng === null) {
    const str = (keyword + location).toLowerCase()
    if (str.includes('tebet') || str.includes('jakarta')) {
      baseLat = -6.2372; baseLng = 106.8528
      cleanLoc = 'Tebet, Jakarta Selatan'
    } else if (str.includes('margonda')) {
      baseLat = -6.3725; baseLng = 106.8320
      cleanLoc = 'Margonda, Depok'
    } else if (str.includes('sawangan')) {
      baseLat = -6.4020; baseLng = 106.7780
      cleanLoc = 'Sawangan, Depok'
    } else if (str.includes('bandung')) {
      baseLat = -6.9175; baseLng = 107.6191
      cleanLoc = 'Bandung'
    }
  }

  currentSearchPoint.value = {
    name: cleanLoc,
    lat: baseLat,
    lng: baseLng
  }

  const locFirstWord = cleanLoc.split(/[, ]+/)[0] || 'Sekitar'
  const names = [
    `${keyword} Barokah ${locFirstWord}`,
    `${keyword} Sumber Rezeki`,
    `${keyword} Mandiri Jaya`,
    `${keyword} Sahabat ${locFirstWord}`,
    `${keyword} Prima Utama`,
    `${keyword} Berkah Bersama`
  ]

  return names.map((name, i) => {
    const distRatio = 0.25 + (i * 0.12)
    const distKm = parseFloat((distRatio * searchRadius.value).toFixed(2))
    const angle = i * 1.05
    const latOffset = (distKm / 111) * Math.cos(angle)
    const lngOffset = (distKm / (111 * Math.cos(baseLat * Math.PI / 180))) * Math.sin(angle)
    const rating = (4.6 + (i % 4) * 0.1).toFixed(1)
    const reviews = 50 + (i * 28)
    const phone = `0812${String(34567890 + i * 123456).slice(0, 8)}`

    return {
      id: `gen-${i}`,
      name,
      category: `Usaha ${keyword}`,
      rating: parseFloat(rating),
      reviews,
      address: `Jl. Raya ${cleanLoc} No. ${10 + i * 14}, ${cleanLoc}`,
      distanceKm: distKm,
      distanceText: distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm} km`,
      lat: baseLat + latOffset,
      lng: baseLng + lngOffset,
      phoneRaw: '62' + phone.substring(1),
      phoneFormatted: `+62 ${phone.substring(1, 4)}-${phone.substring(4, 8)}-${phone.substring(8)}`,
      isOpen: i !== 4,
      hours: '08.30 - 21.00 WIB',
      priceRange: 'Tarif Terjangkau',
      features: 'Pelayanan ramah, lokasi strategis'
    }
  })
}

const handleSearch = async () => {
  isSearching.value = true
  selectedLead.value = null

  const locQuery = searchLocation.value.trim()
  const key = `${searchKeyword.value.toLowerCase().trim()}_${locQuery.toLowerCase()}`

  if (MOCK_DATASETS[key]) {
    const data = MOCK_DATASETS[key]
    currentSearchPoint.value = { ...data.center }
    leads.value = [...data.items]
  } else {
    let geoLat = null
    let geoLng = null

    if (userLocationCoords.value && (locQuery.toLowerCase().includes('saya') || locQuery.toLowerCase().includes('riil'))) {
      geoLat = userLocationCoords.value.lat
      geoLng = userLocationCoords.value.lng
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
          }
        }
      } catch (e) {
        // fallback
      }
    }

    leads.value = generateRealisticMock(searchKeyword.value, locQuery, geoLat, geoLng)
  }

  if (leafletMap) {
    leafletMap.setView([currentSearchPoint.value.lat, currentSearchPoint.value.lng], 14)
    renderCenterAndRadius()
    renderLeadMarkers()
    recenterMap()
  }

  isSearching.value = false
  showToast(`Ditemukan ${leads.value.length} tempat di ${searchLocation.value}`)
}

const applyExample = (item) => {
  searchKeyword.value = item.keyword
  searchLocation.value = item.location
  searchRadius.value = item.radius
  handleSearch()
}

const exportToCsv = () => {
  if (leads.value.length === 0) return

  const headers = ['No', 'Nama Tempat', 'Kategori', 'Rating', 'Ulasan', 'Alamat', 'Jarak', 'WhatsApp', 'Status Buka', 'Jam Operasional', 'Tarif & Layanan']
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
    `"${l.priceRange} - ${l.features.replace(/"/g, '""')}"`
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const link = document.createElement('a')
  link.setAttribute('href', encodeURI(csvContent))
  link.setAttribute('download', `leads_${searchKeyword.value}_${searchLocation.value}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  showToast('File CSV berhasil diunduh.')
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
    content: `Alamat: ${lead.address}\nWhatsApp: ${lead.phoneFormatted}\nRating: ★ ${lead.rating} (${lead.reviews} ulasan)\nJarak: ${lead.distanceText}\nLayanan: ${lead.features}\nTarif: ${lead.priceRange}\nCatatan: ${lead.customNote || '-'}`,
    tags: ['Lead', searchKeyword.value]
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

      searchLocation.value = resolvedAddress
      currentSearchPoint.value = {
        name: resolvedAddress,
        lat,
        lng
      }

      // Generate leads around real user coordinates
      leads.value = generateRealisticMock(searchKeyword.value, resolvedAddress, lat, lng)

      if (leafletMap) {
        leafletMap.setView([lat, lng], 14, { animate: true })
        renderCenterAndRadius()
        renderLeadMarkers()
      }

      isLocating.value = false
      showToast(isUserTriggered ? `Lokasi diperbarui ke: ${resolvedAddress}` : `Lokasi riil Anda terdeteksi: ${resolvedAddress}`)
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
  const defaultKey = 'tukang cukur_cipayung depok'
  const defaultData = MOCK_DATASETS[defaultKey]
  currentSearchPoint.value = { ...defaultData.center }
  leads.value = [...defaultData.items]

  nextTick(() => {
    initMap()
    // Otomatis pakai posisi real saya sebagai default location
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

.layer-control {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-muted);
}

.layer-icon {
  color: var(--color-muted);
  flex-shrink: 0;
}

.layer-control select {
  font-size: 11px;
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-paper);
  color: var(--color-ink);
  cursor: pointer;
  outline: none;
}

.layer-control select:focus {
  border-color: var(--color-brand);
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

/* Active Place Drawer on Map */
.active-place-card {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 320px;
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  z-index: 1000;
}

.place-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.place-category {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-brand);
}

.place-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-ink);
  margin-top: 2px;
}

.btn-close-card {
  background: none;
  border: none;
  font-size: 13px;
  color: var(--color-muted);
  cursor: pointer;
}

.place-address {
  font-size: 11px;
  color: var(--color-muted);
  line-height: 1.4;
  margin-bottom: 8px;
}

.place-details {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-ink);
  margin-bottom: 12px;
}

.status-open { color: #27ae60; font-weight: 600; }
.status-closed { color: #e74c3c; font-weight: 600; }

.place-actions {
  display: flex;
  gap: 8px;
}

.btn-whatsapp {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #27ae60;
  color: #FFFFFF;
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
}

.btn-subtle-sm {
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  color: var(--color-ink);
  font-size: 11px;
  font-weight: 500;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
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
  background: rgba(33, 150, 243, 0.45);
  animation: user-gps-pulse 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

:deep(.map-pin-user-location .user-dot) {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 14px;
  height: 14px;
  background: #1976D2;
  border: 2.5px solid #FFFFFF;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  z-index: 2;
}

@keyframes user-gps-pulse {
  0% {
    transform: scale(0.6);
    opacity: 0.9;
  }
  70% {
    transform: scale(2.6);
    opacity: 0;
  }
  100% {
    transform: scale(2.6);
    opacity: 0;
  }
}

:deep(.map-lead-marker) {
  width: 26px;
  height: 32px;
  background: #34495E;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  transition: transform 0.15s ease;
}

:deep(.map-lead-marker.is-active) {
  background: #27ae60;
  transform: rotate(-45deg) scale(1.15);
  box-shadow: 0 3px 8px rgba(39, 174, 96, 0.4);
}

:deep(.map-lead-marker span) {
  transform: rotate(45deg);
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 700;
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
  display: block;
  text-align: center;
  background: #27ae60;
  color: #FFFFFF !important;
  text-decoration: none;
  padding: 5px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
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
