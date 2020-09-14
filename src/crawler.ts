'use strict';
import _ from 'lodash/fp';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';

import ProgressBar from './progress-bar';
import { GeekbenchRowItemJSON, AggregetorInstance } from './types';

export default class Crawler {
  private _useCache: boolean;
  private _clearCache: boolean;
  private _aggregator: AggregetorInstance;
  private _progress;
  private _baseUrl: string;
  private _cacheFilename: string;
  private browser: puppeteer.Browser | null = null;

  constructor(aggregator: AggregetorInstance, itemNametoQuery: string, useCache: boolean, clearCache: boolean) {
    this._baseUrl = `https://browser.geekbench.com/v5/cpu/search?utf8=%E2%9C%93&q=${itemNametoQuery}`;
    this._cacheFilename = `.cache_${itemNametoQuery}.json`;
    this._aggregator = aggregator;
    this._useCache = useCache;
    this._clearCache = clearCache;
  }

  static async clearCache(cacheFilename: string): Promise<void> {
    await fs.unlink(cacheFilename)
      .catch((err) => {
        // in case the file doesn't exist
        if (err.errno === -2) return;
        throw err;
      });
  }

  static async tryGetCachedItems(cacheFilename: string): Promise<GeekbenchRowItemJSON[]> {
    try {
      const fileStr = await fs.readFile(cacheFilename);
      return JSON.parse(fileStr.toString());
    } catch(err) {
      if (err.errno === -2) return;
      throw err;
    }
  }

  static async saveItemsToCache(cacheFilename: string, items: GeekbenchRowItemJSON[]): Promise<void> {
    await fs.writeFile(cacheFilename, JSON.stringify(items));
  }

  async processPage(page: puppeteer.Page): Promise<GeekbenchRowItemJSON[]> {
    const res: GeekbenchRowItemJSON[] = await page.evaluate((listItemSelector) => {
      const listItems = [...document.querySelectorAll(listItemSelector)];
      return listItems.map((listItem) => {
        const modelString = listItem.querySelector('.list-col-model').textContent.trim();
        const mhz = parseInt(modelString.split('\n')[1]);

        const platformHtmlElement = [...listItem.querySelectorAll('span.list-col-text')].pop();
        const platform = platformHtmlElement.textContent.trim();

        const [singleCoreScoreHtml, multiCoreScoreHtml] = [...listItem.querySelectorAll('span.list-col-text-score')];
        const singleCoreScore = parseInt(singleCoreScoreHtml.textContent);
        const multiCoreScore = parseInt(multiCoreScoreHtml.textContent);

        return {
          mhz,
          platform,
          singleCoreScore,
          multiCoreScore,
        };
      });
    }, '.row .list-col-inner .row');

    return res;
  }

  async processPages(nbOfPages: number, firstPage: puppeteer.Page) {
    // @TODO would be nice to move this outside or broke into more functions so it will make sense
    const pageNumArr: number[] = _.pull(1, _.times<number>((num: number): number => num + 1, nbOfPages));
    const pageUrlsToCrawl: string[] = pageNumArr.map((pageNumber: number): string => `${this._baseUrl}&page=${pageNumber}`);

    const firstPageRes: GeekbenchRowItemJSON[] = await this.processPage(firstPage);
    this._aggregator.addItems(firstPageRes);
    this._progress.tick();

    const urlChunks: string[][] = _.chunk(5, pageUrlsToCrawl);

    for (const chunk of urlChunks) {
      await Promise.all(chunk.map(async (url) => {
        const page: puppeteer.Page | undefined = await this.browser?.newPage();
        if (!page) return;

        await page.goto(url);
        const res: GeekbenchRowItemJSON[] = await this.processPage(page);
        await page.close();

        this._aggregator.addItems(res);
        this._progress.tick();
      }));
    }
  }

  async run() {
    if (this._clearCache) await Crawler.clearCache(this._cacheFilename);
    if (this._useCache) {
      const cachedItems = await Crawler.tryGetCachedItems(this._cacheFilename);
      if (cachedItems) {
        this._aggregator.addItems(cachedItems);
        return;
      }
    }


    this.browser = await puppeteer.launch({
      headless: true,
      args: [
          '--no-sandbox',
          '--disable-gpu',
      ],
    });

    const firstPage: puppeteer.Page = await this.browser.newPage();
    await firstPage.goto(this._baseUrl);

    const nbOfPages: number = await firstPage.evaluate((selector) => {
      const pageLiItems = Array.from(document.querySelectorAll(selector));
      return parseInt(pageLiItems[pageLiItems.length - 2].firstChild.textContent);
    }, '.pagination .page-item');

    this._progress = new ProgressBar(nbOfPages);
    await this.processPages(nbOfPages, firstPage);

    if (this._useCache) {
      await Crawler.saveItemsToCache(this._cacheFilename, this._aggregator.items);
    }
  }
}
