import { Bot } from './bot';

jest.mock('../api/http');

describe('Outer', () => {
  let bot: Bot;

  beforeEach(() => {
    bot = new Bot('NO KEY', 'NO KEY');
  });

  describe('ItadAPI', () => {
    it('should mock basic call', async () => {
      const test = await bot.getGame('no mans sky').toPromise();

      expect(test).not.toBeNull();
    });

    it('should error if error happens at some point', async () => {

      const test = await bot.getGame('no mans sky').toPromise();

      expect(test).not.toBeNull();
    });
  });
});
