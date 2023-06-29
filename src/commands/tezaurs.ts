import {
  APIEmbedField,
  ApplicationCommandOptionType,
  EmbedBuilder,
} from "discord.js";
import Command from "../types/Command";
import { dbClient } from "..";
import { Entry, SenseEntity, SenseEntity1 } from "../types/Entry";
import truncate from "../utils/truncate";

const sojasEmbed = {
  ephemeral: true,
  content: "Kaut kas laikam nogāja greizi",
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
      i.reply(sojasEmbed);
    });
    if (!data) return;

    if (!data.rows?.length) {
      return i.reply(sojasEmbed);
    }

    const wordData = data.rows[0].data as Entry;
    const { sortKey, n, type, id } = wordData.$;

    const urlPath =
      type === "mwe" ? id.split("/")[1] : `${encodeURIComponent(sortKey)}:${n}`;
    const url = `https://tezaurs.lv/${urlPath}`;

    return i.reply({
      embeds: getEmbed(sortKey, url, wordData),
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

// velnīgi daudz definīcijas:
// Melnezers, Neuhof, mest

function getDefinitions(definitions: SenseEntity[] | null | undefined) {
  if (!definitions) return [];

  const fields: APIEmbedField[] = [];

  for (const def of definitions) {
    // console.log(`${def.$.n}. ${getUse(def)}`);
    // console.log(def.def);

    fields.push({
      name: truncate(256, `${def.$.n}. ${getUse(def)}`),
      value: truncate(1024, def.def),
    });

    // pievieno papildus definīcijas, bet aizkomentēts jo baigais spams
    // if (def.sense) {
    //   for (const def1 of def.sense) {
    //     // console.log(`${def.$.n}.${def1.$.n}. ${getUse(def1)}`);
    //     // console.log(def1.def);

    //     fields.push({
    //       name: `${def.$.n}.${def1.$.n}. ${getUse(def1)}`,
    //       value: def1.def || "-",
    //     });
    //   }
    // }
  }

  return fields;
}

function getEmbed(
  sortKey: string,
  url: string,
  wordData: Entry
): EmbedBuilder[] {
  const fields = getDefinitions(wordData.sense);

  const embedCount = Math.ceil(fields.length / 25);
  const embeds = Array.from({ length: embedCount }, (_, i) =>
    new EmbedBuilder()
      .setFields(fields.slice(i * 25, (i + 1) * 25))
      .setColor("#0c86b6")
  );

  embeds[0].setTitle(sortKey).setURL(url);

  // TODO: avoti
  // const sources = wordData.listBibl?.bibl;

  // if (firstEmbed.data.fields?.length) {
  //   console.log("chau");
  //   firstEmbed.setFields(firstEmbed.data.fields.slice(0, 23));
  // } else {
  //   firstEmbed.setDescription(
  //     firstEmbed.data.description + "\n...nav definīciju?"
  //   );
  // }

  return embeds;
}

export default tezaurs;
