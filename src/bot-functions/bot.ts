import { SteamApi } from '../api/steam-api';
import { ItadApi } from '../api/itad-api';
import { CacheableObservable } from '../functions/cacheable-observable';
import { SimpleSteamApp, SteamGame } from '../models/steam-api.models';
import { Observable, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { RichEmbed } from 'discord.js';
import { AppSearcher } from './app-searcher';

export class Bot {
  private steamApi: SteamApi;
  private itadApi: ItadApi;
  private appListCache: CacheableObservable<SimpleSteamApp[]>;

  private filteredIds: number[] = [];
  private appSearcher: AppSearcher;

  constructor(steamKey: string, itadKey: string) {
    this.steamApi = new SteamApi(steamKey);
    this.itadApi = new ItadApi(itadKey);
    this.appListCache = new CacheableObservable(this.steamApi.getAppList());
    this.appSearcher = new AppSearcher();
  }

  public getGame(name: string): Observable<SteamGame> {
    return this.appListCache.runObs().pipe(
      mergeMap(apps => {
        let closestMatchingLowestId: SimpleSteamApp[];
        try {
          closestMatchingLowestId = this.appSearcher.searchApps(apps, name, this.filteredIds);
        } catch (e) {
          return throwError(e);
        }

        return this.getFullDetails(closestMatchingLowestId[0]).pipe(
          catchError(e => {
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
      if (steamGame.prices) {
        const cheapest = steamGame.cheapestPrice();
        if (cheapest) {
          let message: string;
          if (cheapest.shop.id !== 'steam') {
            const steam = steamGame.prices.find(i => i.shop.id === 'steam');
            if (steam) {
              const pct = ((steam.priceNew - cheapest.priceNew) / steam.priceNew) * 100;

              message =
                `£${cheapest.priceNew.toFixed(2)} ([${cheapest.shop.name}](${cheapest.url})) - ${pct.toFixed(0)}% Cheaper!\n` +
                `£${steam.priceNew.toFixed(2)} ([${steam.shop.name}](${steam.url}))`;
            } else {
              message = `£${cheapest.priceNew.toFixed(2)} ([${cheapest.shop.name}](${cheapest.url}))`;
            }
          } else {
            message = `£${cheapest.priceNew.toFixed(2)} ([${cheapest.shop.name}](${cheapest.url}))`;
          }
          richEmbed.addField('Cheapest Price', message, true);
        }
      }
    }
    if (steamGame.metacritic) {
      richEmbed.addField('Metacritic', `${steamGame.metacritic.score}%`, true);
    }
    if (steamGame.releaseDate) {
      richEmbed.addField(`Release Date`, steamGame.releaseDate, true);
    }

    return richEmbed;
  }
}
