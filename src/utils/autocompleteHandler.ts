import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
} from "discord.js";
import { dbClient } from "..";
import { QueryResult } from "pg";

type QueryRes = {
  sort_key: string;
  id: string;
  n: string;
};

function getRows(value: string) {
  if (!value) {
    const queryStr = `
      SELECT sort_key, id, n 
      FROM entries 
      LIMIT 25
    `;

    return dbClient.query(queryStr);
  } else {
    const queryStr = `
      SELECT sort_key, id, n
      FROM entries 
      WHERE sort_key % $1
      ORDER BY sort_key <-> $1 ASC, n ASC
      LIMIT 25
    `;

    return dbClient.query(queryStr, [value]);
  }
}

const LOGGING = false;

export default async function autocompleteHandler(i: AutocompleteInteraction) {
  const value = i.options.getFocused();

  const now = performance.now();

  let res: QueryResult<any>;

  try {
    res = await getRows(value);
  } catch (e) {
    console.error(e);
    return;
  }

  if (!res.rows.length) return;

  const rows = res.rows as QueryRes[];

  const hasMany = new Set<string>(
    rows.filter(({ n }) => +n >= 2).map(({ sort_key }) => sort_key),
  );

  const response: ApplicationCommandOptionChoiceData[] = rows.map((row) => ({
    name: `${row.sort_key} ${hasMany.has(row.sort_key) ? `(${row.n})` : ""}`,
    value: row.id,
  }));

  await i.respond(response).catch(() => {});

  if (LOGGING) {
    console.log(
      `${value} | Time: ${Math.floor((performance.now() - now) * 10) / 10_000}s`,
    );
  }
}
