import path from 'path';
import { ScrapedData, ScrapeOptions } from '../interfaces/crawlerTypes';
import { scrape } from './puppeteer';

const COOKIE_FILE_PATH = path.resolve(__dirname, '../../cookie/twitter.json');

class CrawlError extends Error {
  constructor(url: string) {
    super(`Failed to crawl URL: ${url}`);
    this.name = 'CrawlError';
  }
}

/**
 * @param options The scraping options.
 * @returns A promise that resolves to the scraped data.
 */
async function scrapeWebsite(options: ScrapeOptions): Promise<ScrapedData> {
  try {
    return await scrape(options);
  } catch (error) {
    console.error(`Error occurred while scraping ${options.url}:`, error);
    throw new CrawlError(options.url);
  }
}

/**
 * @param url The URL to crawl.
 * @returns A promise that resolves to the markdown content.
 */
async function crawl(url: string): Promise<string> {
  const options: ScrapeOptions = {
    url,
    waitUntil: 'networkidle0',
    headless: true,
    cookiesFilePath: COOKIE_FILE_PATH,
  };

  try {
    const { markdown } = await scrapeWebsite(options);
    return markdown;
  } catch (error) {
    console.error(`Error occurred while crawling ${url}:`, error);
    throw error;
  }
}

export { crawl, scrapeWebsite, CrawlError };
