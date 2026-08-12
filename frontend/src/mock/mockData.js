export const mockBoards = [
  { id: 1, name: "Peluncuran Website Toko", taskCount: 12, doneCount: 9 },
  { id: 2, name: "Persiapan Wawancara Kerja", taskCount: 5, doneCount: 1 },
];

export const mockColumns = [
  {
    id: 1, name: "Backlog", accent: null,
    tasks: [
      { id: 1, title: "Riset kompetitor toko online", description: "Cari tahu minimal 3 kompetitor utama dan buat daftar kelebihan/kekurangannya.", priority: "sedang", dueDate: "2026-08-14" },
      { id: 2, title: "Kumpulkan referensi desain", description: "Cari referensi tata letak e-commerce modern di Dribbble atau Behance.", priority: "rendah", dueDate: null },
    ],
  },
  {
    id: 2, name: "Sedang Dikerjakan", accent: null,
    tasks: [
      { id: 3, title: "Desain halaman checkout", description: "Buat wireframe dan layout visual untuk proses checkout 3-langkah.", priority: "tinggi", dueDate: "2026-08-11" },
    ],
  },
  {
    id: 3, name: "Selesai", accent: "success",
    tasks: [
      { id: 4, title: "Setup domain & hosting", description: "Beli domain toko dan konfigurasi hosting VPS.", priority: "rendah", dueDate: null },
    ],
  },
];

export const mockAiSuggestions = [
  "Buat wireframe alur checkout",
  "Riset 3 kompetitor toko online sejenis",
  "Tulis draft kebijakan pengembalian barang",
  "Siapkan daftar produk awal (min. 10 item)",
];
