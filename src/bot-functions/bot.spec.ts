import { Metacritic, SimpleSteamApp, SteamGame } from '../models/steam-api.models';
import { Price, Shop } from '../models/itad-api.models';
import { Bot } from './bot';
import { SteamApi } from '../api/steam-api';
import { ItadApi } from '../api/itad-api';
import { instance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';

describe('Bot', () => {
  let bot: Bot;
  let steamGame: SteamGame;
  beforeEach(() => {
    const mockedItad: ItadApi = mock(ItadApi);
    const mockedSteam: SteamApi = mock(SteamApi);

    const simpleSteamApp: SimpleSteamApp = { appId: 12345, name: 'The Witcher 3' };
    steamGame = new SteamGame('game', 'The Witcher 3', 12345, false, 'header-image-url', 'Its a game', 'two days ago');
    when(mockedSteam.search('The Witcher 3')).thenReturn(of(simpleSteamApp));
    when(mockedSteam.getFullSteamDetails(simpleSteamApp)).thenReturn(of(steamGame));
    when(mockedItad.getPricingInfoForAppId(12345)).thenReturn(of([new Price(40, 'test-url', new Shop('gog', 'GOG'))]));


    bot = new Bot(instance(mockedSteam), instance(mockedItad));
  });

  describe('API', () => {
    it('should not fail mocks', async() => {
      const steamGame1 = await bot.getGame('The Witcher 3').toPromise();

      expect(steamGame1.steamAppId).toBe(12345);
      expect(steamGame1.prices![0].priceNew).toBe(40);
    });
  });


  describe('MessageBuilder', () => {
    it('should show free if free', () => {
      steamGame.isFree = true;
      const richEmbed = bot.buildRichEmbed(steamGame);

      const find = richEmbed.fields!.find(i => i.name === 'Price');

      expect(find!.value).toBe('[Free!](https://store.steampowered.com/app/12345)');
    });

    it('should show free if free even if prices from ITAD', () => {
      steamGame.isFree = true;
      steamGame.prices = [
        new Price(40, 'steam-url', new Shop('steam', 'Steam')),
        new Price(30, 'gog-url', new Shop('gog', 'GOG')),
      ];

      const richEmbed = bot.buildRichEmbed(steamGame);

      const find = richEmbed.fields!.find(i => i.name === 'Price');

      expect(find!.value).toBe('[Free!](https://store.steampowered.com/app/12345)');
    });

    it('should show metacritic score if possible', () => {
      steamGame.isFree = true;
      steamGame.metacritic = new Metacritic(50);

      const richEmbed = bot.buildRichEmbed(steamGame);

      const find = richEmbed.fields!.find(i => i.name === 'Metacritic');
      expect(find!.value).toBe('50%');
    });

    it('should hide metacritic if no release date', () => {
      steamGame.metacritic = undefined;

      const richEmbed = bot.buildRichEmbed(steamGame);

      const find = richEmbed.fields!.find(i => i.name === 'Metacritic');

      expect(find).toBe(undefined);
    });

    describe('prices message', () => {
      it("should show other stores as well as steam if they're cheaper", () => {
        steamGame.prices = [
          new Price(40, 'steam-url', new Shop('steam', 'Steam')),
          new Price(30, 'gog-url', new Shop('gog', 'GOG')),
        ];
        const richEmbed = bot.buildRichEmbed(steamGame);

        const find = richEmbed.fields!.find(i => i.name === 'Cheapest Price');

        expect(find!.value).toBe('£30.00 ([GOG](gog-url)) - 25% Cheaper!\n£40.00 ([Steam](steam-url))');
      });

      it('should show steam if its same price as others', () => {
        steamGame.prices = [
          new Price(40, 'steam-url', new Shop('steam', 'Steam')),
          new Price(40, 'gog-url', new Shop('gog', 'GOG')),
        ];
        const richEmbed = bot.buildRichEmbed(steamGame);

        const find = richEmbed.fields!.find(i => i.name === 'Cheapest Price');

        expect(find!.value).toBe('£40.00 ([Steam](steam-url))');
      });

      it('should show steam if its cheaper than others', () => {
        steamGame.prices = [
          new Price(30, 'steam-url', new Shop('steam', 'Steam')),
          new Price(40, 'gog-url', new Shop('gog', 'GOG')),
        ];
        const richEmbed = bot.buildRichEmbed(steamGame);

        const find = richEmbed.fields!.find(i => i.name === 'Cheapest Price');

        expect(find!.value).toBe('£30.00 ([Steam](steam-url))');
      });

      it('should show just the other shop if we didnt get a steam price for some reason', () => {
        steamGame.prices = [new Price(40, 'gog-url', new Shop('gog', 'GOG'))];
        const richEmbed = bot.buildRichEmbed(steamGame);

        const find = richEmbed.fields!.find(i => i.name === 'Cheapest Price');

        expect(find!.value).toBe('£40.00 ([GOG](gog-url))');
      });

      it('should not show price if none available', () => {
        steamGame.prices = [];
        const richEmbed = bot.buildRichEmbed(steamGame);
        expect(richEmbed.fields!.length).toBe(1);
        expect(richEmbed.fields!.map(i => i.name)).not.toContain('Price');
        expect(richEmbed.fields!.map(i => i.name)).not.toContain('Cheapest Price');
      });
    });
  });
});
