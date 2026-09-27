/**
 * Google Maps Business Leads Scraper
 * Tech Stack: Playwright + Node.js
 * 
 * Features:
 * - Robust infinite scrolling targeting the [role="feed"] container
 * - Dynamic lazy-loading detection with noChangeCount threshold
 * - Deduplication by Google Maps URL / unique business identifier
 * - Safe field extraction (name, rating, reviews, address, category, phone, website, maps_url)
 * - Automatic output export to both results.json and results.csv
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * Safe text extractor helper that never throws
 * @param {import('playwright').Locator} locator 
 * @returns {Promise<string>}
 */
async function safeText(locator) {
  try {
    const count = await locator.count();
    if (count === 0) return '';
    const text = await locator.first().innerText({ timeout: 1000 });
    return text ? text.trim() : '';
  } catch (e) {
    return '';
  }
}

/**
 * Safe attribute extractor helper that never throws
 * @param {import('playwright').Locator} locator 
 * @param {string} attrName 
 * @returns {Promise<string>}
 */
async function safeAttr(locator, attrName) {
  try {
    const count = await locator.count();
    if (count === 0) return '';
    const val = await locator.first().getAttribute(attrName, { timeout: 1000 });
    return val ? val.trim() : '';
  } catch (e) {
    return '';
  }
}

/**
 * Escape string for RFC 4180 CSV standard
 * @param {string|number} value 
 * @returns {string}
 */
