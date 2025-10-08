import type { Card } from "../types/cards";

const suitShort: Record<Card["suit"], "S"|"H"|"D"|"C"> = {
    SPADES: "S", HEARTS: "H", DIAMONDS: "D", CLUBS: "C",
};

export const cardToCode = (c: Card) => `${c.rank}${suitShort[c.suit]}`; // "AS","10H",...
