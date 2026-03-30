# Audiobook Guild Scraper

This project provides a Node.js script to scrape audiobook product information from [Audiobook Guild](https://audiobookguild.com/). It extracts details such as author, narrators, genre, series, tropes, and other metadata, and saves the data into a JSON file.

**Disclaimer**: This is hobby code and the data in the dataset is the property of its owners.

## Features

- Scrapes product data from Audiobook Guild.
- Parses various product tags into structured metadata.
- Extracts episode numbers from audiobook titles.
- Supports concurrent page fetching for faster scraping.
- Updates existing entries and adds new ones to avoid duplicate data.
- Outputs data to `audiobookguild.json`.

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/audiobookguild-scraper.git
   cd audiobookguild-scraper
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

## Usage

To run the scraper, execute the main script:

```bash
node audiobookguild_scrape.js
```

The script will start scraping pages concurrently and will save the collected data into `audiobookguild.json` in the project root directory. If `audiobookguild.json` already exists, the script will load the existing data and update/add new audiobooks.

**Note**: The `audiobookguild.json` dataset is automatically updated daily via a GitHub Actions workflow.

## Output

The scraped data is saved in `audiobookguild.json`. Each entry in the JSON array represents an audiobook product with the following structure:

```json
[
  {
    "id": "...",
    "link": "...",
    "cover": "...",
    "description": "...",
    "seriesName": "...",
    "title": "...",
    "episodeNumber": "...",
    "author": "...",
    "releaseDate": "...",
    "genre": [],
    "narrators": [],
    "tags": [],
    "harem": "...",
    "sexyTime": "..."
  }
]
```
