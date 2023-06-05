import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import Command from "../types/Command";
import { dbClient } from "..";
import { Entry, SenseEntity, SenseEntity1 } from "../types/Entry";

const errEmbed = {
  ephemeral: true,
  embeds: [
    {
      description: "[www.tezaurs.lv](https://www.tezaurs.lv) kļūda",
      color: 0xff0000,
    },
  ],
};

const tezaurs: Command = {
  data: {
    name: "tezaurs",
    description: "Atrast vārda definīciju un homonīmus",
    options: [
      {
        name: "vārds",
        description: "Vārds ko meklēt",
        required: true,
        autocomplete: true,
        type: ApplicationCommandOptionType.String,
      },
      {
        name: "lietotājs",
        description: "Lietotājs ko vēlies pieminēt (pingot)",
        required: false,
        type: ApplicationCommandOptionType.User,
      },
    ],
  },
  async run(i) {
    // SELECT * FROM words WHERE levenshtein(word, 'āda') < 2 ORDER BY levenshtein(word, 'āda') ASC
    const wordToFind = i.options.getString("vārds")!;
    const userToPing = i.options.getUser("lietotājs");

    if (!wordToFind) {
      return i.reply("???");
    }

    const queryStr = `
      SELECT * FROM words
      WHERE id = $1
      LIMIT 1
    `;
    const data = await dbClient.query(queryStr, [wordToFind]).catch(() => {
      i.reply("???");
    });
    if (!data) return;

    if (!data.rows?.length) {
      return i.reply("???");
    }

    const wordData = data.rows[0].data as Entry;
    const { sortKey, n, type, id } = wordData.$;

    const urlPath =
      type === "mwe" ? id.split("/")[1] : `${encodeURIComponent(sortKey)}:${n}`;
    const url = `https://tezaurs.lv/${urlPath}`;

    const embed = new EmbedBuilder();
    embed.setColor("#0c86b6");
    // embed.setTitle(wordData.$.sortKey);

    embed.setDescription(`## [${sortKey}](${url})`);

    if (wordData.sense) addDefinitions(embed, wordData.sense);

    return i.reply({
      embeds: [embed],
      content: userToPing ? `${userToPing}` : undefined,
    });
  },
};

function getUse(sense: SenseEntity | SenseEntity1): string {
  let str = "";
  if (sense.gramGrp && sense.gramGrp[0]?.gramGrp) {
    const gramGrp = sense.gramGrp[0].gramGrp;
    for (const gram of gramGrp) {
      if (!gram?.gram?.[0]) continue;

      switch (gram.$.type) {
        // prettier-ignore
        case 'Dzimte': {
          str += `${gram.gram[0].$text} dzimte`
        } break;
      }
    }
  }

  return str;
}

function addDefinitions(embed: EmbedBuilder, definitions: SenseEntity[]) {
  embed.setDescription(`${embed.data.description || ""}\n### Definīcijas:`);

  for (const def of definitions) {
    embed.addFields({ name: `${def.$.n}. ${getUse(def)}`, value: def.def });
    if (def.sense) {
      for (const def1 of def.sense) {
        embed.addFields({
          name: `${def.$.n}.${def1.$.n}. ${getUse(def1)}`,
          value: def1.def,
        });
      }
    }
  }
}

export default tezaurs;
