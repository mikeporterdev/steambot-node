import { Bot } from './bot-functions/bot';
import { Client } from 'discord.js';
import { readFileSync } from 'fs';

const secretsLocation = process.env.API_KEYS || 'secrets/';
const steamKey = readFileSync(secretsLocation + '/steam_key', 'utf8').trim();
const itadKey = readFileSync(secretsLocation + '/itad_key', 'utf8').trim();
const discordKey = readFileSync(secretsLocation + '/discord_key', 'utf8').trim();

const bot = new Bot(steamKey, itadKey);
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

    msg.reply(`Searching ${searchString}`);

    bot.newGetGame(searchString).subscribe(
      res => {
        const richEmbed = bot.buildRichEmbed(res);
        msg.reply(richEmbed);
      },
      err => {
        console.log(err);
        if (err === 'Cannot find any results for this game') {
          msg.reply(`No games found for ${content}`);
        } else {
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
