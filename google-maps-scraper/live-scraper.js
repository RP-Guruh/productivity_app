/**
 * Live Google Maps Scraper for On-Demand Search
 * Usage: node live-scraper.js "<keyword>" "<location>" [limit]
 */

const { chromium } = require('playwright');

async function safeText(locator) {
  try {
    const count = await locator.count();
    if (count === 0) return '';
    const text = await locator.first().innerText({ timeout: 800 });
    return text ? text.trim() : '';
  } catch (e) {
    return '';
  }
}

async function safeAttr(locator, attrName) {
  try {
    const count = await locator.count();
    if (count === 0) return '';
    const val = await locator.first().getAttribute(attrName, { timeout: 800 });
    return val ? val.trim() : '';
  } catch (e) {
    return '';
  }
}

function parseCoordinates(url) {
  if (!url) return { lat: null, lng: null };
  const match = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  }
  return { lat: null, lng: null };
}

function cleanPhone(raw) {
  if (!raw) return { phoneRaw: '', phoneFormatted: '' };
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '62' + digits.substring(1);
  }
  if (!digits.startsWith('62')) {
    digits = '62' + digits;
  }
  let formatted = '+' + digits.slice(0, 2) + ' ' + digits.slice(2, 5) + '-' + digits.slice(5, 9) + '-' + digits.slice(9);
  return { phoneRaw: digits, phoneFormatted: formatted };
}

async function scrapeLive(keyword, location, limit = 20) {
  const query = encodeURIComponent(`${keyword} di ${location}`);
  const targetUrl = `https://www.google.com/maps/search/${query}?hl=id`;

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1280,900'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    locale: 'id-ID'
  });

  const page = await context.newPage();

  try {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Handle cookie consent dialog if any
    try {
      const consentBtn = page.locator('button[aria-label*="Accept"], button[aria-label*="Setuju"], form[action*="consent"] button').first();
      if (await consentBtn.isVisible({ timeout: 1500 })) {
        await consentBtn.click();
      }
    } catch (e) {}

    const feed = page.locator('[role="feed"]');
    try {
      await feed.waitFor({ state: 'visible', timeout: 8000 });
    } catch (e) {
      // If feed not found, maybe single result or no results
    }

    // Scroll cepat untuk memuat item hingga batas limit yang diminta
    for (let s = 0; s < 5; s++) {
      const currentCount = await page.locator('[role="article"], .Nv2PK').count();
      if (currentCount >= limit) break;

      if (await feed.count() > 0) {
        await feed.evaluate(el => el.scrollBy(0, 1500));
        await page.waitForTimeout(900);
      }
    }

    const items = await page.locator('[role="article"], .Nv2PK').all();
    const results = [];
    const seen = new Set();

    for (let i = 0; i < items.length && results.length < limit; i++) {
      const item = items[i];

      const name = await safeText(item.locator('.qBF1Pd, .fontHeadlineSmall, [role="heading"]'));
      if (!name) continue;

      const linkLocator = item.locator('a[href*="/maps/place/"]').first();
      const mapsUrl = await safeAttr(linkLocator, 'href');

      const key = mapsUrl ? mapsUrl.split('?')[0] : name;
      if (seen.has(key)) continue;
      seen.add(key);

      // Rating
      let ratingStr = await safeText(item.locator('.MW4etd, .ZkP5Je span[aria-hidden="true"]'));
      let rating = parseFloat((ratingStr || '0').replace(',', '.')) || 0;

      // Reviews
      let reviewsStr = await safeText(item.locator('.UY7F9'));
      let reviews = 0;
      const revMatch = reviewsStr.match(/\(?(\d[\d.,]*)\)?/);
      if (revMatch) {
        reviews = parseInt(revMatch[1].replace(/[.,]/g, ''), 10) || 0;
      }

      // Details lines
      const detailLines = await item.locator('.W4P4ne, .W4bE9, div[class*="fontBodyMedium"]').allInnerTexts().catch(() => []);
      let category = '';
      let address = '';
      let phoneFound = '';

      for (const line of detailLines) {
        const text = line.replace(/[\uE000-\uF8FF]/g, '').replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
        if (!text) continue;

        const phoneMatch = text.match(/(?:\+62|08|\(0\d{2,3}\))\s?[0-9\s-]{6,14}/);
        if (phoneMatch && !phoneFound) {
          phoneFound = phoneMatch[0].replace(/\s+/g, ' ').trim();
        }

        if (text.includes('·') || text.includes('•')) {
          const parts = text.split(/[·•]/).map(s => s.trim());
          for (const p of parts) {
            let cleanP = p.replace(/[\uE000-\uF8FF]/g, '')
                          .replace(/\d+([.,]\d+)?\(\d+\)/g, '')
                          .replace(name, '')
                          .replace(/^\d+([.,]\d+)?\s*/, '')
                          .replace(/^Tidak ada ulasan\s*/i, '')
                          .trim();
            if (!category && cleanP && isNaN(cleanP) && !cleanP.includes('Buka') && !cleanP.includes('Tutup') && !cleanP.includes('jam') && !cleanP.toLowerCase().includes('jl') && cleanP.length < 40) {
              category = cleanP;
            }
            if (!address && (p.toLowerCase().includes('jl') || p.toLowerCase().includes('raya') || p.toLowerCase().includes('rt ') || p.toLowerCase().includes('rw ') || p.toLowerCase().includes('blok') || p.toLowerCase().includes('no.') || p.toLowerCase().includes('kec') || p.toLowerCase().includes('kel'))) {
              address = p.replace(/[\uE000-\uF8FF]/g, '').replace(/Tutup.*$/i, '').replace(/Buka.*$/i, '').trim();
            }
          }
        } else if (!address && (text.toLowerCase().includes('jl.') || text.toLowerCase().includes('jl ') || text.toLowerCase().includes('rt ') || text.toLowerCase().includes('rw '))) {
          address = text.replace(/Tutup.*$/i, '').replace(/Buka.*$/i, '').trim();
        }
      }

      if (!category) category = keyword || 'Tempat Usaha';
      if (!address) address = `${location || 'Indonesia'}`;

      const coords = parseCoordinates(mapsUrl);
      const phoneObj = cleanPhone(phoneFound);

      results.push({
        id: `live-${results.length + 1}`,
        name,
        category,
        rating,
        reviews,
        address,
        lat: coords.lat,
        lng: coords.lng,
        phoneRaw: phoneObj.phoneRaw,
        phoneFormatted: phoneObj.phoneFormatted,
        isOpen: true,
        hours: '08.00 - 17.00 WIB',
        priceRange: 'Tersedia',
        features: `Layanan ${category}`,
        maps_url: mapsUrl,
        website: '',
        isRealGoogleMaps: true
      });
    }

    return results;
  } finally {
    await browser.close().catch(() => {});
  }
}

// CLI execution
if (require.main === module) {
  const keyword = process.argv[2] || 'Tukang Cukur';
  const location = process.argv[3] || 'Cipayung Depok';
  const limit = parseInt(process.argv[4] || '15', 10);

  scrapeLive(keyword, location, limit)
    .then(data => {
      console.log(JSON.stringify(data));
      process.exit(0);
    })
    .catch(err => {
      console.error(JSON.stringify({ error: err.message }));
      process.exit(1);
    });
}

module.exports = { scrapeLive };
