import { Router, Request, Response } from 'express';
import axios from 'axios';
import cheerio from 'cheerio';

const router = Router();

interface SearchQuery {
  q?: string;
}

const GOOGLE_IMAGE_SEARCH_URL =
  'https://www.google.com/search?tbm=isch&tbs=isz:l&q=';

const validateSearchQuery = (query: unknown): query is string => {
  return typeof query === 'string' && query.trim().length > 0;
};

const fetchImageUrls = async (searchQuery: string): Promise<string[]> => {
  const url = `${GOOGLE_IMAGE_SEARCH_URL}${encodeURIComponent(searchQuery)}`;
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  return $('img')
    .map((_, element) => $(element).attr('src'))
    .get()
    .filter(
      (url): url is string => typeof url === 'string' && url.startsWith('http'),
    );
};

const generateImageMarkdown = (imageUrls: string[]): string => {
  return imageUrls
    .map(
      (url) =>
        `<img src="${url}" alt="Image" style="max-width:100%; height:auto;" />`,
    )
    .join('\n\n');
};

const handleImageSearch = async (
  req: Request<{}, {}, {}, SearchQuery>,
  res: Response,
): Promise<void> => {
  const { q } = req.query;

  if (!validateSearchQuery(q)) {
    res.status(400).json({
      error: 'Search query is required and must be a non-empty string',
    });
    return;
  }

  try {
    const imageUrls = await fetchImageUrls(q);
    const markdown = generateImageMarkdown(imageUrls);

    res.type('text/markdown').status(200).send(markdown);
  } catch (error) {
    console.error('Error fetching the images:', error);
    res
      .status(500)
      .json({ error: 'Error fetching the images. Please try again later.' });
  }
};

router.get('/', handleImageSearch);

export default router;
