<div align="center">
  <h1 align="center"><strong>NetExtract</strong></h1>
  <p>NetExtract is crafted to extract core content from webpages and convert it into clean, LLM-friendly text. Leveraging the power of Express.js, TypeScript, and Puppeteer, it offers a streamlined API for efficient content extraction and transformation, making it an invaluable tool for enhancing LLM and RAG systems with up-to-date web information and API web scraping.</p>
</div>

![preview](./assets/x.png)

## Features

1. Core Content Extraction: Seamlessly extracts essential content from any URL.
2. Markdown Conversion: Converts webpage content into clean, well-formatted Markdown.
3. Social Media Scraping: Efficiently scrapes and formats X (Twitter) posts.
4. Simple API Integration: Easily integrates with existing systems.
5. LLM-Powered Conversion: Utilizes open-source large language models to enhance the extraction and conversion process, ensuring high-quality output.

## 📖 Usage

To use NetExtract, prepend the API endpoint to your desired URL:

```bash
http://{your_address}/api?url={url}
```

## 🗂️ Getting started with Docker

```bash
git clone https://github.com/sabber-slt/NetExtract
cd NetExtract
```

Then run the application with Docker:

```bash
docker compose up -d
```

## ⚡️ Acknowledgments

- Inspired by jina.ai
- Built with Node.js, Express.js, TypeScript, and Puppeteer

## 🧩 Structure

```
.
├── cookie
│   └── twitter.json            # Twitter cookie for X (Twitter) post scraping
├── docs                        # Documentation files
├── search                      # Searxng engine
├── src                         # Source code
│   ├── interfaces              # TypeScript interfaces
│   ├── lib                     # Utility libraries
│   ├── routes                  # Express route handlers
│   ├── services                # Core service layer for business logic
│   ├── utils                   # Helper functions and utilities
│   └── app.ts                  # Main application entry point
├── .env                        # Environment variables
├── .gitignore                  # Git ignored files
├── .prettierignore             # Prettier ignored files
├── .prettierrc.js              # Prettier configuration
├── app.log                     # Log file
├── Dockerfile                  # Dockerfile
├── docker-compose.yaml         # Docker Compose configuration
├── package.json                # Node.js project metadata
├── README.md                   # Project README
├── tsconfig.json               # TypeScript configuration
└── yarn.lock                   # Yarn lockfile for dependency management

```

## 🤝 Contributing

I welcome and appreciate contributions! If you'd like to contribute, please feel free to submit issues, fork the repository, and send pull requests.
