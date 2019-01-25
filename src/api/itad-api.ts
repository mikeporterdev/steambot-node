import { Plain, Price, Shop } from '../models/itad-api.models';
import { Http } from './http';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

export class ItadApi {
  private readonly apiKey: string;
  private readonly _http: Http;

  constructor(apiKey: string, http: Http) {
    this.apiKey = apiKey;
    this._http = http;
  }

  public getPricingInfoForAppId(appId: number): Observable<Price[]> {
    return this.getPlain(appId).pipe(mergeMap(res => this.getPricingInfoForPlain(res)));
  }

  private getPlain(appId: number): Observable<Plain> {
    const uri = `https://api.isthereanydeal.com/v02/game/plain/?key=${this.apiKey}&shop=steam&game_id=app%2F${appId}`;
    return this._http.get(uri).pipe(map((i: any) => new Plain(i.body.data.plain)));
  }

  private getPricingInfoForPlain(plain: Plain): Observable<Price[]> {
    const uri = `https://api.isthereanydeal.com/v01/game/prices/?key=${this.apiKey}&plains=${
      plain.plain
    }&region=uk&country=GB`;
    return this._http.get(uri).pipe(
      map((res: any) => res.body.data[plain.plain].list),
      map((prices: any[]) =>
        prices.map(
          (i: any) => new Price(i.price_new, i.url, new Shop(i.shop.id, i.shop.name))
        )
      )
    );
  }

}
