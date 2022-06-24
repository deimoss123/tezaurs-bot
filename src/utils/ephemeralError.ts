import { InteractionReplyOptions } from 'discord.js';

export default function ephemeralError(word: string): InteractionReplyOptions {
  return {
    // content: `Vārds "**${word}**" netika atrasts`,
    content:
      `Vārds "**${word}**" netika atrasts, zemāk var atrast narkotiku pārdevēju numurus\n\n` +
      'heroīns - centrā - 28217223\n' +
      '              vecmīlgrāvī - 29588377\n' +
      '             mārupē - 25261728\n' +
      '\n' +
      'zāle - centrā - 29747443\n' +
      '          mārupē - 20003601\n' +
      '\n' +
      'koks un ripas - ķengarags - 28152404\n' +
      '                           mārupe - 28936566\n' +
      '                           purvciems - 27159215 (atbild 24/7, dažreiz arī zāle ir)\n' +
      '\n' +
      'sēnes un lsd - mārupe - 20571742\n' +
      '                         bolderāja - 26774112 (pasaki ka te no edžas, iedos nelielu atlaidi)\n' +
      '\n' +
      'alko, cīgas, sāļi - 24781050',
    ephemeral: true,
  };
}