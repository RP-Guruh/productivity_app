# TaskFlow — Design & Frontend Brief (Vue.js)

> **Dokumen ini untuk:** AI coding agent yang akan membangun tampilan (UI) dan struktur komponen Vue.js untuk aplikasi TaskFlow.
>
> **Scope dokumen ini:** HANYA desain, layout, komponen, dan interaksi visual di sisi frontend.
> **DI LUAR scope:** integrasi REST API, autentikasi, pemanggilan AI sungguhan, state management yang terhubung ke backend. Semua data di tahap ini adalah **data dummy/mock** yang disimpan secara lokal di Vue (bukan dari server).
>
> Backend Spring Boot dikerjakan terpisah oleh developer (bukan tugas agent). Agent hanya perlu menyiapkan struktur frontend yang **rapi dan mudah disambungkan ke API nanti**, tanpa benar-benar menyambungkannya sekarang.

---

## 1. Konteks Produk

TaskFlow adalah aplikasi manajemen task berbasis board, mirip Trello: pengguna membuat **board**, di dalam board ada beberapa **kolom/status** (List), dan di setiap kolom ada **task/card** yang bisa dipindah-pindah.

Fitur pembeda (untuk versi mendatang, belum dibangun sekarang): asisten AI yang membantu pengguna menyusun daftar task ketika mereka bingung harus mulai dari mana. Untuk sekarang, **cukup desain tempat/UI untuk fitur ini** (misalnya tombol dan modal), tanpa logika AI sungguhan di baliknya.

**Target pengguna:** individu atau tim kecil yang ingin mengatur pekerjaan pribadi/proyek kecil, sering merasa kewalahan menyusun task, dan menghargai tampilan yang tenang, jelas, dan tidak membuat stres.

**Prinsip pengalaman:** *clarity over clutter*. Pengguna harus langsung paham status pekerjaannya sekilas pandang. Hindari elemen dekoratif yang tidak membantu pemahaman.

---

## 2. Arah Desain (Design Direction)

Jangan gunakan tema default yang sering muncul di desain buatan AI (krem + serif kontras + aksen terracotta; dark mode serba hitam + satu aksen neon; gaya koran dengan garis tipis dan kolom padat). TaskFlow punya identitas sendiri berikut ini — ikuti dengan konsisten di semua komponen.

### 2.1 Konsep

**"Jalur Kerja" (Workflow as a path).** Sebuah task berjalan melalui tahapan seperti melewati pos-pos di sebuah rute — dari Backlog, dikerjakan, sampai selesai. Ini tercermin di elemen signature: **setiap task card punya "sudut terlipat" (dog-ear corner)** di kanan atas seperti slip kertas/index card fisik, diwarnai sesuai prioritas task. Detail kecil ini adalah elemen yang paling diingat dari desain TaskFlow — jangan dihapus atau diganti dengan drop-shadow generik.

### 2.2 Palet Warna

Gunakan sebagai CSS custom properties (design tokens), jangan hardcode hex di banyak tempat.

| Token | Hex | Penggunaan |
|---|---|---|
| `--color-ink` | `#1B1F3B` | Teks utama, judul |
| `--color-paper` | `#F7F6F3` | Background halaman (putih hangat keabu-abuan, BUKAN krem) |
| `--color-panel` | `#FFFFFF` | Background card, kolom, modal |
| `--color-brand` | `#3E4C8A` | Warna utama (tombol primer, link aktif, ikon aktif) |
| `--color-brand-dark` | `#2C3868` | Hover/active state dari brand |
| `--color-signal` | `#E8562F` | Aksen tegas: prioritas tinggi, badge AI, elemen yang butuh perhatian — pakai HEMAT |
| `--color-success` | `#2F7A5D` | Status selesai/Done, konfirmasi positif |
| `--color-warning` | `#B8860B` | Deadline dekat/prioritas menengah |
| `--color-border` | `#DEDAD1` | Garis pembatas, outline input |
| `--color-muted` | `#767B94` | Teks sekunder, placeholder, metadata |

Aturan pemakaian: `--color-signal` (oranye-merah) dipakai maksimal untuk 1-2 elemen per layar (misalnya badge prioritas "Tinggi" atau tombol AI Assistant) — jangan sampai dominan, karena fungsinya sebagai penanda perhatian, bukan warna dekorasi.

### 2.3 Tipografi

