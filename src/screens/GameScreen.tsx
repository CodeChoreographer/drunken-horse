import React from "react";
import { View, Text } from "react-native";
import { useRoute } from "@react-navigation/native";
import type { Player, Bet } from "../types/game";

export default function GameScreen() {
    const route = useRoute();
    const { players, bets } = route.params as { players: Player[]; bets: Bet[] };

    return (
        <View style={{ flex: 1, padding: 16, gap: 8 }}>
            <Text style={{ fontSize: 22, fontWeight: "800" }}>Horse Race</Text>
            <Text style={{ opacity: 0.7 }}>Players: {players.length} • Bets: {bets.length}</Text>

            {/* TODO: Deck-of-Cards-API, Rennlogik, Draw-Button, Shake-to-Draw */}
        </View>
    );
}
