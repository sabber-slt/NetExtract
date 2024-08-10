import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import cheerio from 'cheerio';

export interface ParsedContent {
  title: string;
  content: string;
  images: string[];
  url: string;
}

export const parseHTML = (html: string, url: string): ParsedContent => {
  const dom = new JSDOM(html, { url });
  const document = dom.window.document;

  const readability = new Readability(document);
  const article = readability.parse();

  if (!article) {
    throw new Error('Failed to parse the content using Readability');
  }

  const $ = cheerio.load(html);

  // Extracting images
  const images: string[] = [];
  $('img').each((_, element) => {
    const src = $(element).attr('src');
    if (src) images.push(src);
  });

  return {
    title: article.title || 'Untitled',
    content: article.textContent || '',
    images,
    url,
  };
};
