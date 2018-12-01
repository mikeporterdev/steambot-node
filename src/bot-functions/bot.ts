import { SteamApi } from '../api/steam-api';
import { ItadApi } from '../api/itad-api';
import { SimpleSteamApp, SteamGame } from '../models/steam-api.models';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { RichEmbed } from 'discord.js';
import { Price } from '../models/itad-api.models';
import { Sortable } from '../functions/sortable';

export class Bot {
  private steamApi: SteamApi;
  private itadApi: ItadApi;

  constructor(steamApi: SteamApi, itadApi: ItadApi) {
    this.steamApi = steamApi;
    this.itadApi = itadApi;
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
          map(prices => {
            fullApp.prices = prices;
            return fullApp;
          })
        );
      })
    );
  }

  public buildRichEmbed(steamGame: SteamGame): RichEmbed {
    const richEmbed = new RichEmbed();
    richEmbed.setTitle(`${steamGame.name}`);
    richEmbed.setURL(`https://store.steampowered.com/app/${steamGame.steamAppId}`);
    richEmbed.setThumbnail(steamGame.headerImageUrl);
    richEmbed.setDescription(steamGame.shortDescription);
    richEmbed.setAuthor('SteamBot');
    if (steamGame.isFree) {
      richEmbed.addField('Price', `[Free!](https://store.steampowered.com/app/${steamGame.steamAppId})`, true);
    } else {
      if (steamGame.prices) {
        const message = this.getPriceString(steamGame.prices);
        richEmbed.addField('Cheapest Price', message, true);
      }
    }
    if (steamGame.metacritic) {
      richEmbed.addField('Metacritic', `${steamGame.metacritic.score}%`, true);
    }
    if (steamGame.releaseDate) {
      richEmbed.addField(`Release Date`, steamGame.releaseDate, true);
    }

    return richEmbed;
  }

  private getPriceString(prices: Price[]): string {
    let message: string = '';
    const cheapest = this.cheapestPrice(prices);
    if (cheapest.shop.id !== 'steam') {
      const steam = prices.find(i => i.shop.id === 'steam');
      message = `£${cheapest.priceNew.toFixed(2)} ([${cheapest.shop.name}](${cheapest.url}))`;

      if (steam) {
        const pct = (((steam.priceNew - cheapest.priceNew) / steam.priceNew) * 100).toFixed(0);
        message += ` - ${pct}% Cheaper!\n` + `£${steam.priceNew.toFixed(2)} ([${steam.shop.name}](${steam.url}))`;
      }
    } else {
      message = `£${cheapest.priceNew.toFixed(2)} ([${cheapest.shop.name}](${cheapest.url}))`;
    }
    return message;
  }

  private cheapestPrice(prices: Price[]): Price {
    const sortedPrices = new Sortable(prices).sortByField('priceNew');

    const cheapestPrices = sortedPrices.filter(i => sortedPrices[0].priceNew === i.priceNew);

    const steamShopInPriceList = cheapestPrices.find(i => i.shop.id === 'steam');
    return steamShopInPriceList ? steamShopInPriceList : cheapestPrices[0];
  }
}
