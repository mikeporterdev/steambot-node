import { Bot } from './bot-functions/bot';
import { Client } from 'discord.js';
import { readFileSync } from 'fs';

const secretsLocation = process.env.API_KEYS || 'secrets/';
const itadKey = readFileSync(secretsLocation + '/itad_key', 'utf8').trim();
const discordKey = readFileSync(secretsLocation + '/discord_key', 'utf8').trim();

const bot = new Bot(itadKey);
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
        const richEmbed = bot.buildRichEmbed(res);
        msg.reply(richEmbed);
      },
      (err: Error) => {
        if (err.message === 'No games found!') {
          msg.reply(`No games found for ${content}`);
        } else {
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
