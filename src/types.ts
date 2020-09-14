'use strict';

export interface GeekbenchRowItemJSON {
  platform: string,
  mhz: number,
  singleCoreScore: number,
  multiCoreScore: number,
};

export interface AggregetorInstance {
  items: GeekbenchRowItemJSON[],
  addItems(items: GeekbenchRowItemJSON[]): void,
  aggregateData(): void,
}

export interface MeasureItem {
  min: number,
  max: number,
  mean: number,
}

export interface GeneralMetricItems {
  mhz: MeasureItem,
  singleCore: MeasureItem,
  multiCore: MeasureItem,
}

export interface PerMhzItems {
  [key: string]: {
    singleCore: MeasureItem,
    multiCore: MeasureItem,
  },
}

interface PerPlatformItem {
  generalMetrics: GeneralMetricItems,
  perMhz: PerMhzItems,
}

export interface PerPlatformItems {
  [key: string]: PerPlatformItem,
}
