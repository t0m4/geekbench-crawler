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


## Screenshots
![Screenshot 2020-09-14 at 18 40 29](https://user-images.githubusercontent.com/13768191/93114269-af159a80-f6ba-11ea-8151-0863762d131c.png)

![Screenshot 2020-09-14 at 18 43 04](https://user-images.githubusercontent.com/13768191/93114184-960ce980-f6ba-11ea-855a-0315ee1a0441.png)


## TODOs
- [ ] do something display wise with the mhz grouped aggregated items
- [ ] make it a valid runnable shell script
- [ ] add linting
- [ ] add ci