function escapeCsv(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Main Google Maps Scraping Function
 * @param {string} url - Google Maps search URL
 * @param {object} options - Optional configuration (headless, maxRetries, etc.)
 * @returns {Promise<{source_url: string, total_results: number, scraped_at: string, results: Array}>}
 */
async function scrapeGoogleMaps(url, options = {}) {
  const isHeadless = options.headless !== undefined ? options.headless : true;
  const maxRetries = options.maxRetries || 5;
  const scrollStep = options.scrollStep || 1200;
  const scrollDelay = options.scrollDelay || 1500;

  console.log(`[INFO] Launching browser (headless: ${isHeadless})...`);
  const browser = await chromium.launch({
    headless: isHeadless,
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
    console.log('[INFO] Opening Google Maps...');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

    // Handle Google Consent / Cookie dialog if it appears
    try {
      const consentBtn = page.locator('button[aria-label*="Accept"], button[aria-label*="Setuju"], form[action*="consent"] button').first();
      if (await consentBtn.isVisible({ timeout: 2500 })) {
        await consentBtn.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      // Ignore if no consent prompt
    }

    console.log('[INFO] Waiting for results...');
    
    // Locate the feed container
    // Google Maps uses [role="feed"] for the search results container
    const feed = page.locator('[role="feed"]');
    
    try {
      await feed.waitFor({ state: 'visible', timeout: 15000 });
    } catch (e) {
      // Fallback: check if single result page or alternative layout
      const singleCard = page.locator('div[role="main"] h1');
      if (await singleCard.count() > 0) {
        console.log('[INFO] Detected single result page layout.');
      } else {
        throw new Error('Hasil pencarian Google Maps ([role="feed"]) tidak ditemukan dalam 15 detik.');
      }
    }

    let previousCount = 0;
    let noChangeCount = 0;

    // Wait for at least initial articles to render
    await page.waitForTimeout(2000);

    // Infinite Scrolling Loop
    while (noChangeCount < maxRetries) {
      const articles = feed.locator('[role="article"]');
      const currentCount = await articles.count();

      if (currentCount > previousCount) {
        console.log(`[INFO] Results loaded: ${currentCount}`);
        previousCount = currentCount;
        noChangeCount = 0;
      } else {
        noChangeCount++;
        console.log(`[INFO] No new results detected (${noChangeCount}/${maxRetries})`);
      }

      // Check if end of list banner is visible
      const endOfList = await feed.locator('.HlvSq, [class*="fontBodyMedium"]:has-text("You\'ve reached the end"), [class*="fontBodyMedium"]:has-text("Akhir dari daftar"), [class*="fontBodyMedium"]:has-text("Tidak ada hasil lagi")').first().isVisible({ timeout: 300 }).catch(() => false);
      if (endOfList) {
        console.log('[INFO] End of results detected.');
        break;
      }

      console.log('[INFO] Scrolling...');

      // Primary scroll: scroll directly on the feed container
      await feed.evaluate((el, step) => {
        el.scrollTop += step;
      }, scrollStep).catch(() => {});

      // Auxiliary scroll: scroll the last article into view to trigger lazy-loading
      if (currentCount > 0) {
        try {
          await articles.nth(currentCount - 1).scrollIntoViewIfNeeded({ timeout: 1000 });
        } catch (err) {
          // Ignore scrollIntoView errors
        }
      }

      // Wait for Google Maps to trigger background AJAX lazy-load
      await page.waitForTimeout(scrollDelay);
    }

    console.log('[INFO] Extracting data...');

    // Extract all articles
    const articleLocators = feed.locator('[role="article"]');
    const totalArticles = await articleLocators.count();
    const rawResults = [];

    for (let i = 0; i < totalArticles; i++) {
      const item = articleLocators.nth(i);

      // Business Name
      let name = await safeAttr(item.locator('a.hfpxzc'), 'aria-label');
      if (!name) {
        name = await safeText(item.locator('.qBF1Pd, div[class*="fontHeadlineSmall"]'));
      }

      // Skip ad placeholders or empty items
      if (!name) continue;

      // Google Maps URL
      const maps_url = await safeAttr(item.locator('a.hfpxzc'), 'href');

      // Rating (e.g. "4.8" or "4,8")
      let rating = await safeText(item.locator('.MW4etd, span[aria-label*="bintang"], span[aria-label*="stars"]'));
      const ratingMatch = rating.match(/(\d+[.,]\d+)/);
      if (ratingMatch) {
        rating = ratingMatch[1].replace(',', '.');
      } else {
        rating = rating ? rating.trim() : '';
      }

      // Total Reviews (e.g. "(123)" -> "123")
      let reviews = await safeText(item.locator('.UY7F9'));
      const revMatch = reviews.match(/\(?(\d[\d.,]*)\)?/);
      if (revMatch) {
        reviews = revMatch[1].replace(/[.,]/g, '').trim();
      } else {
        reviews = reviews ? reviews.replace(/[()]/g, '').trim() : '';
      }

      // Category & Address lines
      let category = '';
      let address = '';
      let phone = '';
      let website = '';

      // Extract text content from details blocks
      const detailLines = await item.locator('.W4P4ne, .W4bE9, div[class*="fontBodyMedium"]').allInnerTexts().catch(() => []);
      
      for (const line of detailLines) {
        // Flatten newlines into single spaces
        const text = line.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
        if (!text) continue;

        // Check for phone number pattern (+62 or 08 or (021))
        const phoneMatch = text.match(/(?:\+62|08|\(0\d{2,3}\))\s?[0-9\s-]{6,14}/);
        if (phoneMatch && !phone) {
          phone = phoneMatch[0].replace(/\s+/g, ' ').trim();
        }

        // Parse category and address
        if (text.includes('·') || text.includes('•')) {
          const parts = text.split(/[·•]/).map(s => s.trim());
          if (parts.length > 0 && !category && isNaN(parts[0]) && !parts[0].includes('Buka') && !parts[0].includes('Tutup')) {
            category = parts[0];
          }
          for (let p = 1; p < parts.length; p++) {
            const part = parts[p];
            if (!address && (part.toLowerCase().includes('jl') || part.toLowerCase().includes('raya') || part.toLowerCase().includes('rt ') || part.toLowerCase().includes('rw ') || part.toLowerCase().includes('blok') || part.toLowerCase().includes('no.') || part.toLowerCase().includes('kec') || part.toLowerCase().includes('kel'))) {
              address = part;
            }
          }
        } else if (!address && (text.toLowerCase().includes('jl.') || text.toLowerCase().includes('jl ') || text.toLowerCase().includes('rt ') || text.toLowerCase().includes('rw '))) {
          address = text;
        } else if (!category && (text.toLowerCase().includes('cukur') || text.toLowerCase().includes('barber') || text.toLowerCase().includes('salon') || text.toLowerCase().includes('restoran') || text.toLowerCase().includes('kafe') || text.toLowerCase().includes('toko'))) {
          category = text;
        }
      }

      // Default category fallback if not detected
      if (!category) {
        category = 'Tempat Usaha';
      }

      // Extract Website URL if present
      website = await safeAttr(item.locator('a[data-value*="Website"], a[aria-label*="Situs web"], a[aria-label*="Website"], a[href^="http"]:not([href*="google.com"])'), 'href');

      rawResults.push({
        name,
        rating,
        reviews,
        address,
        category,
        phone,
        website,
        maps_url
      });
    }

    // Deduplicate results by maps_url (fallback to name + address)
    const uniqueMap = new Map();
    for (const r of rawResults) {
      const key = r.maps_url ? r.maps_url.split('?')[0] : `${r.name}_${r.address}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, r);
      }
    }

    const uniqueResults = Array.from(uniqueMap.values());
    console.log(`[INFO] Total unique results: ${uniqueResults.length}`);

    const finalOutput = {
      source_url: url,
      total_results: uniqueResults.length,
      scraped_at: new Date().toISOString(),
      results: uniqueResults
    };

    return finalOutput;

  } finally {
    await browser.close().catch(() => {});
  }
}

/**
 * Save scraping results to JSON and CSV files
 * @param {object} data - Output data object
 * @param {string} outputDir - Directory to save files
 */
function saveOutputs(data, outputDir = __dirname) {
  const jsonPath = path.join(outputDir, 'results.json');
  const csvPath = path.join(outputDir, 'results.csv');

  // 1. Write results.json
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[INFO] Saved results.json`);

  // 2. Write results.csv
  const headers = ['name', 'rating', 'reviews', 'address', 'category', 'phone', 'website', 'maps_url'];
  const csvRows = [headers.join(',')];

  for (const item of data.results) {
    const row = headers.map(field => escapeCsv(item[field] || ''));
    csvRows.push(row.join(','));
  }

  fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf-8');
  console.log(`[INFO] Saved results.csv`);
}

// CLI Execution Handler
if (require.main === module) {
  // Check if URL passed as argument, e.g.: node scraper.js "https://..."
  const customUrl = process.argv[2];
  const defaultUrl = 'https://www.google.com/maps/search/tukang+cukur+di+cipayung';
  const targetUrl = customUrl && customUrl.startsWith('http') ? customUrl : defaultUrl;

  console.log(`[INFO] Target URL: ${targetUrl}`);

  scrapeGoogleMaps(targetUrl)
    .then((data) => {
      saveOutputs(data, __dirname);
      console.log(`[INFO] Scraping completed successfully (${data.total_results} items found).`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(`[ERROR] Scraping failed: ${err.message}`);
      process.exit(1);
    });
}

module.exports = {
  scrapeGoogleMaps,
  saveOutputs
};
