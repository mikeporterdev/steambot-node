import { Price } from './itad-api.models';

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
}
export class Metacritic {
  public score: number;

  constructor(score: number) {
    this.score = score;
  }
}
