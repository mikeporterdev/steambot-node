import { Bot } from './bot-functions/bot';
import { Client, Message, RichEmbed } from 'discord.js';
import { readFileSync } from 'fs';
import { SteamApi } from './api/steam-api';
import { ItadApi } from './api/itad-api';
import { Http } from './api/http';

const secretsLocation = process.env.API_KEYS || 'secrets/';
const itadKey = readFileSync(secretsLocation + '/itad_key', 'utf8').trim();
const discordKey = readFileSync(secretsLocation + '/discord_key', 'utf8').trim();

const http = new Http();
const steamApi = new SteamApi(http);
const itadApi = new ItadApi(itadKey, http);
const bot = new Bot(steamApi, itadApi);
const client = new Client();

client.on('ready', () => {
  console.log(`logged in as ${client.user.tag}`);
});

client.on('message', (msg: Message) => {
  const command = 'steambot search ';
  if (msg.author.bot) {
    // Don't respond to other bots
    return;
  }
  const content = msg.content.trim();
  if (content.startsWith(command)) {
    let searchString = content.substring(command.length);

    const a = 1;
    if (true) {
      console.log('hi');
    }

    bot.buildResponse(searchString).subscribe((res: RichEmbed | string) => msg.reply(res));
  } else if (content.startsWith('steambot help')) {
    msg.reply(
      '```' +
        'steambot search <name> - Searches steam for a game and finds the lowest price available on IsThereAnyDeal.com\n' +
        'See my source code at: https://github.com/mikeporterdev/steambot-node' +
        '```'
    );
  } else if (content.startsWith('steambot')) {
    msg.reply('I don\'t recognize that, try "steambot help" for a list of commands');
  }
});

client.on('error', console.error);


client.login(discordKey);
