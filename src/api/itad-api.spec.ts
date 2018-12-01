import { ItadApi } from './itad-api';
import { Http } from './http';
import { instance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';

describe('ItadApi', () => {
  let itad: ItadApi;
  let http: Http;
  beforeEach(() => {
    http = mock(Http);

    itad = new ItadApi('no-key', instance(http));
  });

  it('should call prices with the plain result and parse correctly', async () => {
    when(
      http.get(`https://api.isthereanydeal.com/v02/game/plain/?key=no-key&shop=steam&game_id=app%2F1234`)
    ).thenReturn(of({ body: { data: { plain: 'witcheriiiwildhunt' } } }));


    when(
      http.get('https://api.isthereanydeal.com/v01/game/prices/?key=no-key&plains=witcheriiiwildhunt&region=uk&country=GB')
    ).thenReturn(
      of(itadResponse)
    );

    const promise = await itad.getPricingInfoForAppId(1234).toPromise();

    expect(promise[0].priceNew).toBe(30);
    expect(promise[1].priceNew).toBe(24.99);
  });

  const itadResponse = {
    body: {
      data: {
        witcheriiiwildhunt: {
          list: [
            {
              price_new: 30,
              price_old: 30,
              price_cut: 0,
              url: 'https://store.steampowered.com/app/292030/',
              shop: { id: 'steam', name: 'Steam' },
              drm: ['steam'],
            },
            {
              price_new: 24.99,
              price_old: 24.99,
              price_cut: 0,
              url: 'http://www.gog.com/game/the_witcher_3_wild_hunt?pp=a93c168323147d1135503939396cac628dc194c5',
              shop: { id: 'gog', name: 'GOG' },
              drm: ['DRM Free'],
            },
          ],
          urls: { game: 'https://isthereanydeal.com/#/page:game/info?plain=witcheriiiwildhunt' },
        },
      },
    },
  };
});
