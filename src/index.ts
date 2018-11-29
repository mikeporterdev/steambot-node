import app from './App';
import { Bot } from './bot-functions/bot';

const port = process.env.PORT || 3000;
const steamKey = process.env.STEAM_API_KEY || '';
const itadKey = process.env.ITAD_API_KEY || '';

const bot = new Bot(steamKey, itadKey);

bot.getGame('no mans sky').subscribe(res => {
  console.log(res);
});

app.listen(port, (err: Error) => {
  if (err) {
    return console.log(err);
  }

  return console.log(`server is listening on ${port}`);
});
