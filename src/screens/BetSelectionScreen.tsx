import React, { useMemo, useState } from "react";
import {View, Text, Pressable, Alert} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import type { Player, Bet, Suit } from "../types/game";
import { palette, spacing } from "../theme/theme";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const SUITS: { key: Suit; symbol: string; color: string }[] = [
    { key: "HEARTS", symbol: "♥", color: "#E53935" },
    { key: "DIAMONDS", symbol: "♦", color: "#E53935" },
    { key: "CLUBS", symbol: "♣", color: "#000000" },
    { key: "SPADES", symbol: "♠", color: "#000000" },
];

export default function BetSelectionScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    //initialBets (kommen von der Confirm-Seite, wenn der User zurückgeht)
    const { players, initialBets } = route.params as { players: Player[]; initialBets?: Bet[] };

    const toRecord = (bets?: Bet[]) =>
        (bets ?? []).reduce<Record<string, { suit: Suit; sips: number }>>(
            (acc, b) => ({ ...acc, [b.playerId]: { suit: b.suit, sips: b.sips } }),
            {}
        );

    // pro Spieler die Auswahl merken
    const [betsByPlayer, setBetsByPlayer] = useState<Record<string, { suit: Suit; sips: number }>>(
        toRecord(initialBets)
    );
    const [idx, setIdx] = useState(0);
    const current = useMemo(() => players[idx], [players, idx]);

    // lokale Auswahl (Default aus betsByPlayer oder 1)
    const seed = betsByPlayer[players[0].id];
    const [selectedSuit, setSelectedSuit] = useState<Suit | null>(seed?.suit ?? null);
    const [sips, setSips] = useState<number>(seed?.sips ?? 1);

    const canNext = !!selectedSuit && sips > 0;

    const persistCurrentSelection = () => {
        if (!selectedSuit) return;
        setBetsByPlayer(prev => ({
            ...prev,
            [current.id]: { suit: selectedSuit, sips },
        }));
    };

    const goNext = () => {
        if (!selectedSuit) return;
        persistCurrentSelection();

        if (idx < players.length - 1) {
            const nextIdx = idx + 1;
            const nextPlayer = players[nextIdx];
            setIdx(nextIdx);

            // Vorauswahl für nächsten Spieler laden
            const preset = betsByPlayer[nextPlayer.id];
            setSelectedSuit(preset?.suit ?? null);
            setSips(preset?.sips ?? 1);
        } else {
            const orderedBets: Bet[] = players.map(p => {
                const b = betsByPlayer[p.id] ?? { suit: selectedSuit as Suit, sips };
                return { playerId: p.id, suit: b.suit, sips: b.sips };
            });
            navigation.navigate("Confirm", { players, bets: orderedBets });
        }
    };

    const goBack = () => {
        // solange nicht beim ersten Spieler: einen Spieler zurück
        if (idx > 0) {
            if (selectedSuit) persistCurrentSelection();

            const prevIdx = idx - 1;
            const prevPlayer = players[prevIdx];
            setIdx(prevIdx);

            const prev = betsByPlayer[prevPlayer.id];
            setSelectedSuit(prev?.suit ?? null);
            setSips(prev?.sips ?? 1);
            return;
        }

        Alert.alert("Back to lobby?", "", [
            { text: "Cancel", style: "cancel" },
            { text: "Yes", onPress: () => navigation.navigate("Lobby") },
        ]);
    };


    return (
        <View style={{ flex: 1, backgroundColor: palette.background, padding: spacing(5) }}>
            <Text style={{ color: palette.primary, fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: spacing(3) }}>
                {current.name}, Place your bet!
            </Text>

            <View style={{ gap: spacing(2) }}>
                <View style={{ flexDirection: "row", gap: spacing(2) }}>
                    {SUITS.slice(0, 2).map(s => (
                        <SuitCard
                            key={s.key}
                            suit={s.key}
                            symbol={s.symbol}
                            color={s.color}
                            selected={selectedSuit === s.key}
                            onSelect={() => setSelectedSuit(s.key)}
                        />
                    ))}
                </View>
                <View style={{ flexDirection: "row", gap: spacing(2) }}>
                    {SUITS.slice(2, 4).map(s => (
                        <SuitCard
                            key={s.key}
                            suit={s.key}
                            symbol={s.symbol}
                            color={s.color}
                            selected={selectedSuit === s.key}
                            onSelect={() => setSelectedSuit(s.key)}
                        />
                    ))}
                </View>
            </View>

            <View style={{ marginTop: spacing(3), alignItems: "center" }}>
                <Text style={{ color: palette.primary, marginBottom: spacing(2) }}>
                    How many sips you wanna bet?
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(2) }}>
                    <CircleButton label="−" onPress={() => setSips(v => Math.max(1, v - 1))} />
                    <Text style={{ color: palette.text, fontSize: 20, width: 28, textAlign: "center" }}>{sips}</Text>
                    <CircleButton label="+" onPress={() => setSips(v => Math.min(20, v + 1))} />
                </View>
            </View>

            <View
                style={{
                    marginTop: "auto",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: spacing(2),
                    paddingBottom: spacing(4),
                }}
            >
                <View style={{ width: "100%" }}>
                    <Button
                        title={idx < players.length - 1 ? "Next" : "Review Bets"}
                        onPress={goNext}
                        disabled={!canNext}
                    />
                </View>
                <View style={{ width: "100%" }}>
                    <Button title="Back" variant="secondary" onPress={goBack} />
                </View>
            </View>
        </View>
    );
}

function SuitCard({
                      suit,
                      symbol,
                      color,
                      selected,
                      onSelect,
                  }: {
    suit: Suit;
    symbol: string;
    color: string;
    selected: boolean;
    onSelect: () => void;
}) {
    return (
        <Pressable onPress={onSelect} style={{ flex: 1 }}>
            <Card
                style={{
                    height: 150,
                    borderRadius: 18,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {selected && (
                    <View
                        style={{
                            position: "absolute",
                            top: spacing(1),
                            right: spacing(1),
                            width: 22,
                            height: 22,
                            borderRadius: 11,
                            backgroundColor: "#2F6FEB",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Text style={{ color: "#fff", fontWeight: "800" }}>✓</Text>
                    </View>
                )}
                <Text style={{ fontSize: 48, color }}>{symbol}</Text>
            </Card>
        </Pressable>
    );
}

function CircleButton({ label, onPress }: { label: string; onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: palette.primary,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>{label}</Text>
        </Pressable>
    );
}
