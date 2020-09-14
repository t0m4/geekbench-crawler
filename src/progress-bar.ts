'use strict';
import progress from 'progress';
import chalk from 'chalk';

export default class ProgressBar {
  private _bar;

  constructor(total: number) {
    this._bar = new progress(
      `Scraping ${chalk.cyan('Geekbench')} [:bar] :current/:total (:percent) ETA: :etas`,
      {
        total,
        complete: chalk.greenBright('\u2588'),
        incomplete: chalk.yellowBright('\u2591'),
        clear: true,
      }
    );
  }

  tick(): void {
    this._bar.tick();
  }
}
