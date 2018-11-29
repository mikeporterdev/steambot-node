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

    bot.getGame(searchString).subscribe(res => {
      const richEmbed = new RichEmbed();
      richEmbed.setTitle(res.name);
      richEmbed.setThumbnail(res.headerImageUrl);
      richEmbed.setDescription(res.shortDescription);
      richEmbed.setAuthor('SteamBot');
      const cheapest = res.cheapestPrice();
      richEmbed.addField('Cheapest Price', `£${cheapest.priceNew} ([${cheapest.shop.name}](${cheapest.url}))`);
      richEmbed.addField('Metacritic', `${res.metacritic.score}%`);

      msg.reply(richEmbed);
    }, err => {
      console.log(err);
      msg.reply(`Whoops, error occurred searching ${searchString}`);
    })
  }
});

client.login(discordKey);
