import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import puppeteerBlockResources from 'puppeteer-extra-plugin-block-resources';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import TurndownService from 'turndown';
import * as turndownPluginGfm from 'joplin-turndown-plugin-gfm';
import { CleanedContent, ScrapeOptions } from '../interfaces/crawlerTypes';

const DEFAULT_VIEWPORT = { width: 1280, height: 800 };
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
const DELAY_AFTER_SCROLL = 1000;

puppeteer.use(StealthPlugin());
puppeteer.use(
  puppeteerBlockResources({
    blockedTypes: new Set(['stylesheet', 'font']),
  }),
);

const delay = (time: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, time));

export const scrape = async ({
  url,
  viewport = DEFAULT_VIEWPORT,
  userAgent = DEFAULT_USER_AGENT,
}: ScrapeOptions): Promise<CleanedContent> => {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    page = await browser.newPage();
    await configurePage(page, viewport, userAgent);

    await navigateToPage(page, url);
    await performScrolling(page);

    const content = await getPageContent(page);
    return processContent(content);
  } catch (error) {
    console.error('Scraping failed:', error);
    throw error;
  } finally {
    await cleanup(page, browser);
  }
};

// Helper functions
async function configurePage(
  page: Page,
  viewport: { width: number; height: number },
  userAgent: string,
): Promise<void> {
  await page.setViewport(viewport);
  await page.setUserAgent(userAgent);
}

async function navigateToPage(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', () => resolve());
        }
      }),
  );
}

async function performScrolling(page: Page): Promise<void> {
  const viewportHeight = (await page.evaluate(
    () => window.innerHeight,
  )) as number;
  const targetScrollHeight = viewportHeight; //
  let currentScrollPosition = 0;

  while (currentScrollPosition < targetScrollHeight) {
    await page.evaluate((scrollStep) => {
      window.scrollBy(0, scrollStep);
    }, viewportHeight);

    await delay(DELAY_AFTER_SCROLL);

    currentScrollPosition = (await page.evaluate(
      () => window.pageYOffset,
    )) as number;

    const totalHeight = await page.evaluate(() => document.body.scrollHeight);
    if (currentScrollPosition + viewportHeight >= totalHeight) {
      break;
    }
  }
}

async function getPageContent(page: Page): Promise<string> {
  return page.evaluate(() => new XMLSerializer().serializeToString(document));
}

function processContent(content: string): CleanedContent {
  if (!content) {
    throw new Error('Failed to parse article content');
  }

  const turndownService = new TurndownService({
    codeBlockStyle: 'fenced',
    headingStyle: 'atx',
  });

  turndownService.use(turndownPluginGfm.gfm);

  turndownService.addRule('ignoreScriptsAndStyles', {
    filter: ['script', 'style', 'noscript'],
    replacement: () => '',
  });

  turndownService.keep([
    'h1',
    'h2',
    'h3',
    'p',
    'ul',
    'ol',
    'li',
    'a',
    'img',
    'blockquote',
    'pre',
    'code',
  ]);

  let markdown = turndownService.turndown(content);

  markdown = markdown.replace(/({|})/g, '\\$1');

  markdown = markdown.replace(/\[Skip to Content\]\(#[^\)]*\)/gi, '');

  return {
    content: markdown,
    excerpt: markdown.slice(0, 200) + '...',
    markdown,
  };
}

async function cleanup(
  page: Page | null,
  browser: Browser | null,
): Promise<void> {
  if (page) await page.close();
  if (browser) await browser.close();
}
