// Web Scraping Best Practices and Real-World Example

const axios = require('axios');
const cheerio = require('cheerio');

// ========================================
// BEST PRACTICES FOR WEB SCRAPING
// ========================================

/*
1. RESPECT ROBOTS.TXT
   - Always check the website's robots.txt file
   - Follow the rules set by the website

2. RATE LIMITING
   - Don't overwhelm servers with too many requests
   - Add delays between requests (1-3 seconds minimum)

3. USER AGENT
   - Always set a proper User-Agent header
   - Rotate user agents if needed

4. ERROR HANDLING
   - Implement retry logic with exponential backoff
   - Handle different types of errors gracefully

5. LEGAL CONSIDERATIONS
   - Check Terms of Service
   - Don't scrape copyrighted content without permission
   - Some websites require explicit permission

6. CACHING
   - Cache responses to avoid repeated requests
   - Respect cache headers from the server

7. MONITORING
   - Log your scraping activities
   - Monitor for changes in website structure
*/

// ========================================
// PRODUCTION-READY SCRAPER CLASS
// ========================================

class ProductionScraper {
  constructor(options = {}) {
    this.options = {
      // Rate limiting
      requestDelay: 2000, // 2 seconds between requests
      maxConcurrent: 1, // Max concurrent requests
      
      // Error handling
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000,
      
      // Headers
      userAgents: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      ],
      
      // Caching
      enableCache: true,
      cacheMaxAge: 300000, // 5 minutes
      
      ...options
    };
    
    this.cache = new Map();
    this.requestQueue = [];
    this.isProcessing = false;
    
    // Create axios instance with defaults
    this.axios = axios.create({
      timeout: this.options.timeout,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });
  }

  // Get random user agent
  getRandomUserAgent() {
    const agents = this.options.userAgents;
    return agents[Math.floor(Math.random() * agents.length)];
  }

  // Check cache
  getCached(url) {
    if (!this.options.enableCache) return null;
    
    const cached = this.cache.get(url);
    if (cached && (Date.now() - cached.timestamp) < this.options.cacheMaxAge) {
      return cached.data;
    }
    return null;
  }

  // Set cache
  setCache(url, data) {
    if (this.options.enableCache) {
      this.cache.set(url, {
        data,
        timestamp: Date.now()
      });
    }
  }

  // Make HTTP request with retries
  async makeRequest(url) {
    // Check cache first
    const cached = this.getCached(url);
    if (cached) {
      console.log(`Using cached data for ${url}`);
      return cached;
    }

    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        console.log(`Fetching ${url} (attempt ${attempt})`);
        
        const response = await this.axios.get(url, {
          headers: {
            'User-Agent': this.getRandomUserAgent()
          }
        });

        // Cache the response
        this.setCache(url, response.data);
        
        return response.data;
      } catch (error) {
        console.error(`Attempt ${attempt} failed for ${url}:`, error.message);
        
        if (attempt === this.options.maxRetries) {
          throw new Error(`Failed to fetch ${url} after ${this.options.maxRetries} attempts: ${error.message}`);
        }
        
        // Exponential backoff
        const delay = this.options.retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
      }
    }
  }

  // Sleep utility
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Queue-based scraping with rate limiting
  async scrape(url, extractionFunction) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        url,
        extractionFunction,
        resolve,
        reject
      });
      
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      const { url, extractionFunction, resolve, reject } = this.requestQueue.shift();
      
      try {
        const html = await this.makeRequest(url);
        const $ = cheerio.load(html);
        const data = extractionFunction($);
        resolve(data);
      } catch (error) {
        reject(error);
      }
      
      // Rate limiting delay
      if (this.requestQueue.length > 0) {
        await this.sleep(this.options.requestDelay);
      }
    }
    
    this.isProcessing = false;
  }

  // Scrape multiple URLs
  async scrapeMultiple(urls, extractionFunction) {
    const results = [];
    
    for (const url of urls) {
      try {
        const data = await this.scrape(url, extractionFunction);
        results.push({ url, data, success: true });
      } catch (error) {
        console.error(`Failed to scrape ${url}:`, error.message);
        results.push({ url, error: error.message, success: false });
      }
    }
    
    return results;
  }
}

