import React from "react";
import { View, Text, FlatList } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import type { Player, Bet, Suit } from "../types/game";
import { palette, spacing } from "../theme/theme";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const SUIT_SYMBOL: Record<Suit, string> = {
    HEARTS: "♥",
    DIAMONDS: "♦",
    CLUBS: "♣",
    SPADES: "♠",
};

export default function ConfirmBetsScreen() {
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { players, bets } = route.params as { players: Player[]; bets: Bet[] };

    const betById = new Map(bets.map(b => [b.playerId, b]));

    return (
        <View style={{ flex: 1, backgroundColor: palette.background, padding: spacing(3), marginTop: spacing(4) }}>
            <Text style={{ color: "#fff", opacity: 0.9, marginBottom: spacing(2) }}>
                Confirm that each player has set their sips.
            </Text>

            <FlatList
                data={players}
                keyExtractor={(p) => p.id}
                contentContainerStyle={{ gap: spacing(2), paddingBottom: spacing(3) }}
                renderItem={({ item }) => {
                    const b = betById.get(item.id)!;
                    return (
                        <Card style={{ paddingVertical: spacing(2), borderRadius: 20 }}>
                            {/* Spielername */}
                            <Text
                                style={{
                                    color: palette.primary,
                                    fontWeight: "800",
                                    marginBottom: spacing(1),
                                }}
                            >
                                {item.name}
                            </Text>

                            {/* Suit-Symbol + Sips */}
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={{ color: "#fff", fontSize: 18 }}>
                                    {SUIT_SYMBOL[b.suit]}
                                </Text>
                                <Text style={{ color: "#fff" }}>Sips: {b.sips}</Text>
                            </View>
                        </Card>
                    );
                }}
            />

            <View style={{ marginTop: "auto", alignItems: "center", gap: spacing(2), paddingBottom: spacing(4) }}>
                <View style={{ width: "100%" }}>
                    <Button
                        title="Start Game"
                        onPress={() => nav.navigate("Game", { players, bets })}
                    />
                </View>
                <View style={{ width: "100%" }}>
                    <Button
                        title="Back"
                        variant="secondary"
                        onPress={() => nav.navigate("Bet", { players, initialBets: bets })}
                    />
                </View>
            </View>
        </View>
    );
}
