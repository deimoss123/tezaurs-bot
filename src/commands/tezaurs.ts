import {
  APIEmbedField,
  ApplicationCommandOptionType,
  EmbedBuilder,
} from "discord.js";
import Command from "../types/Command";
import { Entry, SenseEntity, SenseEntity1 } from "../types/Entry";
import truncate from "../utils/truncate";
import { dbClient } from "..";
import intReply from "../utils/intReply";

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
    // @ts-ignore
    contexts: [0, 1, 2],
    integration_types: [0, 1],
  },
  async run(i) {
    // SELECT * FROM words WHERE levenshtein(word, 'āda') < 2 ORDER BY levenshtein(word, 'āda') ASC
    const wordToFind = i.options.getString("vārds")!;
    const userToPing = i.options.getUser("lietotājs");

    if (!wordToFind) {
      return intReply(i, "???");
    }

    const queryStr = `
      SELECT * FROM words
      WHERE id = $1
      LIMIT 1
    `;
    const data = await dbClient.query(queryStr, [wordToFind]).catch(() => {
      intReply(i, sojasEmbed);
    });
    if (!data) return;

    if (!data.rows?.length) {
      return intReply(i, sojasEmbed);
    }

    const wordData = data.rows[0].data as Entry;
    const { sortKey, n, type, id } = wordData.$;

    const urlPath =
      type === "mwe" ? id.split("/")[1] : `${encodeURIComponent(sortKey)}:${n}`;
    const url = `https://tezaurs.lv/${urlPath}`;

    return intReply(i, {
      embeds: getEmbed(sortKey, url, wordData),
      content: userToPing ? `${userToPing}` : undefined,
    });
  },
};

function getMainProperties(entry: Entry): string | null {
  const gramGrp = entry.form.gramGrp;
  if (!gramGrp) return null;

  const gram = gramGrp[0].gramGrp?.[0].gram;
  if (!gram) return null;

  const txt = gram
    .map((g) => `\u001b[1;34m${g.$.type}\u001b[0;0m: ${g.$text}\n`)
    .join("");

  return "```ansi\n" + txt + "```";
}

function getUse(sense: SenseEntity | SenseEntity1): string {
  let properties: string[] = [];

  if (sense.gramGrp && sense.gramGrp[0]?.gramGrp) {
    let gramGrp = sense.gramGrp[0].gramGrp;
    if (gramGrp[0].gramGrp) gramGrp = gramGrp[0].gramGrp;

    for (const gram of gramGrp) {
      if (!gram?.gram?.[0]) continue;
      properties = gram.gram.map((g) => g.$text);
    }
  }

  return properties.join(", ");
}

// velnīgi daudz definīcijas:
// Melnezers, Neuhof, mest

function getDefinitions(definitions: SenseEntity[] | null | undefined) {
  if (!definitions) return [];

  const fields: APIEmbedField[] = [];

  for (const def of definitions) {
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

  const mainProperties = getMainProperties(wordData);
  if (mainProperties) embeds[0].setDescription(mainProperties);

  const sources = wordData.listBibl?.bibl
    .map((b) => b.$.corresp.slice(1))
    .join(", ");

  if (sources) embeds.at(-1)!.setFooter({ text: `Avoti: ${sources}` });

  return embeds;
}

export default tezaurs;
