import { Router, Request, Response } from 'express';
import { crawl } from '../../services/crawler';
import { md_refactor } from '../../agents/md-refactor';

const router = Router();

interface CrawlQuery {
  url?: string;
}

const validateUrl = (url: unknown): url is string => {
  return typeof url === 'string' && url.trim().length > 0;
};

const handleCrawlAndProcessRequest = async (
  req: Request<{}, {}, {}, CrawlQuery>,
  res: Response,
): Promise<void> => {
  const { url } = req.query;

  if (!validateUrl(url)) {
    res.status(400).json({
      error: 'URL parameter is required and must be a non-empty string',
    });
    return;
  }

  try {
    const markdown = await crawl(url);
    const processedContent = await md_refactor(JSON.stringify(markdown));

    res.type('text/markdown').status(200).send(processedContent);
  } catch (error) {
    console.error(`Failed to process URL: ${url}. Error:`, error);
    res.status(500).json({
      error:
        'Failed to process the provided URL. Please ensure the URL is correct and try again later.',
    });
  }
};

router.get('/', handleCrawlAndProcessRequest);

export default router;
