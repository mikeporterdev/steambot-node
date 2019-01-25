import { NoGamesFoundError, SteamApi } from '../api/steam-api';
import { ItadApi } from '../api/itad-api';
import { SimpleSteamApp, SteamGame } from '../models/steam-api.models';
import { Price } from '../models/itad-api.models';
import { Sortable } from '../functions/sortable';
import { RichEmbed } from 'discord.js';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export class Bot {
  private steamApi: SteamApi;
  private itadApi: ItadApi;

  constructor(steamApi: SteamApi, itadApi: ItadApi) {
    this.steamApi = steamApi;
    this.itadApi = itadApi;
  }

  public buildResponse(searchString: string): Observable<RichEmbed | string> {
    return this.getGame(searchString)
      .pipe(
        map((i: SteamGame) => this.buildRichEmbed(i)),
        catchError((err: Error) => {
          switch(err.constructor) {
            case NoGamesFoundError:
              return of(`No games found for ${searchString}`);
            default:
              console.log(err);
              return of(`Whoops, error occurred searching for ${searchString}`);
          }
        }),
      );
  }

  public getGame(name: string): Observable<SteamGame> {
    return this.steamApi
      .search(name)
      .pipe(mergeMap((simpleSteamApp: SimpleSteamApp) => this.getFullDetails(simpleSteamApp)));
  }

  public getFullDetails(itemToSearch: SimpleSteamApp) {
    return this.steamApi.getFullSteamDetails(itemToSearch).pipe(
      mergeMap((fullApp: SteamGame) => {
        return this.itadApi.getPricingInfoForAppId(fullApp.steamAppId).pipe(
          map((prices: Price[]) => {
            fullApp.prices = prices;
            return fullApp;
          }),
        );
      }),
    );
  }

  public buildRichEmbed(steamGame: SteamGame): RichEmbed {
    const richEmbed = new RichEmbed();
    richEmbed.setTitle(steamGame.name);
    richEmbed.setURL(`https://store.steampowered.com/app/${steamGame.steamAppId}`);
    richEmbed.setThumbnail(steamGame.headerImageUrl);
    richEmbed.setDescription(steamGame.shortDescription);
    richEmbed.setAuthor('SteamBot');
    this.buildMessageField(steamGame, richEmbed);
    if (steamGame.metacritic) {
      richEmbed.addField('Metacritic', `${steamGame.metacritic.score}%`, true);
    }
    if (steamGame.releaseDate) {
      richEmbed.addField(`Release Date`, steamGame.releaseDate, true);
    }

    return richEmbed;
  }

  private buildMessageField(steamGame: SteamGame, richEmbed: RichEmbed) {
    if (steamGame.isFree) {
      richEmbed.addField('Price', `[Free!](https://store.steampowered.com/app/${steamGame.steamAppId})`, true);
    } else {
      if (steamGame.prices && steamGame.prices.length > 0) {
        const message = this.getPriceString(steamGame.prices);
        richEmbed.addField('Cheapest Price', message, true);
      }
    }
  }

  private getPriceString(prices: Price[]): string {
    const cheapest = this.cheapestPrice(prices);
    let message: string = this.formatPrice(cheapest);

    if (cheapest.shop.id !== 'steam') {
      const steam = prices.find(i => i.shop.id === 'steam');

      if (steam) {
        const pct = (((steam.priceNew - cheapest.priceNew) / steam.priceNew) * 100).toFixed(0);
        message += ` - ${pct}% Cheaper!\n`;
        message += this.formatPrice(steam);
      }
    }
    return message;
  }

  private formatPrice(price: Price): string {
    return `£${price.priceNew.toFixed(2)} ([${price.shop.name}](${price.url}))`;
  }

  private cheapestPrice(prices: Price[]): Price {
    const sortedPrices = new Sortable(prices).sortByField('priceNew');
    const cheapestPrices = sortedPrices.filter(i => sortedPrices[0].priceNew === i.priceNew);
    const steamShopInPriceList = cheapestPrices.find(i => i.shop.id === 'steam');
    return steamShopInPriceList ? steamShopInPriceList : cheapestPrices[0];
  }
}
