import { getStore } from "@netlify/blobs";
import { POLL } from "../poll-config.mjs";

export { POLL };

export const store = () =>
  getStore({ name: `votes-${POLL.id}`, consistency: "strong" });

// One record per name (case-insensitive), so voting again replaces the earlier answer.
export const keyFor = (name) =>
  Buffer.from(name.trim().toLowerCase()).toString("base64url");

export async function allVotes(s) {
  const { blobs } = await s.list();
  const votes = await Promise.all(blobs.map((b) => s.get(b.key, { type: "json" })));
  return votes.filter(Boolean);
}

export function tally(votes) {
  const counts = POLL.options.map(() => 0);
  for (const v of votes) for (const i of v.choices) if (counts[i] !== undefined) counts[i]++;
  return counts;
}

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
