// src/types/cards.ts
export type Suit = "CLUBS" | "DIAMONDS" | "HEARTS" | "SPADES";
export type Rank = "A"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"J"|"Q"|"K";

export interface Card {
    suit: Suit;
    rank: Rank;
    id: string;
}

const SUITS: Suit[] = ["CLUBS","DIAMONDS","HEARTS","SPADES"];
const RANKS: Rank[] = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

export function generateDeck(): Card[] {
    const deck: Card[] = [];
    for (const s of SUITS) for (const r of RANKS) deck.push({ suit: s, rank: r, id: `${s}-${r}` });
    return deck;
}
