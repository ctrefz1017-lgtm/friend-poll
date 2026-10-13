import { rsvpStore, dishStore, all } from "../../lib/invite.mjs";
import { json } from "../../lib/votes.mjs";

export default async (req) => {
  const adminKey = Netlify.env.get("ADMIN_KEY");
  if (!adminKey) return json({ error: "ADMIN_KEY isn't set yet. Add it in Netlify's environment variables, then redeploy." }, 500);
  if (new URL(req.url).searchParams.get("key") !== adminKey)
    return json({ error: "That admin key doesn't match. Check the link and try again." }, 401);

  const [rsvps, claims] = await Promise.all([all(rsvpStore()), all(dishStore())]);
  const byTime = (a, b) => a.at.localeCompare(b.at);
  return json({ rsvps: rsvps.sort(byTime), claims: claims.sort(byTime) });
};

export const config = { path: "/api/invite-admin" };
