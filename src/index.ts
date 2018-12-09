import { Bot } from './bot-functions/bot';
import { Client } from 'discord.js';
import { readFileSync } from 'fs';
import { NoGamesFoundError, SteamApi } from './api/steam-api';
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

client.on('message', msg => {
  const command = 'steambot search ';
  if (msg.author.bot) {
    // Don't respond to other bots
    return;
  }
  const content = msg.content.trim();
  if (content.startsWith(command)) {
    const searchString = content.substring(command.length);

    bot.getGame(searchString).subscribe(
      res => {
        try {
          const richEmbed = bot.buildRichEmbed(res);
          msg.reply(richEmbed);
        } catch (e) {
          console.log(e);
          msg.reply(`Whoops, error occurred searching for ${searchString}`);
        }
      },
      (err: Error) => {
        switch(err.constructor) {
          case NoGamesFoundError:
            msg.reply(`No games found for ${content}`);
            break;
          default:
            console.log(err);
            msg.reply(`Whoops, error occurred searching for ${searchString}`);
        }
      }
    );
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


client.login(discordKey);
