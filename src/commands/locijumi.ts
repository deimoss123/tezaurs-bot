import Command from '../interfaces/Command';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import findWord from '../utils/findWord';
import ephemeralError from '../utils/ephemeralError';
import axios from 'axios';

// nepabeigts
const locijumi: Command = {
  data: {
    name: 'locījumi',
    description: 'Atrast vārda locījumus',
    options: [
      {
        name: 'vārds',
        description: 'Vārds ko meklēt',
        required: true,
        type: 'STRING',
      }, {
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
    const foundWord = await findWord(wordToFind);
    
    if (!foundWord) return i.reply(ephemeralError(wordToFind));
    
    const { finalWord, resultInfoText } = foundWord;
    
    const locijumiUrl = `https://api.tezaurs.lv/v1/inflections/${encodeURIComponent(finalWord)}`;
    const tezaursData = await axios.get(locijumiUrl);
    
    const embed = new MessageEmbed()
      .setTitle(`Locījumi - ${finalWord}`)
      // .setURL(tezaursUrl)
      // .setFooter({ text: sources })
      .setColor('#0c86b6');
  },
};

export default locijumi;