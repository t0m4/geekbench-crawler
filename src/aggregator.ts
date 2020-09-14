'use strict';
import _ from 'lodash/fp';
import { GeekbenchRowItemJSON, AggregetorInstance, PerPlatformItems, MeasureItem, PerMhzItems } from './types';

export default class Aggregator implements AggregetorInstance {
  private _items: GeekbenchRowItemJSON[] = [];
  private _aggregatedData: PerPlatformItems;

  constructor() {}

  static getMinMaxMean(prop: string, data: GeekbenchRowItemJSON[]): MeasureItem {
    return {
      min: _.minBy(prop, data)[prop],
      max: _.maxBy(prop, data)[prop],
      mean: _.meanBy(prop, data),
    };
  }

  addItems(newItems: GeekbenchRowItemJSON[]): void {
    this._items.push(...newItems);
  }

  aggregateData() {
    const groupedByPlatform = _.groupBy('platform', this._items);

    const entries = Object.entries(groupedByPlatform);

    const perPlatform: PerPlatformItems = entries.reduce((perPlatformAcc, [platform, platformData]) => {
      const perMhz = _.groupBy('mhz', platformData);
      const perMhzEntries = Object.entries(perMhz);

      const perMhzAggr: PerMhzItems = perMhzEntries.reduce((perMhzAcc, [mhz, mhzData]) => ({
        ...perMhzAcc,
        [mhz]: {
          singleCore: Aggregator.getMinMaxMean('singleCoreScore', mhzData),
          multiCore: Aggregator.getMinMaxMean('multiCoreScore', mhzData),
        },
      }), {} as PerMhzItems);

      return {
        ...perPlatformAcc,
        [platform]: {
          generalMetrics: {
            mhz: Aggregator.getMinMaxMean('mhz', platformData),
            singleCore: Aggregator.getMinMaxMean('singleCoreScore', platformData),
            multiCore: Aggregator.getMinMaxMean('multiCoreScore', platformData),
          },
          perMhz: perMhzAggr,
        },
      };
    }, {} as PerPlatformItems);

    // console.log('perPlatform', JSON.stringify(perPlatform, null, 2));

    this._aggregatedData = perPlatform;
  }

  get aggregatedData(): PerPlatformItems { return this._aggregatedData; }
  get items(): GeekbenchRowItemJSON[] { return this._items; }
}
