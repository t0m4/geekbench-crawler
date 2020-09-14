'use strict';
import commander from 'commander';

import Crawler from './crawler';
import Aggregator from './aggregator';
import displayResult from './display-result';

commander
  .version('0.0.0')
  .description('Crawl and visualize geekbench data')
  .option('-i, --item <item>', 'The item you are looking for', item => item)
  .option('--useCache', 'Cache the end result and use it if already there')
  .option('--clearCache', 'Cache the end result and use it if already there')
  .parse(process.argv);

const { item: itemToQuery, useCache, clearCache } = commander;

import fs from 'fs/promises';

async function run() {
  const aggregator = new Aggregator();
  const crawler = new Crawler(aggregator, itemToQuery, useCache, clearCache);

  await crawler.run();

  aggregator.aggregateData()

  await fs.writeFile('asd.json', JSON.stringify(aggregator.aggregatedData, null, 2))

  displayResult(aggregator.aggregatedData);

}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
