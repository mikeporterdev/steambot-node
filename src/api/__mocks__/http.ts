import { of } from 'rxjs';

// noinspection JSUnusedGlobalSymbols
export class Http {
  // noinspection JSUnusedGlobalSymbols
  public get(url: string) {
    return of({body: this.determineMock(url)})
  }

  public determineMock(url: string) {
    if (url === 'https://api.isthereanydeal.com/v02/game/plain/?key=NO KEY&shop=steam&game_id=app%2F275850') {
      return this.mockItadPlainCall();
    } else if (url === 'https://api.steampowered.com/ISteamApps/GetAppList/v2') {
      return this.mockAppListCall();
    } else if (url === 'https://store.steampowered.com/api/appdetails?key=NO KEY&appids=275850') {
      return this.mockStoreCall();
    } else {
      return this.mockItadPricesCall();
    }
  }

  private mockAppListCall() {
    // This one we're not going to mock a real response example because the request is huuuge.
    return { applist: { apps: [{ appid: 275850, name: "No Man's Sky" }] }};
  }

  private mockStoreCall() {
    return {
      '275850': {
        success: true,
        data: {
          type: 'game',
          name: "No Man's Sky",
          steam_appid: 275850,
          required_age: 0,
          is_free: false,
          controller_support: 'full',
          short_description:
            "No Man's Sky is a game about exploration and survival in an infinite procedurally generated universe.",
          header_image: 'https://steamcdn-a.akamaihd.net/steam/apps/275850/header.jpg?t=1542978561',
          website: 'http://www.no-mans-sky.com',
          price_overview: {
            currency: 'GBP',
            initial: 3999,
            final: 3999,
            discount_percent: 0,
            initial_formatted: '',
            final_formatted: '\u00a339.99',
          },
          platforms: { windows: true, mac: false, linux: false },
          metacritic: { score: 61, url: 'https://www.metacritic.com/game/pc/no-mans-sky?ftag=MCD-06-10aaa1f' },
          release_date: { coming_soon: false, date: '12 Aug, 2016' },
          support_info: { url: 'http://www.no-mans-sky.com', email: 'support@hellogames.co.uk' },
          background: 'https://steamcdn-a.akamaihd.net/steam/apps/275850/page_bg_generated_v6b.jpg?t=1542978561',
          content_descriptors: { ids: [], notes: null },
        },
      },
    };
  }

  private mockItadPlainCall() {
    return { '.meta': { match: 'id', active: true }, data: { plain: 'nomanssky' } };
  }

  private mockItadPricesCall() {
    return {
      '.meta': { currency: 'GBP' },
      data: {
        nomanssky: {
          list: [
            {
              price_new: 39.99,
              price_old: 39.99,
              price_cut: 0,
              url: 'http://www.gog.com/game/no_mans_sky?pp=a93c168323147d1135503939396cac628dc194c5',
              shop: { id: 'gog', name: 'GOG' },
              drm: ['DRM Free'],
            },
            {
              price_new: 39.99,
              price_old: 39.99,
              price_cut: 0,
              url: 'https://store.steampowered.com/app/275850/',
              shop: { id: 'steam', name: 'Steam' },
              drm: ['steam'],
            },
          ],
          urls: { game: 'https://isthereanydeal.com/#/page:game/info?plain=nomanssky' },
        },
      },
    };
  }
}
