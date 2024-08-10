import { Router, Request, Response } from 'express';
import { crawl } from '../../services/crawler';

const router = Router();

interface CrawlQuery {
  url?: string;
}

const validateUrl = (url: unknown): url is string => {
  return typeof url === 'string' && url.trim().length > 0;
};

const handleCrawlRequest = async (
  req: Request<{}, {}, {}, CrawlQuery>,
  res: Response,
): Promise<void> => {
  const { url } = req.query;

  if (!validateUrl(url)) {
    res
      .status(400)
      .json({
        error: 'URL parameter is required and must be a non-empty string',
      });
    return;
  }

  try {
    const markdown = await crawl(url);
    res.type('text/markdown').status(200).send(markdown);
  } catch (error) {
    console.error(`Failed to crawl URL: ${url}. Error:`, error);
    res.status(500).json({
      error:
        'Failed to crawl the provided URL. Please ensure the URL is correct and try again later.',
    });
  }
};

router.get('/', handleCrawlRequest);

export default router;
