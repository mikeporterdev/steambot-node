import { SteamApi } from '../api/steam-api';
import { Http } from '../api/http';
import { instance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';
import { Bot } from './bot';
import { ItadApi } from '../api/itad-api';

describe('BotFullTest', () => {
  let bot: Bot;
  let httpMock: Http;

  beforeEach(() => {
    httpMock = mock(Http);
    const http = instance(httpMock);
    const steam = new SteamApi(http);
    const itad = new ItadApi('no-key', http);
    bot = new Bot(steam, itad);

    when(
      httpMock.get(
        'https://store.steampowered.com/search/suggest?term=the%20witcher&f=games&cc=GB&l=english&excluded_content_descriptors%5B%5D=3&excluded_content_descriptors%5B%5D=4&v=5488179',
        false
      )
    ).thenReturn(of({ body: html }));

    when(httpMock.get('https://store.steampowered.com/api/appdetails?appids=292030')).thenReturn(of(witcherResponse));

    when(
      httpMock.get(`https://api.isthereanydeal.com/v02/game/plain/?key=no-key&shop=steam&game_id=app%2F292030`)
    ).thenReturn(of({ body: { data: { plain: 'witcheriiiwildhunt' } } }));

    when(
      httpMock.get(
        'https://api.isthereanydeal.com/v01/game/prices/?key=no-key&plains=witcheriiiwildhunt&region=uk&country=GB'
      )
    ).thenReturn(of(itadResponse));
  });

  it('should uri encode search string and return parsed game', async () => {
    const game = await bot.getGame('the witcher').toPromise();
    expect(game.name).toBe('The Witcher® 3: Wild Hunt');
    expect(game.prices!.length).toBe(2);
    expect(game.prices![0].priceNew).toBe(30);
  });

  it('should return error if no games found', async () => {
    when(
      httpMock.get(
        'https://store.steampowered.com/search/suggest?term=badgamestring&f=games&cc=GB&l=english&excluded_content_descriptors%5B%5D=3&excluded_content_descriptors%5B%5D=4&v=5488179', false
      )
    ).thenReturn(of({body: '<body></body>'}));

    let message: string = "";

    try {
      await bot.getGame('badgamestring').toPromise()
    } catch (e) {
      message = e.message;
    }

    expect(message).toBe('No games found!');
  });

  const html =
    '<body style="">' +
    '<a class="match ds_collapse_flag " data-ds-appid="292030" data-ds-tagids="[1695,122,1742,4166,5611,1684,21]" data-ds-descids="[1,5]" data-ds-crtrids="[32989758]" href="https://store.steampowered.com/app/292030/The_Witcher_3_Wild_Hunt/?snr=1_7_15__13">' +
    '<div class="match_name">The Witcher® 3: Wild Hunt</div>' +
    '<div class="match_img"><img src="https://steamcdn-a.akamaihd.net/steam/apps/292030/capsule_sm_120.jpg?t=1541672778"></div>' +
    '<div class="match_price">£24.99</div>' +
    '</a>' +
    '<a class="match ds_collapse_flag " data-ds-appid="973760" data-ds-tagids="[21,122,1666,1742,7208,4182,5851]" data-ds-crtrids="[32989758]" href="https://store.steampowered.com/app/973760/Thronebreaker_The_Witcher_Tales/?snr=1_7_15__13">' +
    '<div class="match_name">Thronebreaker: The Witcher Tales</div>' +
    '<div class="match_img"><img src="https://steamcdn-a.akamaihd.net/steam/apps/973760/capsule_sm_120.jpg?t=1541940371"></div>' +
    '<div class="match_price">£23.39</div>' +
    '</a>' +
    '</body>';

  const witcherResponse = {
    body: {
      '292030': {
        success: true,
        data: {
          type: 'game',
          name: 'The Witcher\u00ae 3: Wild Hunt',
          steam_appid: 292030,
          required_age: 0,
          is_free: false,
          controller_support: 'full',
          about_the_game:
            'The Witcher: Wild Hunt is a story-driven, next-generation open world role-playing game set in a visually stunning fantasy universe full of meaningful choices and impactful consequences. In The Witcher you play as the professional monster hunter, Geralt of Rivia, tasked with finding a child of prophecy in a vast open world rich with merchant cities, viking pirate islands, dangerous mountain passes, and forgotten caverns to explore.<br><br><strong>PLAY AS A HIGHLY TRAINED MONSTER SLAYER FOR HIRE</strong><br>Trained from early childhood and mutated to gain superhuman skills, strength and reflexes, witchers are a distrusted counterbalance to the monster-infested world in which they live.<br><ul class="bb_ul"><li>Gruesomely destroy foes as a professional monster hunter armed with a range of upgradeable weapons, mutating potions and combat magic.<br></li><li>Hunt down a wide range of exotic monsters from savage beasts prowling the mountain passes to cunning supernatural predators lurking in the shadows of densely populated towns.<br></li><li>Invest your rewards to upgrade your weaponry and buy custom armour, or spend them away in horse races, card games, fist fighting, and other pleasures the night brings.</li></ul><br><strong>EXPLORE A MORALLY INDIFFERENT FANTASY OPEN WORLD</strong><br>Built for endless adventure, the massive open world of The\u00a0 Witcher sets new standards in terms of size, depth and complexity.<br><ul class="bb_ul"><li>Traverse a fantastical open world: explore forgotten ruins, caves and shipwrecks, trade with merchants and dwarven smiths in cities, and hunt across the open plains, mountains and seas.<br></li><li>Deal with treasonous generals, devious witches and corrupt royalty to provide dark and dangerous services.<br></li><li>Make choices that go beyond good &amp; evil, and face their far-reaching consequences.</li></ul><br><strong>CHASE DOWN THE CHILD OF PROPHECY</strong><br>Take on the most important contract to track down the child of prophecy, a key to save or destroy this world.<br><ul class="bb_ul"><li>In times of war, chase down the child of prophecy, a living weapon of power, foretold by ancient elven legends.<br></li><li>Struggle against ferocious rulers, spirits of the wilds and even a threat from beyond the veil \u2013 all hell-bent on controlling this world.<br></li><li>Define your destiny in a world that may not be worth saving.</li></ul><br><strong>FULLY REALIZED NEXT GENERATION</strong><br><ul class="bb_ul"><li>Built exclusively for next generation hardware, the REDengine\u00a03 renders the world of The Witcher visually nuanced and organic, a real true to life fantasy.<br></li><li>Dynamic weather systems and day/night cycles affect how the citizens of the towns and the monsters of the wilds behave.<br></li><li>Rich with storyline choices in both main and subplots, this grand open world is influenced by the player unlike ever before.</li></ul>',
          short_description:
            'Experience the epic conclusion to the story of professional monster slayer, witcher Geralt of Rivia. As war rages on throughout the Northern Realms, you take on the greatest contract of your life \u2014 tracking down the Child of Prophecy, a living weapon that can alter the shape of the world.',
          supported_languages:
            'English<strong>*</strong>, French<strong>*</strong>, Italian, German<strong>*</strong>, Spanish - Spain, Arabic, Czech, Hungarian, Japanese<strong>*</strong>, Korean, Polish<strong>*</strong>, Portuguese - Brazil<strong>*</strong>, Russian<strong>*</strong>, Traditional Chinese, Turkish, Simplified Chinese<br><strong>*</strong>languages with full audio support',
          header_image: 'https://steamcdn-a.akamaihd.net/steam/apps/292030/header.jpg?t=1541672778',
          website: 'http://www.thewitcher.com',
          mac_requirements: [],
          linux_requirements: [],
          developers: ['CD PROJEKT RED'],
          publishers: ['CD PROJEKT RED'],
          price_overview: {
            currency: 'GBP',
            initial: 2499,
            final: 2499,
            discount_percent: 0,
            initial_formatted: '',
            final_formatted: '\u00a324.99',
          },
          packages: [68476, 303242, 124923],
          platforms: { windows: true, mac: false, linux: false },
          metacritic: {
            score: 93,
            url: 'https://www.metacritic.com/game/pc/the-witcher-3-wild-hunt?ftag=MCD-06-10aaa1f',
          },
          genres: [{ id: '3', description: 'RPG' }],
          recommendations: { total: 174799 },
          release_date: { coming_soon: false, date: '18 May, 2015' },
          background: 'https://steamcdn-a.akamaihd.net/steam/apps/292030/page_bg_generated_v6b.jpg?t=1541672778',
          content_descriptors: { ids: [1, 5], notes: null },
        },
      },
    },
  };

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
