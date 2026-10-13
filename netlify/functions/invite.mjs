import { rsvpStore, dishStore, all, norm, nameKey, SUGGESTED_BY_KEY, publicEvent, allergyList, knownAllergies } from "../../lib/invite.mjs";
import { json } from "../../lib/votes.mjs";

async function state() {
  const [rsvps, claims] = await Promise.all([all(rsvpStore()), all(dishStore())]);
  const coming = rsvps.filter((r) => r.attending);
  return {
    event: publicEvent(),
    // Allergies only, never who has them.
    allergies: allergyList(knownAllergies(), rsvps),
    // Guests see headcount totals only; names are on the private page.
    rsvp: { households: coming.length, guests: coming.reduce((n, r) => n + r.count, 0) },
    // Dish sign-ups show who's bringing what, like a potluck sheet.
    claims: claims
      .sort((a, b) => a.at.localeCompare(b.at))
      .map(({ key, label, category, name, custom }) => ({ key, label, category, name, custom })),
  };
}

export default async (req) => {
  if (req.method === "GET") return json(await state());
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Something went wrong. Try again." }, 400); }
  const name = String(body.name || "").trim().slice(0, 60);
  if (!name) return json({ error: "Add your name first." }, 400);

  if (body.action === "rsvp") {
    const attending = body.attending === true;
    const count = attending ? Math.min(20, Math.max(1, parseInt(body.count, 10) || 1)) : 0;
    const allergies = attending ? String(body.allergies || "").trim().slice(0, 120) : "";
    await rsvpStore().setJSON(nameKey(name), { name, attending, count, allergies, at: new Date().toISOString() });
    return json(await state());
  }

  const dishes = dishStore();

  if (body.action === "claim") {
    const dish = SUGGESTED_BY_KEY[body.key];
    if (!dish) return json({ error: "That dish isn't on the list anymore. Refresh the page." }, 400);
    const existing = await dishes.get(dish.key, { type: "json" });
    if (existing && norm(existing.name) !== norm(name))
      return json({ error: `${existing.name} already claimed ${dish.label}. Pick another, or add your own below.`, ...(await state()) }, 409);
    await dishes.setJSON(dish.key, { key: dish.key, label: dish.label, category: dish.category, name, custom: false, at: new Date().toISOString() });
    return json(await state());
  }

  if (body.action === "custom") {
    const label = String(body.label || "").trim().slice(0, 80);
    if (!label) return json({ error: "Type what you're bringing." }, 400);
    const key = `c-${crypto.randomUUID()}`;
    await dishes.setJSON(key, { key, label, category: "Guests are also bringing", name, custom: true, at: new Date().toISOString() });
    return json(await state());
  }

  if (body.action === "release") {
    const existing = await dishes.get(String(body.key || ""), { type: "json" });
    if (!existing) return json(await state());
    if (norm(existing.name) !== norm(name)) return json({ error: "You can only undo dishes you signed up for." }, 403);
    await dishes.delete(existing.key);
    return json(await state());
  }

  return json({ error: "Unknown action" }, 400);
};

export const config = { path: "/api/invite" };