// ========================================
// REAL-WORLD EXAMPLE: NEWS SCRAPER
// ========================================

class NewsScraper extends ProductionScraper {
  constructor() {
    super({
      requestDelay: 3000, // 3 seconds between requests
      maxRetries: 2,
      enableCache: true,
      cacheMaxAge: 600000 // 10 minutes cache
    });
  }

  // Extract article data from Hacker News
  extractHackerNewsArticles($) {
    const articles = [];
    
    $('.titleline').each((i, element) => {
      const $element = $(element);
      const $link = $element.find('a');
      
      if ($link.length > 0) {
        articles.push({
          title: $link.text().trim(),
          url: $link.attr('href'),
          domain: $element.find('.sitestr').text() || 'news.ycombinator.com'
        });
      }
    });
    
    return articles;
  }

  // Extract quotes from a quotes website
  extractQuotes($) {
    const quotes = [];
    
    $('.quote').each((i, element) => {
      const $quote = $(element);
      quotes.push({
        text: $quote.find('.text').text().trim(),
        author: $quote.find('.author').text().trim(),
        tags: $quote.find('.tag').map((i, tag) => $(tag).text().trim()).get()
      });
    });
    
    return quotes;
  }

  // Scrape Hacker News
  async scrapeHackerNews() {
    try {
      return await this.scrape('https://news.ycombinator.com/', this.extractHackerNewsArticles.bind(this));
    } catch (error) {
      console.error('Failed to scrape Hacker News:', error);
      return [];
    }
  }

  // Scrape quotes
  async scrapeQuotes() {
    try {
      return await this.scrape('https://quotes.toscrape.com/', this.extractQuotes.bind(this));
    } catch (error) {
      console.error('Failed to scrape quotes:', error);
      return [];
    }
  }
}

// ========================================
// USAGE EXAMPLES
// ========================================

async function demonstrateScrapingExamples() {
  const newsScraper = new NewsScraper();
  
  try {
    console.log('Scraping Hacker News...');
    const articles = await newsScraper.scrapeHackerNews();
    console.log(`Found ${articles.length} articles:`);
    articles.slice(0, 5).forEach((article, i) => {
      console.log(`${i + 1}. ${article.title}`);
      console.log(`   ${article.url}`);
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    console.log('Scraping quotes...');
    const quotes = await newsScraper.scrapeQuotes();
    console.log(`Found ${quotes.length} quotes:`);
    quotes.slice(0, 3).forEach((quote, i) => {
      console.log(`${i + 1}. "${quote.text}"`);
      console.log(`   - ${quote.author}`);
    });
    
  } catch (error) {
    console.error('Scraping failed:', error);
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Check if a website allows scraping
async function checkRobotsTxt(baseUrl) {
  try {
    const robotsUrl = new URL('/robots.txt', baseUrl).toString();
    const response = await axios.get(robotsUrl);
    
    console.log(`Robots.txt for ${baseUrl}:`);
    console.log(response.data);
    
    return response.data;
  } catch (error) {
    console.log(`No robots.txt found for ${baseUrl}`);
    return null;
  }
}

// Analyze website structure
async function analyzeWebsite(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    const analysis = {
      title: $('title').text(),
      metaDescription: $('meta[name="description"]').attr('content'),
      headings: {
        h1: $('h1').length,
        h2: $('h2').length,
        h3: $('h3').length
      },
      links: $('a').length,
      images: $('img').length,
      forms: $('form').length,
      scripts: $('script').length,
      stylesheets: $('link[rel="stylesheet"]').length
    };
    
    return analysis;
  } catch (error) {
    console.error('Failed to analyze website:', error);
    return null;
  }
}

// Export everything
module.exports = {
  ProductionScraper,
  NewsScraper,
  demonstrateScrapingExamples,
  checkRobotsTxt,
  analyzeWebsite
};

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateScrapingExamples()
    .then(() => console.log('\nScraping demonstration completed!'))
    .catch(console.error);
} 