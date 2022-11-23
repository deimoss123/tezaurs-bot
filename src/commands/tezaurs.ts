import Command from '../interfaces/Command';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import findWord, { FindWordReturn } from '../utils/findWord';
import ephemeralError from '../utils/ephemeralError';

const errEmbed = {
  ephemeral: true,
  embeds: [{ description: '[www.tezaurs.lv](https://www.tezaurs.lv) kļūda', color: 0xff0000 }],
};

const tezaurs: Command = {
  data: {
    name: 'tezaurs',
    description: 'Atrast vārda definīciju un homonīmus',
    options: [
      {
        name: 'vārds',
        description: 'Vārds ko meklēt',
        required: true,
        type: 'STRING',
      },
      {
        name: 'lietotājs',
        description: 'Lietotājs ko vēlies pieminēt (pingot)',
        required: false,
        type: 'USER',
      },
    ],
  },
  async run(i: CommandInteraction) {
    const wordToFind = i.options.getString('vārds')!;
    const userToPing = i.options.getUser('lietotājs');
    let foundWord: FindWordReturn | void;

    try {
      foundWord = await findWord(wordToFind);
    } catch (_) {
      return i.reply(errEmbed);
    }

    if (!foundWord) return i.reply(ephemeralError(wordToFind));

    const { finalWord, resultInfoText } = foundWord;

    const tezaursUrl = `https://tezaurs.lv/${encodeURIComponent(finalWord)}`;

    let tezaursData: AxiosResponse<any, any>;

    try {
      tezaursData = await axios.get(tezaursUrl);
    } catch (e) {
      console.error(e);
      return i.reply(errEmbed);
    }
    console.log('chau');

    const $ = cheerio.load(tezaursData.data);
    const dictMain = $('span.dict_Verbalization').first().text();
    const sources = $('div.dict_Block').first().text();

    const entries = $('main#main div.dict_Sense');
    if (!entries.length) return i.reply(ephemeralError(wordToFind));

    const embed = new MessageEmbed()
      .setTitle(finalWord)
      .setDescription(`\`${dictMain}\``)
      .setURL(tezaursUrl)
      .setFooter({ text: sources })
      .setColor('#0c86b6');

    entries.each((index, entry) => {
      if (index > 24) return; // Discord embed fieldu limits ir 25

      const definition = $(entry).find('span.dict_Gloss').first().text();
      const number = $(entry).find('span.dict_SenseNumber').first().text() || '1.';
      let dict = $(entry).find('span:nth-child(2)').first().text();

      if (number.trim().length !== 2) return; // nepārbauda apakšdefinīcijas 1.1, 2.3 utt.

      if (entries.length === 1 || definition === dict) dict = '';

      // tiek izmantots .substring gadījumā ja teksts pārkāpj Discord API embed limitācijas
      embed.addField(`${number} ${dict}`.substring(0, 255), definition.substring(0, 1023) || '-');
    });

    console.log(wordToFind, finalWord);

    await i.reply({
      content: `${userToPing ? `<@${userToPing.id}>` : ''}\n ${resultInfoText}`,
      embeds: [embed],
    });
  },
};

export default tezaurs;
