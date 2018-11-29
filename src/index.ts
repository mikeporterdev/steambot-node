import app from './App';
import { SteamApi } from './api/steam-api';
import { CacheableObservable } from './models/cacheable-observable';
import * as Fuse from 'fuse.js';
import { RxHR } from '@akanass/rx-http-request';
import { SteamGame } from './models/steam-api.models';
import { map } from 'rxjs/operators';
import { Plain, PlainRequest, Price, Shop } from './models/itad-api.models';
import { ItadApi } from './api/itad-api';

const port = process.env.PORT || 3000;
const steamKey = process.env.STEAM_API_KEY;
const itadKey = process.env.ITAD_API_KEY;

const steamApi = new SteamApi(steamKey);
const itadApi = new ItadApi(itadKey);

const appListCache = new CacheableObservable(steamApi.getAppList());

appListCache.runObs().subscribe(
  apps => {
    const fuse = new Fuse(apps, {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['name'],
    });

    const steamApps = fuse.search('ark survival evolved');
    const steamApp = steamApps[0];
    steamApi.getFullSteamDetails(steamApp).subscribe((fullApp: SteamGame) => {
      itadApi.getPricingInfoForAppId(fullApp.steamAppId).subscribe(prices => {
        fullApp.prices = prices;
        console.log(fullApp.cheapestPrice());
      });
    });
  },
  err => {
    console.error('ERR', err);
  }
);

app.listen(port, (err: Error) => {
  if (err) {
    return console.log(err);
  }

  return console.log(`server is listening on ${port}`);
});
