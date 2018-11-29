import { Observable } from 'rxjs';

import { RxHR } from '@akanass/rx-http-request';
import { Metacritic, PriceOverview, SimpleSteamApp, SteamGame } from '../models/steam-api.models';
import { map } from 'rxjs/operators';

export class SteamApi {
  private apiKey?: string;

  constructor(keyz?: string) {
    this.apiKey = keyz;
  }

  private readonly options = {
    json: true,
  };

  public getAppList(): Observable<SimpleSteamApp[]> {
    return this.unauthApiRequest('ISteamApps', 'GetAppList').pipe(
      map(res => res.body.applist),
      map(res => {
        return res.apps.map((app: any) => new SimpleSteamApp(app.appid, app.name));
      })
    );
  }

  private unauthApiRequest(interfce: string, method: string, version: number = 2): Observable<any> {
    const uri = `https://api.steampowered.com/${interfce}/${method}/v${version}`;
    console.info('Requesting: ' + uri);
    return RxHR.get(uri, this.options);
  }

  public getFullSteamDetails(game: SimpleSteamApp): Observable<SteamGame> {
    if (!this.apiKey) {
      throw new Error('No API Key set');
    }
    const uri = `https://store.steampowered.com/api/appdetails?key=${this.apiKey}&appids=${game.appId}`;
    console.log(`requesting ${uri}`);
    return RxHR.get(uri, this.options).pipe(
      map((app: any) => app.body[game.appId].data),
      map((app: any) => {
        const priceOverview = app.price_overview;
        return new SteamGame(
          app.type,
          app.name,
          app.steam_appid,
          app.is_free,
          app.header_image,
          app.short_description,
          new PriceOverview(
            priceOverview.initial,
            priceOverview.currency,
            priceOverview.finalz,
            priceOverview.discount_percent
          ),
          new Metacritic(app.metacritic.score)
        );
      })
    );
  }
}
