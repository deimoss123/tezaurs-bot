import {
  APIEmbed,
  ApplicationCommandOptionType,
  resolveColor,
} from "discord.js";
import Command from "../types/Command";
import { dbClient } from "..";
import intReply from "../utils/intReply";

type Entry = {
  id: string;
  n: number;
  type: string;
  sort_key: string;
  gramgrp: GramGrp[] | null;
};

type Sense = {
  id: string;
  n: number;
  def: string;
  parent_id: string | null;
  entry_id: string;
};

type Gram = {
  type: string;
  $: string;
};

type GramGrp = {
  $: GramGrp[] | null;
  type: string;
  subtype: string;
  gram: Gram[] | null;
};

function getEntry(id: string) {
  const queryStr = `
    SELECT * FROM entries
    WHERE id = $1;
  `;

  return dbClient.query(queryStr, [id]);
}

function getSenses(id: string) {
  const queryStr = `
    WITH RECURSIVE senses2 AS (
        SELECT id, n, def, parent_id, entry_id
        FROM senses
        WHERE entry_id = $1
        UNION
        SELECT s.id, s.n, s.def, s.parent_id, s.entry_id
        FROM senses s
        INNER JOIN senses2 s2 ON s.parent_id = s2.id
    )
    SELECT * FROM senses2;
  `;

  return dbClient.query(queryStr, [id]);
}

const gramGrpTypes: Record<string, (value: string, fullStr: string) => string> =
  {
    Dzimte: (v) => ` ${v.toLowerCase()} dzimtes`,
    Deklinācija: (v) => ` ${v}. deklinācijas`,
    Konjugācija: (v) => ` ${v}. konjugācijas`,
    Vārdšķira: (v) => ` ${v.toLowerCase()}`,
    Lietojums: (v, fullStr) => `${fullStr ? ";" : ""} ${v.toLowerCase()}`,
    Joma: (v, fullStr) => `${fullStr ? ";" : ""} joma: ${v.toLowerCase()}`,
  };

function entryGramGrpStr(gramGrp: GramGrp) {
  const grams = gramGrp.gram!;
  const keys = Object.keys(gramGrpTypes);

  let str = "";

  grams
    .filter((g) => keys.includes(g.type))
    .toSorted((g1, g2) => keys.indexOf(g1.type) - keys.indexOf(g2.type))
    .forEach((g) => {
      str += gramGrpTypes[g.type](g.$, str);
    });

  return str.trim();
}

function getEmbed(entry: Entry, senses: Sense[]): APIEmbed {
  let description = "";

  if (entry.gramgrp && entry.gramgrp.length) {
    const gramgrp2 = entry.gramgrp[0].$;

    if (gramgrp2 && gramgrp2.length && gramgrp2[0].gram) {
      description += `-# ${entryGramGrpStr(gramgrp2[0])}\n-# \u2800\n`;
      // description += `\`${entryGramGrpStr(gramgrp2[0])}\`\n`;
    }
  }

  senses
    .filter((s) => s.parent_id === null)
    .toSorted((s1, s2) => s1.n - s2.n)
    .forEach((parentSense, index, arr) => {
      if (senses.length > 1) {
        description += `**${parentSense.n}.** `;
      }

      description += `${parentSense.def}\n`;

      senses
        .filter((s) => s.parent_id === parentSense.id)
        .toSorted((s1, s2) => s1.n - s2.n)
        .forEach((childSense) => {
          description += `- **${parentSense.n}.${childSense.n}.** ${childSense.def}\n`;
        });

      if (index !== arr.length - 1) {
        description += "-# \u2800\n";
      }
    });

  return {
    title: `${entry.sort_key} (${entry.n})`,
    description,
    url:
      "https://tezaurs.lv/" +
      encodeURIComponent(
        `${entry.sort_key}${entry.n === 1 ? "" : `:${entry.n}`}`,
      ),
    color: resolveColor("#0c86b6"),
  };
}

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
    const entryId = i.options.getString("vārds")!;
    const userToPing = i.options.getUser("lietotājs");

    if (!entryId) {
      return intReply(i, "???");
    }

    let resSenses, resEntry;

    try {
      [resSenses, resEntry] = await Promise.all([
        getSenses(entryId),
        getEntry(entryId),
      ]);
    } catch (e) {
      return intReply(i, {
        content: "Kaut kas nogāja greizi",
        ephemeral: true,
      });
    }

    if (!resEntry.rowCount || !resSenses.rowCount) {
      return intReply(i, {
        content: `Vārds "${entryId}" netika atrasts\n**Izvēlies vārdu no saraksta!**`,
        ephemeral: true,
      });
    }

    const entry = resEntry.rows[0] as Entry;
    const senses = resSenses.rows as Sense[];

    const embed = getEmbed(entry, senses);

    return intReply(i, { content: `${userToPing || ""}`, embeds: [embed] });
  },
};

export default tezaurs;
