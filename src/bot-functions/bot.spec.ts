import { Bot } from './bot';

jest.mock('../api/http');

describe('Outer', () => {
  let bot: Bot;

  beforeEach(() => {
    bot = new Bot('NO KEY', 'NO KEY');
  });

  describe('ItadAPI', () => {
  });
});
