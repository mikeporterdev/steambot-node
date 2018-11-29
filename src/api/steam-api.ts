import { Observable } from 'rxjs';
import { Metacritic, PriceOverview, SimpleSteamApp, SteamGame } from '../models/steam-api.models';
import { map } from 'rxjs/operators';
import { Http } from './http';

export class SteamApi {
  private readonly apiKey?: string;
  private readonly _http: Http;

  constructor(keyz?: string) {
    this.apiKey = keyz;
    this._http = new Http();
  }

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
    return this._http.get(uri);
  }

  public getFullSteamDetails(game: SimpleSteamApp): Observable<SteamGame> {
    if (!this.apiKey) {
      throw new Error('No API Key set');
    }
    const uri = `https://store.steampowered.com/api/appdetails?key=${this.apiKey}&appids=${game.appId}`;
    return this._http.get(uri).pipe(
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
