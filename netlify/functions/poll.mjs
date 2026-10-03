import { POLL, store, keyFor, allVotes, tally, json } from "../../lib/votes.mjs";

// Public endpoint: returns totals only, never names.
const summary = (votes) => ({
  id: POLL.id,
  question: POLL.question,
  options: POLL.options,
  counts: tally(votes),
  voters: votes.length,
});

export default async (req) => {
  const s = store();

  if (req.method === "GET") return json(summary(await allVotes(s)));

  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return json({ error: "Send your name and your picks." }, 400); }

    const name = String(body.name || "").trim().slice(0, 60);
    const choices = Array.isArray(body.choices)
      ? [...new Set(body.choices.map(Number))].filter(
          (i) => Number.isInteger(i) && i >= 0 && i < POLL.options.length
        )
      : [];

    if (!name) return json({ error: "Add your name so your vote counts." }, 400);
    if (!choices.length) return json({ error: "Pick at least one option." }, 400);

    await s.setJSON(keyFor(name), { name, choices, at: new Date().toISOString() });
    return json({ ok: true, ...summary(await allVotes(s)) });
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config = { path: "/api/poll" };
