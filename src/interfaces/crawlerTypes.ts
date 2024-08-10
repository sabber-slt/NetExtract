import type { CookieParam } from 'puppeteer';

export interface ScrapeOptions {
  url: string;
  cookies?: CookieParam[];
  viewport?: {
    width: number;
    height: number;
  };
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  userAgent?: string;
  headless?: boolean;
  cookiesFilePath?: string;
}

export interface CleanedContent {
  title: string;
  content: string;
  excerpt: string;
  markdown: string;
}

export interface ScrapedData {
  title: string;
  content: string;
  excerpt: string;
  markdown: string;
}
