import { SteamApi } from '../api/steam-api';
import { ItadApi } from '../api/itad-api';
import { CacheableObservable } from '../functions/cacheable-observable';
import * as Fuse from 'fuse.js';
import { SimpleSteamApp, SteamGame } from '../models/steam-api.models';
import { Observable, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Sortable } from '../functions/sortable';
import { RichEmbed } from 'discord.js';

export class Bot {
  private steamApi: SteamApi;
  private itadApi: ItadApi;
  private appListCache: CacheableObservable<SimpleSteamApp[]>;

  private filteredIds: number[] = [];

  constructor(steamKey: string, itadKey: string) {
    this.steamApi = new SteamApi(steamKey);
    this.itadApi = new ItadApi(itadKey);
    this.appListCache = new CacheableObservable(this.steamApi.getAppList());
  }

  public getGame(name: string): Observable<SteamGame> {
    return this.appListCache.runObs().pipe(
      mergeMap(apps => {
        const wordsToFilter = ['Trailer', 'DLC', 'Teaser'];

        apps = apps.filter(i => !wordsToFilter.some(word => i.name.toLowerCase().includes(word.toLowerCase())));

        const fuse = new Fuse(apps, {
          shouldSort: true,
          threshold: 0.6,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ['name'],
          includeScore: true,
        });

        // cast fuse results because their typings don't include the obj structure change when includeScore is set to true
        // @ts-ignore
        const sortedByClosest = fuse.search(name) as Array<FuseResult<SimpleSteamApp>>;
        const closestMatching = sortedByClosest.filter(app => app.score === sortedByClosest[0].score);

        const closestMatchingWithoutPreviouslyFailedIds = closestMatching.filter(
          i => !this.filteredIds.some(j => j === i.item.appId)
        );

        if (closestMatchingWithoutPreviouslyFailedIds.length === 0) {
          return throwError(new Error('Cannot find any results for this game'));
        }

        const closestMatchingLowestId = new Sortable(
          closestMatchingWithoutPreviouslyFailedIds.map(i => i.item)
        ).sortByField('appId');

        return this.getFullDetails(closestMatchingLowestId[0]).pipe(
          catchError(() => {
            this.filteredIds.push(closestMatchingLowestId[0].appId);
            return this.getGame(name);
          })
        );
      })
    );
  }

  public getFullDetails(itemToSearch: SimpleSteamApp) {
    return this.steamApi.getFullSteamDetails(itemToSearch).pipe(
      mergeMap((fullApp: SteamGame) => {
        return this.itadApi.getPricingInfoForAppId(fullApp.steamAppId).pipe(
          map(prices => {
            fullApp.prices = prices;
            return fullApp;
          })
        );
      })
    );
  }

  public buildRichEmbed(steamGame: SteamGame): RichEmbed {
    const richEmbed = new RichEmbed();
    richEmbed.setTitle(`${steamGame.name}`);
    richEmbed.setURL(`https://store.steampowered.com/app/${steamGame.steamAppId}`);
    richEmbed.setThumbnail(steamGame.headerImageUrl);
    richEmbed.setDescription(steamGame.shortDescription);
    richEmbed.setAuthor('SteamBot');
    if (steamGame.isFree) {
      richEmbed.addField('Price', `[Free!](https://store.steampowered.com/app/${steamGame.steamAppId})`, true);
    } else {
      const cheapest = steamGame.cheapestPrice();
      if (cheapest) {
        richEmbed.addField(
          'Cheapest Price',
          `£${cheapest.priceNew.toFixed(2)} ([${cheapest.shop.name}](${cheapest.url}))`,
          true
        );
      }
    }
    if (steamGame.metacritic) {
      richEmbed.addField('Metacritic', `${steamGame.metacritic.score}%`, true);
    }
    richEmbed.addField(`Release Date`, steamGame.releaseDate, true);

    return richEmbed;
  }
}

class FuseResult<T> {
  public item: T;
  public score: number;

  constructor(item: T, score: number) {
    this.item = item;
    this.score = score;
  }
}
