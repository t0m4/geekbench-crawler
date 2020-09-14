# geekbench-crawler

## Motivation
To learn a bit of TypeScript and also comes in handy for building a new PC

## Usage
- `npm install && npm run build`
- `node build/index.js --item 'i9-9900KF'`

## CLI options
### --item
Specify the item (CPU) to searh for on Geekbench

### --useCache
Means that after a crawl the result will be saved and if it exists already, the scraping won't happen.

### --clearCache
Will remove the cached file for the given `--item` if the file exists
