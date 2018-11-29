import { RxHR } from '@akanass/rx-http-request';
import { map, mergeMap } from 'rxjs/operators';
import { Plain, Price, Shop } from '../models/itad-api.models';
import { Observable } from 'rxjs';

export class ItadApi {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  private readonly options = {
    json: true,
  };

  public getPricingInfoForAppId(appId: number): Observable<Price[]> {
    return this.getPlain(appId).pipe(
      mergeMap(res => this.getPricingInfoForPlain(res))
    )
  }

  private getPlain(appId: number): Observable<Plain> {
    const uri = `https://api.isthereanydeal.com/v02/game/plain/?key=${this.apiKey}&shop=steam&game_id=app%2F${appId}`;
    console.log(`Requesting ${uri}`);
    return RxHR.get(uri, { json: true })
      .pipe(map(i => new Plain(i.body.data.plain)));
  }

  private getPricingInfoForPlain(plain: Plain): Observable<Price[]> {
    const uri2 = `https://api.isthereanydeal.com/v01/game/prices/?key=${this.apiKey}&plains=${
      plain.plain
    }&region=uk&country=GB`;
    console.log(`Requesting ${uri2}`);
    return RxHR.get(uri2, { json: true }).pipe(
      map(res => res.body.data[plain.plain].list),
      map(prices => {
        const map1: Price[] = prices.map(
          (i: any) => new Price(i.price_new, i.price_old, i.price_cut, i.url, new Shop(i.shop.id, i.shop.name))
        );
        return map1;
      })
    );
  }
}
