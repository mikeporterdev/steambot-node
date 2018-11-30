import { Price } from './itad-api.models';
import { Sortable } from '../functions/sortable';

export class SimpleSteamApp {
  public appId: number;
  public name: string;

  constructor(appId: number, name: string) {
    this.appId = appId;
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
  public releaseDate?: string;
  public metacritic?: Metacritic;
  public prices?: Price[];

  constructor(
    type: string,
    name: string,
    steamAppId: number,
    isFree: boolean,
    headerImageUrl: string,
    shortDescription: string,
    releaseDate?: string,
    metacritic?: Metacritic
  ) {
    this.type = type;
    this.name = name;
    this.steamAppId = steamAppId;
    this.isFree = isFree;
    this.headerImageUrl = headerImageUrl;
    this.shortDescription = shortDescription;
    this.releaseDate = releaseDate;
    this.metacritic = metacritic;
  }

  public cheapestPrice(): Price {
    if (!this.prices) {
      throw new Error('prices is null');
    }
    const sortedPrices = new Sortable(this.prices).sortByField('priceNew');

    const cheapestPrices = sortedPrices.filter(i => sortedPrices[0].priceNew === i.priceNew);

    const steamShopInPriceList = cheapestPrices.find(i => i.shop.id === 'steam');
    return steamShopInPriceList ? steamShopInPriceList : cheapestPrices[0];
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
