import { POLL, store, allVotes, tally, json } from "../../lib/votes.mjs";

// Private endpoint: shows who picked what. Requires ?key= matching the ADMIN_KEY env variable.
export default async (req) => {
  const adminKey = Netlify.env.get("ADMIN_KEY");
  if (!adminKey) return json({ error: "ADMIN_KEY isn't set yet. Add it in Netlify's environment variables, then redeploy." }, 500);

  const key = new URL(req.url).searchParams.get("key");
  if (key !== adminKey) return json({ error: "That admin key doesn't match. Check the link and try again." }, 401);

  const votes = (await allVotes(store())).sort((a, b) => a.at.localeCompare(b.at));
  return json({
    question: POLL.question,
    options: POLL.options,
    counts: tally(votes),
    votes,
  });
};

export const config = { path: "/api/admin" };
