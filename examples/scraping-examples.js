// Web Scraping Examples in Node.js

const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

// ========================================
// 1. BASIC AXIOS + CHEERIO SCRAPING
// ========================================

async function basicScraping() {
  try {
    // Make HTTP request
    const response = await axios.get('https://example.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Load HTML into Cheerio
    const $ = cheerio.load(response.data);

    // Extract data using CSS selectors
    const data = [];
    $('.item').each((index, element) => {
      const title = $(element).find('.title').text().trim();
      const price = $(element).find('.price').text().trim();
      const link = $(element).find('a').attr('href');
      
      data.push({ title, price, link });
    });

    return data;
  } catch (error) {
    console.error('Scraping error:', error.message);
    throw error;
  }
}

// ========================================
// 2. ADVANCED AXIOS + CHEERIO WITH ERROR HANDLING
// ========================================

async function advancedScraping(url, options = {}) {
  const defaultOptions = {
    timeout: 10000,
    retries: 3,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
    }
  };

  const config = { ...defaultOptions, ...options };

  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      console.log(`Attempt ${attempt} for ${url}`);
      
      const response = await axios.get(url, {
        headers: config.headers,
        timeout: config.timeout,
        validateStatus: (status) => status < 400 // Accept only success status codes
      });

      const $ = cheerio.load(response.data);
      
      // Check if page loaded properly
      if ($('body').length === 0) {
        throw new Error('Invalid HTML structure');
      }

      return $; // Return cheerio object for further processing
      
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === config.retries) {
        throw new Error(`Failed to scrape ${url} after ${config.retries} attempts`);
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// ========================================
// 3. HANDLING FORMS AND POST REQUESTS
// ========================================

async function scrapeWithLogin() {
  const session = axios.create({
    withCredentials: true,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  try {
    // 1. Get login page to extract CSRF token
    const loginPage = await session.get('https://example.com/login');
    const $login = cheerio.load(loginPage.data);
    const csrfToken = $login('input[name="_token"]').val();

    // 2. Submit login form
    const loginData = {
      username: 'your-username',
      password: 'your-password',
      _token: csrfToken
    };

    await session.post('https://example.com/login', loginData);

    // 3. Access protected content
    const protectedPage = await session.get('https://example.com/dashboard');
    const $dashboard = cheerio.load(protectedPage.data);
    
    // Extract data from protected page
    const data = $dashboard('.protected-data').map((i, el) => {
      return {
        id: $(el).attr('data-id'),
        content: $(el).text().trim()
      };
    }).get();

    return data;
  } catch (error) {
    console.error('Login scraping error:', error.message);
    throw error;
  }
}

// ========================================
// 4. PUPPETEER FOR DYNAMIC CONTENT
// ========================================

async function scrapeWithPuppeteer() {
  let browser;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true, // Set to false for debugging
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set user agent and viewport
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to page
    await page.goto('https://example.com', { 
      waitUntil: 'networkidle2' // Wait for network to be idle
    });

    // Wait for specific element to load
    await page.waitForSelector('.dynamic-content', { timeout: 5000 });

    // Execute JavaScript in browser context
    const data = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('.item').forEach(item => {
        items.push({
          title: item.querySelector('.title')?.textContent?.trim(),
          price: item.querySelector('.price')?.textContent?.trim(),
        });
      });
      return items;
    });

    // Handle infinite scroll
    await page.evaluate(() => {
      return new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if(totalHeight >= scrollHeight){
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    return data;
  } catch (error) {
    console.error('Puppeteer scraping error:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// ========================================
// 5. HANDLING RATE LIMITING
// ========================================

class RateLimitedScraper {
  constructor(requestsPerSecond = 1) {
    this.queue = [];
    this.isProcessing = false;
    this.interval = 1000 / requestsPerSecond;
  }

  async scrape(url) {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const { url, resolve, reject } = this.queue.shift();
      
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        const $ = cheerio.load(response.data);
        resolve($);
      } catch (error) {
        reject(error);
      }
      
      // Wait before next request
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.interval));
      }
    }
    
    this.isProcessing = false;
  }
}

// Usage
const scraper = new RateLimitedScraper(2); // 2 requests per second

// ========================================
// 6. PROXY ROTATION
// ========================================

class ProxyScraper {
  constructor(proxies = []) {
    this.proxies = proxies;
    this.currentProxyIndex = 0;
  }

  getNextProxy() {
    if (this.proxies.length === 0) return null;
    
    const proxy = this.proxies[this.currentProxyIndex];
    this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
    return proxy;
  }

  async scrape(url) {
    const proxy = this.getNextProxy();
    const config = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    if (proxy) {
      config.proxy = {
        host: proxy.host,
        port: proxy.port,
        auth: proxy.auth
      };
    }

    try {
      const response = await axios.get(url, config);
      return cheerio.load(response.data);
    } catch (error) {
      console.error(`Failed with proxy ${proxy?.host}:`, error.message);
      throw error;
    }
  }
}

// ========================================
// 7. COMPLETE SCRAPING CLASS
// ========================================

class WebScraper {
  constructor(options = {}) {
    this.options = {
      delay: 1000,
      retries: 3,
      timeout: 10000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ...options
    };
  }

  async scrape(url, selectors) {
    try {
      const $ = await this.fetch(url);
      const data = {};

      for (const [key, selector] of Object.entries(selectors)) {
        if (typeof selector === 'string') {
          data[key] = $(selector).text().trim();
        } else if (selector.multiple) {
          data[key] = $(selector.selector).map((i, el) => {
            if (selector.extract) {
              return selector.extract($(el));
            }
            return $(el).text().trim();
          }).get();
        } else if (selector.attribute) {
          data[key] = $(selector.selector).attr(selector.attribute);
        }
      }

      return data;
    } catch (error) {
      console.error('Scraping failed:', error.message);
      throw error;
    }
  }

  async fetch(url) {
    for (let attempt = 1; attempt <= this.options.retries; attempt++) {
      try {
        await this.delay();
        
        const response = await axios.get(url, {
          headers: { 'User-Agent': this.options.userAgent },
          timeout: this.options.timeout
        });

        return cheerio.load(response.data);
      } catch (error) {
        if (attempt === this.options.retries) throw error;
        console.log(`Attempt ${attempt} failed, retrying...`);
      }
    }
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, this.options.delay));
  }
}

// Usage example
async function usageExample() {
  const scraper = new WebScraper({ delay: 2000 });
  
  const selectors = {
    title: 'h1',
    price: '.price',
    images: {
      selector: '.gallery img',
      multiple: true,
      attribute: 'src'
    },
    features: {
      selector: '.features li',
      multiple: true,
      extract: ($el) => $el.text().trim()
    }
  };

  const data = await scraper.scrape('https://example.com/product/123', selectors);
  console.log(data);
}

module.exports = {
  basicScraping,
  advancedScraping,
  scrapeWithLogin,
  scrapeWithPuppeteer,
  RateLimitedScraper,
  ProxyScraper,
  WebScraper,
  usageExample
}; 