| Peran | Font | Fallback | Catatan |
|---|---|---|---|
| Display (judul besar, nama board) | `Space Grotesk` | sans-serif | Geometris, sedikit teknis, dipakai di font-weight 600–700 |
| Body (teks umum, deskripsi task) | `Inter` | sans-serif | Weight 400 untuk body, 500 untuk label |
| Mono (tanggal, ID task, counter) | `IBM Plex Mono` | monospace | Dipakai kecil (12-13px) untuk metadata, memberi kesan "sistem yang rapi" |

Import via Google Fonts di `index.html` atau `@font-face` lokal. Skala tipografi disarankan:

```
--text-xs:   12px / line-height 16px   (metadata, timestamp)
--text-sm:   13px / line-height 18px   (label, badge)
--text-base: 15px / line-height 22px   (body text, deskripsi task)
--text-md:   17px / line-height 24px   (judul card/task)
--text-lg:   22px / line-height 28px   (judul kolom)
--text-xl:   28px / line-height 34px   (judul board)
--text-2xl:  36px / line-height 42px   (judul halaman utama)
```

### 2.4 Spacing & Radius

Gunakan skala 4px sebagai basis: `4, 8, 12, 16, 24, 32, 48, 64`.

Radius sudut: `--radius-sm: 6px` (badge, input), `--radius-md: 10px` (card, tombol), `--radius-lg: 16px` (modal, panel besar). Hindari radius 0 (kesan koran/tabel) dan radius penuh berlebihan (kesan bubbly/childish) di elemen besar.

### 2.5 Bayangan (Shadow)

Gunakan shadow tipis dan lembut, bukan shadow tebal generik:

```css
--shadow-card: 0 1px 2px rgba(27, 31, 59, 0.06), 0 2px 8px rgba(27, 31, 59, 0.05);
--shadow-card-hover: 0 4px 12px rgba(27, 31, 59, 0.10), 0 2px 4px rgba(27, 31, 59, 0.06);
--shadow-modal: 0 12px 32px rgba(27, 31, 59, 0.18);
```

---

## 3. Elemen Signature: Task Card

Ini adalah elemen paling penting untuk didesain dengan baik karena muncul berkali-kali di seluruh aplikasi.

**Anatomi Task Card:**
- Latar belakang putih (`--color-panel`), radius `--radius-md`, shadow `--shadow-card`.
- **Sudut kanan-atas terlipat (dog-ear)**, dibuat dengan `clip-path` segitiga kecil (± 14x14px), diberi warna sesuai prioritas:
  - Tinggi → `--color-signal`
  - Sedang → `--color-warning`
  - Rendah → `--color-border` (netral, hampir tak terlihat — prioritas rendah tidak perlu menonjol)
- Judul task (`--text-md`, `--color-ink`, font-weight 500).
- Deskripsi singkat (opsional, 1-2 baris, `--text-sm`, `--color-muted`, terpotong dengan ellipsis).
- Baris metadata bawah (font mono, `--text-xs`): tanggal deadline + avatar kecil (opsional, bisa placeholder inisial).
- Hover: naik sedikit (`transform: translateY(-2px)`) + `--shadow-card-hover`, transisi 150ms ease-out.
- Saat sedang di-drag (state visual saja, tidak perlu logic asli): opacity 0.6 + sedikit rotasi (`rotate(2deg)`) agar terasa seperti kartu fisik terangkat.

Contoh (pseudo-HTML, sesuaikan ke Vue SFC):

```html
<div class="task-card task-card--priority-high">
  <div class="task-card__corner"></div>
  <h4 class="task-card__title">Desain wireframe halaman board</h4>
  <p class="task-card__desc">Buat wireframe kasar untuk tampilan kanban utama.</p>
  <div class="task-card__meta">
    <span class="task-card__date">12 AGU</span>
    <span class="task-card__avatar">RA</span>
  </div>
</div>
```

---

## 4. Struktur Halaman (Views)

### 4.1 Halaman "Daftar Board" (`BoardsOverview.vue`)

Wireframe kasar:

```
┌──────────────────────────────────────────────────────┐
│  [Logo TaskFlow]                     [+ Board Baru]   │
├──────────────────────────────────────────────────────┤
│  Board Saya                                            │
│                                                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│  │ Board A   │  │ Board B   │  │  + Buat    │          │
│  │ 12 task   │  │ 5 task    │  │   board    │          │
│  │ ●●●○ 75%  │  │ ●○○○ 20%  │  │   baru     │          │
│  └───────────┘  └───────────┘  └───────────┘          │
└──────────────────────────────────────────────────────┘
```

