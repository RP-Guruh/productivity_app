# Google Maps Business Leads Scraper

Scraper otomatis untuk mengambil data tempat usaha dari Google Maps Search menggunakan **Playwright** dan **Node.js**. Dirancang khusus untuk mengatasi mekanisme *lazy-loading* / *infinite scrolling* Google Maps secara stabil dan andal.

---

## 📁 Struktur Project

```
google-maps-scraper/
├── scraper.js        # Script utama scraper (modular & CLI)
├── package.json      # Dependency & npm scripts
├── results.json      # Output hasil scraping format JSON
├── results.csv       # Output hasil scraping format CSV
└── README.md         # Dokumentasi & panduan penggunaan
```

---

## 🚀 Prasyarat & Instalasi di Ubuntu / Linux

Pastikan Node.js (v18+) dan npm telah terinstal di sistem Anda:

```bash
# 1. Masuk ke direktori scraper
cd google-maps-scraper

# 2. Install dependencies (Playwright)
npm install

# 3. Download browser binary Chromium untuk Playwright (Ubuntu)
npx playwright install chromium

# (Opsional jika di server Ubuntu polos tanpa GUI libraries)
npx playwright install-deps chromium
```

---

## 💻 Cara Menjalankan Scraper

### 1. Menjalankan URL Default
Scraper akan otomatis mencari *"tukang cukur di cipayung"*:

```bash
npm run scrape
```

### 2. Menjalankan dengan URL Kustom (Configurable Tanpa Ubah Source Code)
Cukup teruskan URL Google Maps Search apa pun sebagai argumen:

```bash
# Contoh 1: Cari barbershop di Depok
npm run scrape -- "https://www.google.com/maps/search/barbershop+di+depok"

# Contoh 2: Cari restoran di Jakarta
npm run scrape -- "https://www.google.com/maps/search/restoran+di+jakarta"

# Contoh 3: Cari kafe di Tebet
npm run scrape -- "https://www.google.com/maps/search/coffee+shop+di+tebet"
```

Atau menggunakan perintah `node` langsung:
```bash
node scraper.js "https://www.google.com/maps/search/klinik+gigi+di+bandung"
```

---

## 📊 Format Output

Setiap kali dijalankan, scraper akan memperbarui dua file:

### 1. `results.json`
```json
{
  "source_url": "https://www.google.com/maps/search/tukang+cukur+di+cipayung",
  "total_results": 47,
  "scraped_at": "2026-09-27T14:15:00.000Z",
  "results": [
    {
      "name": "Captain Barbershop Cipayung",
      "rating": "4.9",
      "reviews": "248",
      "address": "Jl. Raya Cipayung No. 28, RT 02/RW 04, Cipayung, Depok",
      "category": "Barbershop",
      "phone": "+62 812-8899-7711",
      "website": "https://captainbarbershop.co.id",
      "maps_url": "https://www.google.com/maps/place/Captain+Barbershop+Cipayung"
    }
  ]
}
```

### 2. `results.csv`
File spreadsheet dengan format RFC 4180 siap impor ke Excel atau Google Sheets:
```csv
name,rating,reviews,address,category,phone,website,maps_url
"Captain Barbershop Cipayung","4.9","248","Jl. Raya Cipayung No. 28, RT 02/RW 04, Cipayung, Depok","Barbershop","+62 812-8899-7711","https://captainbarbershop.co.id","https://www.google.com/maps/place/..."
```

---

## 🔍 Penjelasan Singkat: Cara Kerja Infinite Scrolling Google Maps

Google Maps menerapkan arsitektur *Single Page Application (SPA)* dengan *virtualized scrolling*:

1. **Bukan Scroll Window**:
   Daftar tempat pada Google Maps berada di dalam container khusus dengan atribut `[role="feed"]`. Scrolling pada objek `window` atau `body` **tidak akan memicu pemuatan data**. Script ini menargetkan container tersebut langsung:
   ```javascript
   await feed.evaluate((el) => {
     el.scrollTop += 1200;
   });
   ```

2. **Trigger Lazy-Loading Asinkron**:
   Ketika scroll menyentuh batas bawah feed, Google Maps mengirimkan *background network request* untuk meminta kelompok data berikutnya. Script menggabungkan `scrollTop` dengan `lastArticle.scrollIntoViewIfNeeded()` untuk memastikan event trigger aktif.

3. **Mekanisme Akumulasi & Retry Stabil (`noChangeCount`)**:
   Karena jaringan atau proses render Maps dapat membutuhkan waktu 1–2 detik, scraper **tidak langsung berhenti** saat satu kali scroll belum menghasilkan item baru. Digunakan pelacak:
   - `previousCount`: jumlah item sebelumnya.
   - `currentCount`: jumlah item saat ini.
   - `noChangeCount`: bertambah jika jumlah tidak berubah, dan hanya berhenti jika tidak ada penambahan hasil selama 5 kali scroll berturut-turut (`noChangeCount >= 5`) atau jika teks penanda akhir hasil terdeteksi (`.HlvSq`).

4. **Deduplikasi**:
   Google Maps terkadang memuat ulang beberapa elemen di viewport saat DOM recycling terjadi. Scraper melakukan deduplikasi otomatis menggunakan URL unik tempat (`maps_url` / `name + address`) sehingga data di `results.json` dan `results.csv` dijamin bersih dan tanpa duplikat.

---

## 🧩 Penggunaan Sebagai Modul (Node.js)

Fungsi `scrapeGoogleMaps` juga dapat diimpor ke aplikasi lain:

```javascript
const { scrapeGoogleMaps, saveOutputs } = require('./scraper');

async function main() {
  const data = await scrapeGoogleMaps('https://www.google.com/maps/search/kafe+di+surabaya', {
    headless: true,
    maxRetries: 5
  });

  console.log(`Ditemukan ${data.total_results} data.`);
  saveOutputs(data);
}

main();
```
