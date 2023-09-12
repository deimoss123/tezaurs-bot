import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
} from "discord.js";
import { dbClient } from "..";

export default async function autocompleteHandler(i: AutocompleteInteraction) {
  const value = i.options.getFocused();
  if (!value) return;
  // SELECT * FROM words WHERE levenshtein(word, 'āda') < 2 ORDER BY levenshtein(word, 'āda') ASC
  // const queryStr = `
  //   SELECT id, word FROM words
  //   WHERE levenshtein(left(word, 255), $1) < 1.2
  //   ORDER BY levenshtein(left(word, 255), $1) ASC
  //   LIMIT 10
  // `;

  const queryStr2 = `
    SELECT word, id, n FROM words 
    WHERE word % $1
    ORDER BY word <-> $1 ASC, n ASC
    LIMIT 25
  `;

  const now = performance.now();
  const res = await dbClient.query(queryStr2, [value]);
  console.log(
    `${value} | Time: ${Math.floor((performance.now() - now) * 10) / 10_000}s`
  );

  if (!res.rows.length) return;

  const hasMany = new Set<string>(
    res.rows.filter(({ n }) => +n >= 2).map(({ word }) => word)
  );

  const response: ApplicationCommandOptionChoiceData[] = res.rows.map(
    (row) => ({
      name: `${row.word} ${hasMany.has(row.word) ? `(${row.n})` : ""}`,
      value: row.id,
    })
  );

  i.respond(response).catch(() => {});
}