- Grid responsif (`grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))`).
- Setiap board card: nama board, jumlah task, progress bar sederhana (bukan chart rumit — cukup garis horizontal berwarna `--color-brand` menunjukkan % task Done).
- Kartu terakhir dalam grid berupa tombol "Buat board baru" dengan border dashed, bukan solid — bedakan visual dari board sungguhan.
- Empty state (belum ada board sama sekali): ilustrasi sederhana (boleh SVG minimal garis, bukan foto/ikon stok) + teks "Belum ada board. Buat board pertamamu untuk mulai mengatur task." + tombol CTA.

### 4.2 Halaman "Detail Board" (`BoardDetail.vue`) — Tampilan Kanban

Wireframe kasar:

```
┌──────────────────────────────────────────────────────────────┐
│ ← Board Saya   Nama Board [edit]         [✨ Bantu Susun Task]│
├──────────────────────────────────────────────────────────────┤
│  BACKLOG (4)     │  SEDANG DIKERJAKAN (2)  │  SELESAI (6)     │
│  ┌────────────┐  │  ┌────────────┐         │  ┌────────────┐  │
│  │ Task Card  │  │  │ Task Card  │         │  │ Task Card  │  │
│  └────────────┘  │  └────────────┘         │  └────────────┘  │
│  ┌────────────┐  │  ┌────────────┐         │  ┌────────────┐  │
│  │ Task Card  │  │  └────────────┘         │  └────────────┘  │
│  └────────────┘  │                          │  ...             │
│  + Tambah task   │  + Tambah task          │  + Tambah task   │
│                  │                          │                   │
│  + Tambah kolom  │                          │                   │
└──────────────────────────────────────────────────────────────┘
```

- Kolom disusun horizontal, scroll horizontal jika kolom banyak (`overflow-x: auto`), masing-masing kolom lebar tetap (± 300px), tidak melebar mengikuti isi.
- Header kolom: nama kolom (`--text-lg`, font Space Grotesk) + badge counter jumlah task (bulat kecil, background `--color-border`, teks mono).
- Kolom "Selesai/Done" mendapat aksen tipis warna `--color-success` di border-top kolom (4px) — supaya sekilas pandang terlihat mana kolom "selesai" tanpa perlu baca teks.
- Tombol "+ Tambah task" di bagian bawah tiap kolom: teks saja + ikon plus, warna `--color-muted`, berubah `--color-brand` saat hover — jangan gunakan tombol solid besar (terlalu berat secara visual karena akan sering muncul).
- Tombol "+ Tambah kolom" di ujung kanan area kolom, gaya dashed border, konsisten dengan pola "buat baru" di halaman overview.
- Tombol **"✨ Bantu Susun Task"** di pojok kanan atas: ini adalah pintu masuk ke fitur AI Assistant. Gunakan `--color-signal` sebagai background (satu-satunya tombol solid berwarna signal di seluruh board), agar terlihat sebagai fitur spesial/berbeda dari tombol lain.

### 4.3 Modal Detail/Edit Task (`TaskModal.vue`)

- Modal lebar sedang (± 560px), muncul di tengah dengan overlay gelap transparan (`rgba(27,31,59,0.4)`) di belakangnya.
- Field: Judul (input besar, borderless, terasa seperti judul dokumen), Deskripsi (textarea), Prioritas (pilihan chip: Rendah/Sedang/Tinggi dengan warna sesuai token di atas), Deadline (date picker sederhana), Label/tag (opsional).
- Tombol aksi di footer modal: "Simpan" (primer, `--color-brand`) dan "Hapus Task" (teks merah `--color-signal`, tanpa background — aksi destruktif tidak boleh terlihat sama beratnya dengan aksi simpan).

### 4.4 Modal AI Assistant (`AiAssistantModal.vue`) — Desain UI Saja

> Catatan: belum ada pemanggilan AI sungguhan. Buat tampilan lengkap dengan **data dummy hasil AI** (hardcode array of string) untuk mensimulasikan bagaimana hasilnya nanti akan terlihat.

Alur visual yang perlu didesain (state-state ini, tanpa logic backend):

