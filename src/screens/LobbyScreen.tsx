import { useEffect, useState } from "react";
import { View, Text, FlatList, Alert, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import type { Player } from "../types/game";
import { palette, spacing } from "../theme/theme";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";
// 👇 JSON-Regeln importieren
import rules from "../data/rules_drunken_horse.json";

const PLAYERS_KEY = "drunken-horse/players";

export default function LobbyScreen() {
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [name, setName] = useState("");
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(PLAYERS_KEY);
                if (raw) {
                    const saved = JSON.parse(raw) as Player[];
                    setPlayers(Array.isArray(saved) ? saved : []);
                }
            } catch (e) {
                console.warn("failed to load players", e);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                await AsyncStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
            } catch (e) {
                console.warn("failed to save players", e);
            }
        })();
    }, [players]);

    const addPlayer = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        if (players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
            Alert.alert("Duplicate", "Player name already exists.");
            return;
        }
        setPlayers(prev => [...prev, { id: uuidv4(), name: trimmed }]);
        setName("");
    };

    const removePlayer = (id: string) => setPlayers(prev => prev.filter(p => p.id !== id));
    const canContinue = players.length >= 2;

    // 👉 Regeln anzeigen (gleich wie im GameScreen)
    const showRules = () => {
        const msg = (rules as any[]).map(r => `${r.icon ? r.icon + "  " : ""}${r.text}`).join("\n\n");
        Alert.alert("Rules", msg, [{ text: "OK" }], { cancelable: true });
    };

    return (
        <View style={{ flex: 1, backgroundColor: palette.background, padding: spacing(3) }}>
            {/* 📜 oben rechts */}
            <View style={{ position: "absolute", top: spacing(2), right: spacing(2), zIndex: 5 }}>
                <TinyIconButton label="📜" onPress={showRules} />
            </View>

            <Text style={{ color: palette.text, fontSize: 28, fontWeight: "800", marginBottom: spacing(1), marginTop: spacing(2) }}>
                Player Lobby
            </Text>
            <Text style={{ color: palette.muted, marginBottom: spacing(3) }}>
                Add at least two players to continue.
            </Text>

            <Card style={{ marginBottom: spacing(2), gap: spacing(1) }}>
                <Input
                    placeholder="Enter player name"
                    value={name}
                    onChangeText={setName}
                    onSubmitEditing={addPlayer}
                    returnKeyType="done"
                />
                <Button title="Add Player" onPress={addPlayer} />
            </Card>

            <FlatList
                data={players}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: spacing(1), paddingBottom: spacing(3) }}
                ListEmptyComponent={
                    <Text style={{ color: palette.muted, textAlign: "center", marginTop: spacing(3) }}>
                        No players yet. Add your first one!
                    </Text>
                }
                renderItem={({ item }) => (
                    <Card style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text style={{ color: palette.text, fontSize: 16 }}>{item.name}</Text>
                        <Text
                            onPress={() => removePlayer(item.id)}
                            style={{
                                color: "#ff6b6b",
                                fontWeight: "800",
                                paddingHorizontal: spacing(1),
                                paddingVertical: spacing(1),
                            }}
                        >
                            Remove
                        </Text>
                    </Card>
                )}
            />

            <View style={{ gap: spacing(2), marginBottom: spacing(4) }}>
                <Button
                    title="Continue"
                    onPress={() => {
                        if (!canContinue) return;
                        nav.navigate("Bet", { players });
                    }}
                    disabled={!canContinue}
                />
                <Button title="Back" variant="secondary" onPress={() => nav.navigate("Welcome")} />
            </View>
        </View>
    );
}

function TinyIconButton({ label, onPress }: { label: string; onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.12)",
                alignItems: "center", justifyContent: "center", marginTop: 25,
            }}
            hitSlop={10}
        >
            <Text style={{ fontSize: 18 }}>{label}</Text>
        </Pressable>
    );
}
