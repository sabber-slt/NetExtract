type Content = {
  title: string;
  url: string;
  content: string;
  images: string[];
};

export const convertToMarkdown = (content: Content): string => {
  const { title, url, content: textContent, images } = content;

  const formattedDate = new Date().toDateString();
  const formattedContent = textContent
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .join('\n');

  const imageMarkdown = images
    .map((img, index) => `![Image ${index + 1}](${img})`)
    .join('\n\n');

  return `
# ${title}

> Date: ${formattedDate}
> URL Source: ${url}
--------------------------------------------------

${formattedContent}

${imageMarkdown}

[Read more](${url})
  `.trim();
};