1. **State awal** — input teks besar: "Ceritakan apa yang ingin kamu kerjakan..." + tombol "Susun Task untuk Saya".
2. **State loading** (simulasi, misal pakai `setTimeout` dummy) — skeleton loading dengan 3-4 baris placeholder berdenyut halus (pulse animation), disertai teks kecil "Menyusun task untuk kamu..." — hindari spinner generik, gunakan skeleton card yang bentuknya menyerupai task card asli agar transisinya halus.
3. **State hasil** — daftar saran task (checkbox list), setiap item punya checkbox + judul + tombol edit inline. Tombol "Tambahkan ke Board" di footer, disabled jika belum ada item yang dicentang.

Desain ini menandakan ke pengguna bahwa fitur AI adalah *pelengkap* yang menyenangkan, bukan blocking/wajib — bahasa dan nada tetap tenang, bukan "flashy".

---

## 5. Komponen Reusable yang Perlu Dibuat

Susun di `src/components/common/`:

| Komponen | Fungsi |
|---|---|
| `AppButton.vue` | Tombol dengan props `variant` (`primary` / `secondary` / `ghost` / `danger`) dan `size` (`sm` / `md`) |
| `AppInput.vue` | Input teks dengan label, dipakai konsisten di semua form |
| `AppModal.vue` | Wrapper modal generik (overlay, close on backdrop click, slot untuk konten) — dipakai oleh `TaskModal` dan `AiAssistantModal` |
| `AppBadge.vue` | Badge kecil untuk prioritas/status, props `color` |
| `AppAvatar.vue` | Lingkaran inisial (belum perlu avatar foto asli) |
| `EmptyState.vue` | Ilustrasi + teks + CTA, dipakai di board kosong dan kolom kosong |
| `SkeletonCard.vue` | Placeholder loading berbentuk task card, dipakai di AI Assistant modal |

Komponen spesifik fitur di `src/components/board/`:
- `BoardCard.vue` (kartu board di halaman overview)
- `BoardColumn.vue`
- `TaskCard.vue`
- `TaskModal.vue`
- `AiAssistantModal.vue`
- `AiSuggestionItem.vue`

---

## 6. Data Dummy (Mock Data)

Karena belum ada backend, buat file `src/mock/mockData.js` berisi data contoh yang realistis (bukan "Lorem ipsum" / "Task 1", "Task 2") supaya desain terasa hidup saat direview. Contoh isi minimal:

```js
export const mockBoards = [
  { id: 1, name: "Peluncuran Website Toko", taskCount: 12, doneCount: 9 },
  { id: 2, name: "Persiapan Wawancara Kerja", taskCount: 5, doneCount: 1 },
];

export const mockColumns = [
  {
    id: 1, name: "Backlog", accent: null,
    tasks: [
      { id: 1, title: "Riset kompetitor toko online", priority: "sedang", dueDate: "2026-08-14" },
      { id: 2, title: "Kumpulkan referensi desain", priority: "rendah", dueDate: null },
    ],
  },
  {
    id: 2, name: "Sedang Dikerjakan", accent: null,
    tasks: [
      { id: 3, title: "Desain halaman checkout", priority: "tinggi", dueDate: "2026-08-11" },
    ],
  },
  {
    id: 3, name: "Selesai", accent: "success",
    tasks: [
      { id: 4, title: "Setup domain & hosting", priority: "rendah", dueDate: null },
    ],
  },
];

export const mockAiSuggestions = [
  "Buat wireframe alur checkout",
  "Riset 3 kompetitor toko online sejenis",
  "Tulis draft kebijakan pengembalian barang",
  "Siapkan daftar produk awal (min. 10 item)",
];
```

Gunakan data ini di semua komponen untuk sementara, lewat `computed`/`ref` lokal — jangan bikin service/API call dulu. Cukup import langsung dari file mock ini.

---

## 7. Struktur Folder Proyek (Monolith dengan Spring Boot)

Vue di-build sebagai static assets yang disajikan oleh Spring Boot (bukan project terpisah/deploy terpisah). Struktur yang disarankan:

