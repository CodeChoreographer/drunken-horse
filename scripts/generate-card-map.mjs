import fs from "node:fs";
import path from "node:path";

const SRC_DIR = path.resolve("assets/cards");
const OUT_FILE = path.resolve("src/assets/cardImages.ts");

const rankToCode = (r) => {
    const m = { ace: "A", king: "K", queen: "Q", jack: "J" };
    return m[r] ?? r; // "2".."10"
};
const suitToShort = (s) => ({ spades: "S", hearts: "H", diamonds: "D", clubs: "C" }[s]);

const files = fs.readdirSync(SRC_DIR).filter(f => /\.png$/i.test(f));

const entries = [];
for (const f of files) {
    // erwartet genau: 2_of_clubs.png, ace_of_spades.png, ...
    const m = f.match(/^(ace|king|queen|jack|10|[2-9])_of_(spades|hearts|diamonds|clubs)\.png$/i);
    if (!m) continue;
    const rank = rankToCode(m[1].toLowerCase());  // "A","K","Q","J" oder "2".."10"
    const suit = suitToShort(m[2].toLowerCase()); // "S","H","D","C"
    const code = `${rank}${suit}`;                // z. B. "10H", "AS"
    const rel = `../../assets/cards/${f}`;
    entries.push({ code, rel });
}

// stabile Sortierung
entries.sort((a, b) => a.code.localeCompare(b.code, "en", { numeric: true }));

const lines = [];
lines.push(`// ⚠️ automatisch generiert – nicht manuell bearbeiten`);
lines.push(`export type SuitShort = "S"|"H"|"D"|"C";`);
lines.push(`export type RankCode = "A"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"J"|"Q"|"K";`);
lines.push(`export const CARD_IMAGES: Record<string, number> = {`);
for (const { code, rel } of entries) lines.push(`  "${code}": require("${rel}"),`);
lines.push(`};`);
lines.push(`export const getImageByCode = (code: string) => CARD_IMAGES[code];`);
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, lines.join("\n"));
console.log(`✅ cardImages.ts generiert mit ${entries.length} Karten`);
