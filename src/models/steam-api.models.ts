import { Price } from './itad-api.models';
import { Sortable } from '../functions/Sortable';

export class SimpleSteamApp {
  public appId: number;
  public name: string;

  constructor(appid: number, name: string) {
    this.appId = appid;
    this.name = name;
  }

  public toString() {
    return `${this.appId} + lol + ${this.name}`;
  }
}

export class SteamGame {
  public type: string;
  public name: string;
  public steamAppId: number;
  public isFree: boolean;
  public headerImageUrl: string;
  public shortDescription: string;
  public priceOverview: PriceOverview;
  public metacritic: Metacritic;
  public prices?: Price[];

  constructor(
    type: string,
    name: string,
    steamAppId: number,
    isFree: boolean,
    headerImageUrl: string,
    shortDescription: string,
    priceOverview: PriceOverview,
    metacritic: Metacritic
  ) {
    this.type = type;
    this.name = name;
    this.steamAppId = steamAppId;
    this.isFree = isFree;
    this.headerImageUrl = headerImageUrl;
    this.shortDescription = shortDescription;
    this.priceOverview = priceOverview;
    this.metacritic = metacritic;
  }


  public cheapestPrice(): Price {
    if (!this.prices) {
      throw new Error('prices is null');
    }
    return new Sortable(this.prices).sortByField('priceNew')[0];
  }
}

export class PriceOverview {
  public initialPrice: number;
  public currency: string;
  public finalPrice: number;
  public discountPercent: number;

  constructor(initialPrice: number, currency: string, finalPrice: number, discountPercent: number) {
    this.initialPrice = initialPrice;
    this.currency = currency;
    this.finalPrice = finalPrice;
    this.discountPercent = discountPercent;
  }
}

export class Metacritic {
  public score: number;

  constructor(score: number) {
    this.score = score;
  }
}