```
project-root/
├── src/
│   └── main/
│       ├── java/...                     (dikerjakan terpisah, bukan tugas agent)
│       └── resources/
│           └── static/                  ← HASIL BUILD Vue masuk ke sini (otomatis)
├── frontend/                            ← Project Vue ada di sini
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   │   ├── fonts/
│   │   │   └── styles/
│   │   │       ├── tokens.css           ← semua CSS variable dari bagian 2
│   │   │       └── base.css             ← reset + style global
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── board/
│   │   ├── views/
│   │   │   ├── BoardsOverview.vue
│   │   │   └── BoardDetail.vue
│   │   ├── mock/
│   │   │   └── mockData.js
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── pom.xml
```

**Konfigurasi penting di `frontend/vite.config.js`** — arahkan hasil build ke folder static Spring Boot:

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  build: {
    outDir: '../src/main/resources/static',
    emptyOutDir: true,
  },
})
```

Saat development, agent tetap jalankan `npm run dev` seperti biasa (server dev Vite terpisah di port sendiri, misal 5173) — hanya saat build production hasilnya masuk ke folder static Spring Boot. Routing SPA (`vue-router`) pakai mode `history` — konfigurasi fallback ke `index.html` di sisi Spring Boot akan diatur oleh developer, agent tidak perlu mengurus itu.

---

## 8. Kebutuhan Teknis Vue

- **Vue 3** dengan `<script setup>` (Composition API), bukan Options API.
- **Vue Router** untuk 2 halaman di atas (`/` → BoardsOverview, `/board/:id` → BoardDetail).
- **Pinia** boleh dipakai untuk state board/kolom/task secara lokal (diisi dari mock data saat app start), supaya nanti gampang tinggal ganti sumber datanya dari mock ke API call — tapi untuk sekarang isi store langsung dari `mockData.js`.
- Drag & drop antar kolom: gunakan library **`vuedraggable`** (v-next, untuk Vue 3) supaya kartu bisa dipindah antar kolom secara visual. Cukup update array lokal di Pinia store saat drop — tidak perlu simpan ke mana pun.
- Tidak perlu `axios`/`fetch` di tahap ini sama sekali.

---

## 9. Responsif & Aksesibilitas

- **Breakpoint:** mobile `< 640px`, tablet `640–1024px`, desktop `> 1024px`.
- Di mobile: halaman board overview jadi 1 kolom grid; halaman board detail tetap scroll horizontal per kolom (pola kanban board memang secara alami butuh scroll horizontal di mobile — jangan dipaksa jadi stack vertikal karena akan menghilangkan konteks "kolom status").
- Semua elemen interaktif (tombol, card, input) wajib punya **visible focus state** (outline 2px `--color-brand`, offset 2px) untuk navigasi keyboard.
- Hormati `prefers-reduced-motion`: matikan animasi hover/transisi transform jika user mengaktifkan setting ini di OS.
- Kontras teks vs background minimal rasio 4.5:1 — cek terutama `--color-muted` di atas `--color-paper`.

---

## 10. Yang TIDAK Perlu Dikerjakan di Tahap Ini

Agar scope tetap fokus desain, agent **tidak perlu**:
- Memanggil API/backend apa pun (semua data dari `mockData.js`).
- Membuat sistem login/autentikasi sungguhan (halaman login boleh dilewati dulu, mulai langsung dari `BoardsOverview`).
- Mengimplementasikan logic AI sungguhan (cukup simulasi state loading + hasil dummy seperti bagian 4.4).
- Menyimpan perubahan (drag/drop, edit task) secara permanen — cukup update state lokal di memori, hilang saat refresh, itu wajar untuk tahap ini.

---

## 11. Definisi Selesai (Definition of Done) untuk Tahap Desain Ini

- [ ] Semua token warna & tipografi di bagian 2 diterapkan sebagai CSS variables global, tidak ada hex hardcoded di komponen.
- [ ] Halaman `BoardsOverview` dan `BoardDetail` selesai, responsif dari mobile sampai desktop.
- [ ] Task card dengan sudut terlipat (dog-ear) sesuai prioritas berhasil dibuat dan konsisten dipakai di semua tempat task muncul.
- [ ] Drag & drop antar kolom berfungsi secara visual (state lokal saja).
- [ ] Modal Task dan Modal AI Assistant selesai dengan semua state (awal, loading dummy, hasil).
- [ ] Empty state untuk board kosong dan kolom kosong tersedia.
- [ ] Semua data yang tampil berasal dari `src/mock/mockData.js`, tidak ada pemanggilan network sama sekali.
- [ ] Build `npm run build` sukses menghasilkan output ke `src/main/resources/static/`.
