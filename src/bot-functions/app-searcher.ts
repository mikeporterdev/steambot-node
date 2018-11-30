import * as Fuse from 'fuse.js';
import { throwError } from 'rxjs';
import { SimpleSteamApp } from '../models/steam-api.models';
import { Sortable } from '../functions/sortable';

export class AppSearcher {
  public method(apps: SimpleSteamApp[], name: string, filteredIds: number[]) {
    const fuse = this.getFuzzySearcher(apps, name);

    name = this.strip(name);
    if (name.length === 0) {
      return throwError(new Error('Input is blankspace'));
    }

    // cast fuse results because their typings don't include the obj structure change when includeScore is set to true
    // @ts-ignore
    const sortedByClosest = fuse.search(name) as Array<{ item: SimpleSteamApp; score: number }>;
    const sortByField = new Sortable(sortedByClosest).sortByField('score');
    const closestMatching = sortByField.filter(app => app.score < 0.4);
    const closestMatchingWithoutPreviouslyFailedIds = closestMatching.filter(
      i => !filteredIds.some(j => j === i.item.appId)
    );

    if (closestMatchingWithoutPreviouslyFailedIds.length === 0) {
      return throwError(new Error('Cannot find any results for this game'));
    }

    return closestMatchingWithoutPreviouslyFailedIds.map(i => i.item);
  }

  private getFuzzySearcher(apps: SimpleSteamApp[], name: string) {
    const wordsToFilter = ['Trailer', 'DLC', 'Teaser', 'Demo'];

    apps = apps
      .filter(
        i =>
          !wordsToFilter.some(
            word =>
              i.name.toLowerCase().includes(word.toLowerCase()) && !name.toLowerCase().includes(word.toLowerCase()),
          ),
      )
      .map(i => {
        i.name = this.strip(i.name);
        return i;
      });

    return new Fuse(apps, {
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
