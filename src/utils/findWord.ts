import axios from 'axios';
import * as cheerio from 'cheerio';

interface FindWordReturn {
  finalWord: string;
  resultInfoText: string;
}

export default async function findWord(word: string): Promise<FindWordReturn | void> {
  const url = `https://tezaurs.lv/api/searchEntry?w=${encodeURIComponent(word)}`;
  
  const searchResult = await axios.get(url);
  const $ = cheerio.load(searchResult.data);
  const docDiv = $('#doc');
  
  let linkToWord: cheerio.Cheerio | undefined;
  let resultInfoText = 'Atrasta tiešā forma';
  
  // meklē vārdu tieši
  if ($(docDiv).find('#exactMatch').length) {
    linkToWord = $(docDiv).find('#exactMatch > div:nth-child(1) > a');
  } else { // meklē vārdu netieši
    const searchTypes: {
      id: string, // HTML elementa id
      text: string // informatīvais teksts, kas tiks parādīts atbildē, piem., Atrasta pamatforma vārdam <vārds>
    }[] = [
      { id: '#lemmas', text: 'pamatforma' },
      { id: '#fuzzy', text: 'aptuvena līdzība' },
      { id: '#alternatives', text: 'alternatīva' },
      { id: '#homonyms', text: 'homonīms' },
    ];
    
    for (const { id, text } of searchTypes) {
      const searched = $(docDiv).find(`${id} .listBox > div:nth-child(1) > a`);
      if (searched.length) {
        linkToWord = searched;
        resultInfoText = `Atrasta ${text} vārdam "**${word}**"`;
        break;
      }
    }
  }
  
  if (!linkToWord || !linkToWord.attr('href')) return;
  
  return {
    finalWord: linkToWord.text(),
    resultInfoText,
  };
}