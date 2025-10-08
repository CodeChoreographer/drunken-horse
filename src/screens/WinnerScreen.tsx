import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
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
const SUIT_COLOR: Record<Suit, string> = {
    HEARTS: "#E53935",
    DIAMONDS: "#E53935",
    CLUBS: "#000000",
    SPADES: "#000000",
};

export default function WinnerScreen() {
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { players, bets, winningSuit } = route.params as {
        players: Player[];
        bets: Bet[];
        winningSuit: Suit;
    };

    const byId = useMemo(
        () => Object.fromEntries(players.map(p => [p.id, p.name])),
        [players]
    );

    const winners = bets.filter(b => b.suit === winningSuit);
    const losers  = bets.filter(b => b.suit !== winningSuit);

    return (
        <View style={{ flex: 1, backgroundColor: palette.background, padding: spacing(3) }}>
            <ScrollView contentContainerStyle={{ paddingBottom: spacing(3) }}>
                <Card
                    style={{
                        backgroundColor: palette.primary,
                        alignItems: "center",
                        paddingVertical: spacing(3),
                        marginBottom: spacing(3),
                        marginTop: spacing(1)
                    }}
                >
                    <Text style={{ fontSize: 56, lineHeight: 56, color: SUIT_COLOR[winningSuit], marginBottom: spacing(2) }}>
                        {SUIT_SYMBOL[winningSuit]}
                    </Text>

                    <Text style={{ fontSize: 28, fontWeight: "800", color: "#fff", marginBottom: spacing(1) }}>
                        Congratulations!
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff", opacity: 0.9 }}>
                        Winnerhorse: {SUIT_SYMBOL[winningSuit]} {suitLabel(winningSuit)} {SUIT_SYMBOL[winningSuit]}
                    </Text>
                </Card>

                <Card style={{ marginBottom: spacing(2) }}>
                    <Text style={{ fontWeight: "700", color: palette.text, marginBottom: spacing(1) }}>Winners</Text>
                    {winners.length === 0 ? (
                        <Text style={{ color: palette.muted }}>No winners 🤷</Text>
                    ) : (
                        winners.map((b, i) => (
                            <Row
                                key={b.playerId + i}
                                left={byId[b.playerId] ?? "Player"}
                                right={`can distribute ${b.sips * 2} sips`}
                            />
                        ))
                    )}
                </Card>

                <Card>
                    <Text style={{ fontWeight: "700", color: palette.text, marginBottom: spacing(1) }}>Losers</Text>
                    {losers.length === 0 ? (
                        <Text style={{ color: palette.muted }}>No losers 🎉</Text>
                    ) : (
                        losers.map((b, i) => (
                            <Row
                                key={b.playerId + i}
                                left={byId[b.playerId] ?? "Player"}
                                right={`Must drink ${b.sips} sips`}
                            />
                        ))
                    )}
                </Card>
            </ScrollView>

            <View style={{ gap: spacing(2), marginBottom: spacing(2) }}>
                <Button
                    title="New round"
                    onPress={() => {
                        nav.replace("Game", { players, bets });
                    }}
                />
                <Button title="Back to Lobby" variant="secondary" onPress={() => nav.navigate("Lobby")} />
            </View>
        </View>
    );
}

function Row({ left, right }: { left: string; right: string }) {
    return (
        <View
            style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: spacing(1),
            }}
        >
            <Text style={{ color: palette.text }}>{left}</Text>
            <Text style={{ color: palette.text }}>{right}</Text>
        </View>
    );
}

function suitLabel(s: Suit) {
    switch (s) {
        case "HEARTS": return "Hearts";
        case "DIAMONDS": return "Diamonds";
        case "CLUBS": return "Clubs";
        case "SPADES": return "Spades";
    }
}
