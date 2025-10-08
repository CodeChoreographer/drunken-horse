export type Suit = "HEARTS" | "DIAMONDS" | "CLUBS" | "SPADES";

export type Player = {
    id: string;
    name: string;
};

export type Bet = {
    playerId: string;
    suit: Suit;
    sips: number;
};
