import * as Fuse from 'fuse.js';
import { SimpleSteamApp } from '../models/steam-api.models';
import { Sortable } from '../functions/sortable';

export class AppSearcher {
  public searchApps(apps: SimpleSteamApp[], name: string, filteredIds: number[]): SimpleSteamApp[] {
    const fuse = this.getFuzzySearcher(apps, name);

    name = this.strip(name);
    if (name.length === 0) {
      throw new Error('Input is blankspace');
    }

    // cast fuse results because their typings don't include the obj structure change when includeScore is set to true
    // @ts-ignore
    const sortedByClosest = fuse.search(name) as Array<{ item: SimpleSteamApp; score: number }>;
    console.log(sortedByClosest)
    const sortByField = new Sortable(sortedByClosest).sortByField('score');
    const closestMatching = sortByField.filter(app => app.score < 0.4);

    const closestMatchingWithoutPreviouslyFailedIds = closestMatching.filter(
      i => !filteredIds.some(j => j === i.item.appId)
    );

    console.log(closestMatchingWithoutPreviouslyFailedIds.length)

    if (closestMatchingWithoutPreviouslyFailedIds.length === 0) {
      throw new Error('Cannot find any results for this game');
    }

    return closestMatchingWithoutPreviouslyFailedIds.map(i => i.item);
  }

  private getFuzzySearcher(apps: SimpleSteamApp[], name: string) {
    const wordsToFilter = ['Trailer', 'DLC', 'Teaser', 'Demo'];

    const clonedArray: SimpleSteamApp[] = JSON.parse(JSON.stringify(apps));
    const searchList = clonedArray
      .filter(
        i =>
          !wordsToFilter.some(
            word =>
              i.name.toLowerCase().includes(word.toLowerCase()) && !name.toLowerCase().includes(word.toLowerCase())
          )
      );

    return new Fuse(searchList, {
      shouldSort: true,
      threshold: 0.4,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['name'],
      includeScore: true,
    });
  }

  private strip(str: string) {
    return str.replace(/[^0-9a-z ]/gi, '');
  }
}
