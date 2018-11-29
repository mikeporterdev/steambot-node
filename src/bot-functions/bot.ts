import { SteamApi } from '../api/steam-api';
import { ItadApi } from '../api/itad-api';
import { CacheableObservable } from '../functions/cacheable-observable';
import * as Fuse from 'fuse.js';
import { SimpleSteamApp, SteamGame } from '../models/steam-api.models';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

export class Bot {
  private steamApi: SteamApi;
  private itadApi: ItadApi;
  private appListCache: CacheableObservable<SimpleSteamApp[]>;
  constructor(steamKey: string, itadKey: string) {
    this.steamApi = new SteamApi(steamKey);
    this.itadApi = new ItadApi(itadKey);
    this.appListCache = new CacheableObservable(this.steamApi.getAppList());
  }

  public getGame(name: string): Observable<SteamGame> {
    return this.appListCache.runObs().pipe(
      mergeMap(apps => {
        const fuse = new Fuse(apps, {
          shouldSort: true,
          threshold: 0.6,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ['name'],
        });

        const steamApps = fuse.search(name);
        const steamApp = steamApps[0];
        return this.steamApi.getFullSteamDetails(steamApp).pipe(
          mergeMap((fullApp: SteamGame) => {
            return this.itadApi.getPricingInfoForAppId(fullApp.steamAppId).pipe(
              map(prices => {
                fullApp.prices = prices;
                return fullApp;
              })
            );
          })
        );
      })
    );
  }
}
