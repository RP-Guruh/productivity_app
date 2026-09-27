Buatkan fitur Google Maps Scraper menggunakan Playwright + JavaScript.

TUJUAN
Saya ingin scraper yang dapat menerima URL Google Maps Search seperti:

https://www.google.com/maps/search/tukang+cukur+di+cipayung

Scraper harus membuka URL tersebut, melakukan scrolling pada daftar hasil Google Maps secara otomatis sampai seluruh hasil yang tersedia berhasil dimuat, kemudian mengambil seluruh data bisnis yang ditemukan.

PENTING:
Google Maps menggunakan lazy loading / infinite scrolling. Data bisnis tidak semuanya tersedia pada DOM saat halaman pertama kali dibuka. Hasil baru akan muncul ketika container daftar hasil di-scroll.

JANGAN hanya melakukan:
page.goto()
lalu langsung query selector.

HARUS melakukan scrolling pada container hasil Google Maps.

STRUKTUR DOM YANG PERLU DIJADIKAN REFERENSI

Container hasil:
[role="feed"]

Setiap item bisnis:
[role="article"]

Nama:
a.hfpxzc
atau
.qBF1Pd

Rating:
.MW4etd

Jumlah review:
.UY7F9

Link Google Maps:
a.hfpxzc[href]

Gunakan selector tersebut sebagai baseline, tetapi buat scraper cukup robust terhadap perubahan kecil pada DOM Google Maps.

FLOW SCRAPER

1. Terima URL Google Maps sebagai variable:

const targetUrl = "https://www.google.com/maps/search/tukang+cukur+di+cipayung";

2. Launch Chromium menggunakan Playwright.

3. Buka targetUrl.

4. Tunggu Google Maps selesai melakukan initial rendering.

5. Cari container:

[role="feed"]

6. Pastikan scrolling dilakukan pada container tersebut, BUKAN pada window/body.

Contoh pendekatan:

const feed = page.locator('[role="feed"]');

await feed.evaluate((el) => {
    el.scrollTop += 1000;
});

7. Setelah scrolling, tunggu Google Maps melakukan lazy loading.

8. Hitung jumlah:

[role="article"]

9. Bandingkan jumlah hasil sebelum dan sesudah scrolling.

10. Teruskan scrolling selama masih ada hasil baru.

11. Jangan hanya menggunakan fixed jumlah scroll.

Gunakan mekanisme seperti:

- previousCount
- currentCount
- noChangeCount

Contoh log:

Found: 20
Found: 30
Found: 40
Found: 50

Jika jumlah hasil tidak bertambah selama beberapa kali scroll berturut-turut, anggap sudah mencapai akhir.

Contoh:

noChangeCount >= 5

Tetapi jangan langsung berhenti hanya karena satu kali scroll tidak mendapatkan hasil baru. Google Maps membutuhkan waktu untuk lazy loading.

12. Gunakan kombinasi:

- scroll
- wait
- check result count
- retry

agar scraper lebih stabil.

13. Jika memungkinkan, deteksi indikator bahwa sudah mencapai akhir daftar Google Maps.

Namun JANGAN hanya bergantung pada text tertentu karena bahasa/interface Google Maps dapat berubah.

14. Setiap hasil harus dideduplikasi.

Gunakan URL Google Maps sebagai unique key.

Jika URL tidak tersedia, gunakan kombinasi nama + alamat sebagai fallback.

DATA YANG DIAMBIL

Untuk setiap [role="article"], ambil minimal:

{
    name: "",
    rating: "",
    reviews: "",
    address: "",
    category: "",
    phone: "",
    website: "",
    maps_url: ""
}

Jangan menganggap semua field selalu tersedia.

Jika field tidak ditemukan:

return ""

Jangan menyebabkan scraper error hanya karena satu bisnis tidak memiliki website, phone, rating, atau field lainnya.

Buat helper function seperti:

safeText()
safeAttr()

agar selector tidak ditemukan tidak menyebabkan exception.

HASIL SCRAPING

Setelah proses scrolling selesai:

