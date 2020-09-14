'use strict';
import Table from 'cli-table3';
import { PerPlatformItems, GeneralMetricItems } from './types';

function createGenericMetricTable(platform: string, item: GeneralMetricItems) {
  const table = new Table({
    head: [platform, 'MHz', 'SingleCore', 'MultiCore']
  });

  table.push(
    { 'Min': [item.mhz.min, item.singleCore.min, item.multiCore.min] },
    { 'Max': [item.mhz.max, item.singleCore.max, item.multiCore.max] },
    { 'Mean': [item.mhz.mean, item.singleCore.mean, item.multiCore.mean] },
  );

  return table.toString();
}

export default function displayResult(data: PerPlatformItems) {
  const entries = Object.entries(data);
  for (const [platform, platformData] of entries) {
    console.log(createGenericMetricTable(platform, platformData.generalMetrics));
  }
}
