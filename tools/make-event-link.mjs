#!/usr/bin/env node
/**
 * Erzeugt einen "Termin hinzufügen"-Link (und Code) für Kalenderblatt.
 *
 * Nutzung:
 *   node tools/make-event-link.mjs '{"title":"Paddle mit Freunden","date":"2026-08-30","start":"14:00","end":"16:00","cat":"Sport","reminder":"1h"}'
 *   node tools/make-event-link.mjs termine.json      (Datei: ein Objekt ODER ein Array von Objekten)
 *
 * Feld-Referenz eines Termins:
 *   title     Pflicht. Text.
 *   date      Pflicht. "YYYY-MM-DD".
 *   allDay    optional, true/false (Standard false).
 *   start     "HH:MM"  (ignoriert bei allDay; Standard "09:00").
 *   end       "HH:MM"  (optional).
 *   cat       Kategoriename ("Arbeit","Privat","Familie","Sport","Gesundheit","Sonstiges")
 *             oder id (c1..c6). Unbekannt -> "Sonstiges".
 *   note      optional, Text.
 *   reminder  getaktet: none | start | 10m | 30m | 1h | 1d
 *             ganztägig: none | morning | eve_before
 */
import { readFileSync } from "node:fs";

const BASE = "https://eldin676.github.io/kalenderblatt/";

const arg = process.argv[2];
if (!arg) {
  console.error("Bitte einen JSON-String oder einen Dateipfad angeben.");
  process.exit(1);
}

const looksInline = arg.trim().startsWith("{") || arg.trim().startsWith("[");
const text = looksInline ? arg : readFileSync(arg, "utf8");

let data;
try {
  data = JSON.parse(text);
} catch (e) {
  console.error("Kein gültiges JSON:", e.message);
  process.exit(1);
}

const list = (Array.isArray(data) ? data : [data]).map((e) => {
  const allDay = !!e.allDay;
  return {
    title: String(e.title ?? "").trim(),
    date: String(e.date ?? "").trim(),
    allDay,
    start: allDay ? null : (e.start ?? "09:00"),
    end: allDay ? null : (e.end ?? null),
    cat: e.cat ?? "Sonstiges",
    note: e.note ?? "",
    reminder: e.reminder ?? "none",
  };
});

for (const e of list) {
  if (!e.title || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) {
    console.error("Ungültiger Termin (title/date fehlt oder Datum nicht YYYY-MM-DD):", JSON.stringify(e));
    process.exit(1);
  }
}

const payload = list.length === 1 ? list[0] : list;
const b64 = Buffer.from(JSON.stringify(payload), "utf8")
  .toString("base64")
  .replace(/\+/g, "-")
  .replace(/\//g, "_")
  .replace(/=+$/, "");

const code = "KB1." + b64;
const link = BASE + "#add=" + code;

console.log("\n" + list.map((e) => `• ${e.title} — ${e.date}${e.allDay ? " (ganztägig)" : " " + e.start + (e.end ? "–" + e.end : "")}`).join("\n"));
console.log("\nCode:\n" + code);
console.log("\nLink:\n" + link + "\n");