1. Ambil seluruh [role="article"] yang sudah tersedia.
2. Extract data.
3. Deduplicate.
4. Return array JSON.

Contoh:

[
    {
        "name": "Barbersmart Cipayung Depok",
        "rating": "4.8",
        "reviews": "123",
        "address": "...",
        "category": "Barbershop",
        "phone": "...",
        "website": "...",
        "maps_url": "https://www.google.com/maps/..."
    },
    {
        "name": "RUANG CUKUR TASIK",
        "rating": "4.7",
        "reviews": "98",
        "address": "...",
        "category": "Barbershop",
        "phone": "...",
        "website": "",
        "maps_url": "https://www.google.com/maps/..."
    }
]

OUTPUT FILE

Simpan hasil ke:

results.json

Format:

{
    "source_url": "https://www.google.com/maps/search/tukang+cukur+di+cipayung",
    "total_results": 0,
    "scraped_at": "",
    "results": []
}

Tambahkan juga:

results.csv

dengan kolom:

name
rating
reviews
address
category
phone
website
maps_url

LOGGING

Tampilkan progress scraper secara realtime:

[INFO] Opening Google Maps...
[INFO] Waiting for results...
[INFO] Results loaded: 20
[INFO] Scrolling...
[INFO] Results loaded: 30
[INFO] Scrolling...
[INFO] Results loaded: 40
[INFO] Scrolling...
[INFO] No new results detected (1/5)
[INFO] No new results detected (2/5)
[INFO] No new results detected (3/5)
[INFO] No new results detected (4/5)
[INFO] No new results detected (5/5)
[INFO] End of results detected.
[INFO] Extracting data...
[INFO] Total unique results: 47
[INFO] Saved results.json
[INFO] Saved results.csv

ROBUSTNESS

Buat scraper agar tidak mudah gagal karena:

- Google Maps lambat
- lazy loading lambat
- DOM berubah
- beberapa field tidak tersedia
- hasil duplikat
- scroll tidak langsung memicu loading
- network lambat

Gunakan timeout yang reasonable.

Jangan menggunakan:

page.mouse.wheel()

sebagai mekanisme utama scrolling.

Prioritaskan:

feed.evaluate(el => {
    el.scrollTop += ...
})

atau metode yang benar-benar melakukan scroll pada element [role="feed"].

Jika diperlukan, gunakan:

lastArticle.scrollIntoViewIfNeeded()

untuk membantu trigger lazy loading.

IMPORTANT

Jangan membuat scraper berdasarkan posisi CSS yang terlalu spesifik seperti:

div:nth-child(...)
div > div > div:nth-child(...)

Gunakan semantic selector:

[role="feed"]
[role="article"]
a.hfpxzc
.qBF1Pd
.MW4etd
.UY7F9

dan selector fallback jika diperlukan.

Buat kode modular.

Struktur project yang diinginkan:

google-maps-scraper/
├── scraper.js
├── package.json
├── results.json
├── results.csv
└── README.md

Tambahkan command:

npm install
npm run scrape

Dan jika memungkinkan URL dibuat configurable:

npm run scrape -- "https://www.google.com/maps/search/tukang+cukur+di+cipayung"

Sehingga saya bisa mengganti URL menjadi:

https://www.google.com/maps/search/barbershop+di+depok

atau:

https://www.google.com/maps/search/restoran+di+jakarta

tanpa mengubah source code.

TAMBAHAN

Buat fungsi:

scrapeGoogleMaps(url)

yang mengembalikan:

{
    source_url,
    total_results,
    scraped_at,
    results
}

Jangan menggunakan Vue untuk proses scraping.

Gunakan:
Playwright + Node.js

Vue hanya boleh digunakan jika nanti saya ingin membuat dashboard untuk menampilkan hasil scraping.

Berikan implementasi FULL dan siap dijalankan, termasuk:

1. package.json
2. scraper.js
3. results.json example
4. results.csv generation
5. README.md
6. command untuk menjalankan scraper
7. penjelasan singkat cara kerja infinite scrolling Google Maps

Pastikan kode bisa langsung saya copy-paste dan jalankan di Ubuntu.