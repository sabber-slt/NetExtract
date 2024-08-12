import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import puppeteerBlockResources from 'puppeteer-extra-plugin-block-resources';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import * as turndownPluginGfm from 'joplin-turndown-plugin-gfm';
import fs from 'fs';
import { CleanedContent, ScrapeOptions } from '../interfaces/crawlerTypes';

// Constants
const DEFAULT_VIEWPORT = { width: 1280, height: 800 };
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
const SCROLL_MULTIPLIER = 20;
const SCROLL_DURATION = 2000;
const DELAY_AFTER_SCROLL = 2000;

// Configure puppeteer
puppeteer.use(StealthPlugin());
puppeteer.use(
  puppeteerBlockResources({
    blockedTypes: new Set(['stylesheet', 'font']),
  }),
);

// Utility functions
const delay = (time: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, time));

const smoothScroll = async (
  page: Page,
  scrollDistance: number,
  duration: number,
): Promise<void> => {
  await page.evaluate(
    async (distance: number, time: number) => {
      await new Promise<void>((resolve) => {
        let scrolled = 0;
        const stepSize = distance / (time / 10); // 10ms per step
        const timer = setInterval(() => {
          window.scrollBy(0, stepSize);
          scrolled += stepSize;
          if (scrolled >= distance) {
            clearInterval(timer);
            resolve();
          }
        }, 10);
      });
    },
    scrollDistance,
    duration,
  );
};

// Main scraping function
export const scrape = async ({
  url,
  cookies = [],
  viewport = DEFAULT_VIEWPORT,
  userAgent = DEFAULT_USER_AGENT,
  headless = true,
  cookiesFilePath,
}: ScrapeOptions): Promise<CleanedContent> => {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await puppeteer.launch({
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    page = await browser.newPage();
    await configurePage(page, viewport, userAgent);

    if (url.includes('x.com')) {
      await handleTwitterSpecificSetup(page, cookiesFilePath);
    }

    await navigateToPage(page, url);
    await performScrolling(page, viewport, url);

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

async function handleTwitterSpecificSetup(
  page: Page,
  cookiesFilePath?: string,
): Promise<void> {
  if (cookiesFilePath && fs.existsSync(cookiesFilePath)) {
    const cookiesData = fs.readFileSync(cookiesFilePath, 'utf8');
    const parsedCookies = JSON.parse(cookiesData);
    await page.setCookie(...parsedCookies);
  }
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

async function performScrolling(
  page: Page,
  viewport: { width: number; height: number },
  url: string,
): Promise<void> {
  if (url.includes('x.com')) {
    const scrollDistance = viewport.height * SCROLL_MULTIPLIER;
    await smoothScroll(page, scrollDistance, SCROLL_DURATION);
    await delay(DELAY_AFTER_SCROLL);
  }
}

async function getPageContent(page: Page): Promise<string> {
  return page.evaluate(() => new XMLSerializer().serializeToString(document));
}

function processContent(content: string): CleanedContent {
  const dom = new JSDOM(content);
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article) {
    throw new Error('Failed to parse article content');
  }

  const turndownService = new TurndownService();
  turndownService.addRule('inlineLink', {
    filter: function (node, options) {
      return (
        options.linkStyle === 'inlined' &&
        node.nodeName === 'A' &&
        node.getAttribute('href')
      );
    },
    replacement: function (content, node) {
      var href = node.getAttribute('href').trim();
      var title = node.title ? ' "' + node.title + '"' : '';
      return '[' + content.trim() + '](' + href + title + ')\n';
    },
  });

  var gfm = turndownPluginGfm.gfm;
  turndownService.use(gfm);
  let markdown = turndownService.turndown(article.content);
  let insideLinkContent = false;
  let newMarkdownContent = '';
  let linkOpenCount = 0;
  for (let i = 0; i < markdown.length; i++) {
    const char = markdown[i];

    if (char == '[') {
      linkOpenCount++;
    } else if (char == ']') {
      linkOpenCount = Math.max(0, linkOpenCount - 1);
    }
    insideLinkContent = linkOpenCount > 0;

    if (insideLinkContent && char == '\n') {
      newMarkdownContent += '\\' + '\n';
    } else {
      newMarkdownContent += char;
    }
  }
  markdown = newMarkdownContent;

  // Remove [Skip to Content](#page) and [Skip to content](#skip)
  markdown = markdown.replace(/\[Skip to Content\]\(#[^\)]*\)/gi, '');

  return {
    title: article.title,
    content: article.content,
    excerpt: article.excerpt,
    markdown: markdown,
  };
}

async function cleanup(
  page: Page | null,
  browser: Browser | null,
): Promise<void> {
  if (page) await page.close();
  if (browser) await browser.close();
}
