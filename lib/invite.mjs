import { getStore } from "@netlify/blobs";
import { EVENT } from "../event-config.mjs";

export { EVENT };

export const rsvpStore = () => getStore({ name: "friendsgiving-rsvps", consistency: "strong" });
export const dishStore = () => getStore({ name: "friendsgiving-dishes", consistency: "strong" });

export const norm = (n) => String(n || "").trim().toLowerCase();
export const nameKey = (n) => Buffer.from(norm(n)).toString("base64url");
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const SUGGESTED = Object.entries(EVENT.suggestions).map(([category, items]) => ({
  category,
  items: items.map((label) => ({ key: `s-${slug(label)}`, label })),
}));
export const SUGGESTED_BY_KEY = Object.fromEntries(
  SUGGESTED.flatMap((g) => g.items.map((i) => [i.key, { ...i, category: g.category }]))
);

export async function all(s) {
  const { blobs } = await s.list();
  const items = await Promise.all(blobs.map((b) => s.get(b.key, { type: "json" })));
  return items.filter(Boolean);
}

export const publicEvent = () => ({
  dateLabel: EVENT.dateLabel, date: EVENT.date, start: EVENT.start, end: EVENT.end,
  address: EVENT.address, hosts: EVENT.hosts, note: EVENT.note,
  hostDishes: EVENT.hostDishes, suggested: SUGGESTED,
});

// Combine the hosts' known allergies with any a guest enters. Shows allergies only, never names.
export function allergyList(known, rsvps) {
  const skip = new Set(["", "none", "no", "nope", "n/a", "na", "nothing", "no allergies"]);
  const seen = new Map();
  const add = (a) => { const t = a.trim().replace(/\.$/, ""); const k = t.toLowerCase(); if (!skip.has(k) && !seen.has(k)) seen.set(k, t.charAt(0).toUpperCase() + t.slice(1)); };
  known.forEach(add);
  rsvps.filter((r) => r.attending && r.allergies).forEach((r) => r.allergies.split(/,|;|\/|\band\b|&/i).forEach(add));
  return [...seen.values()];
}

export const knownAllergies = () => EVENT.allergies || [];
