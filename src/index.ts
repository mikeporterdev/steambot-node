import { Bot } from './bot-functions/bot';
import { Client, RichEmbed } from 'discord.js';

const steamKey = process.env.STEAM_API_KEY || '';
const itadKey = process.env.ITAD_API_KEY || '';
const discordKey = process.env.DISCORD_API_KEY;

const bot = new Bot(steamKey, itadKey);
const client = new Client();

client.on('ready', () => {
  console.log(`logged in as ${client.user.tag}`);
});

client.on('message', msg => {
  const command = 'steambot search ';
  if (msg.content.startsWith(command)) {
    const searchString = msg.content.substring(command.length);

    msg.reply(`Searching ${searchString}`);

    bot.getGame(searchString).subscribe(
      res => {
        const richEmbed = new RichEmbed();
        richEmbed.setTitle(`${res.name}`);
        richEmbed.setURL(`https://store.steampowered.com/app/${res.steamAppId}`);
        richEmbed.setThumbnail(res.headerImageUrl);
        richEmbed.setDescription(res.shortDescription);
        richEmbed.setAuthor('SteamBot');
        if (res.isFree) {
          richEmbed.addField('Price', `[Free!](https://store.steampowered.com/app/${res.steamAppId})`, true);
        } else {
          const cheapest = res.cheapestPrice();
          if (cheapest) {
            richEmbed.addField(
              'Cheapest Price',
              `£${cheapest.priceNew.toFixed(2)} ([${cheapest.shop.name}](${cheapest.url}))`,
              true
            );
          }
        }
        if (res.metacritic) {
          richEmbed.addField('Metacritic', `${res.metacritic.score}%`, true);
        }
        richEmbed.addField(`Release Date`, res.releaseDate, true);

        // releaseDate

        msg.reply(richEmbed);
      },
      err => {
        console.log(err);
        msg.reply(`Whoops, error occurred searching ${searchString}`);
      }
    );
  }
});

client.login(discordKey);
