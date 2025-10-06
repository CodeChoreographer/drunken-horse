import { useState } from "react";
import { View, Text, FlatList, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { palette, spacing } from "../theme/theme";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

// UUID-Import (nach Installation von uuid + react-native-get-random-values)
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

type Player = { id: string; name: string };

export default function LobbyScreen() {
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [name, setName] = useState("");
    const [players, setPlayers] = useState<Player[]>([]);

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

    return (
        <View style={{ flex: 1, backgroundColor: palette.background, padding: spacing(3) }}>
            <Text style={{ color: palette.text, fontSize: 28, fontWeight: "800", marginBottom: spacing(1) }}>
                Player Lobby
            </Text>
            <Text style={{ color: palette.muted, marginBottom: spacing(3) }}>
                Add at least two players to continue.
            </Text>

            <Card style={{ marginBottom: spacing(2) }}>
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

            <View style={{ gap: spacing(2) }}>
                <Button
                    title="Continue"
                    onPress={() => {
                        if (!canContinue) return;
                        Alert.alert("Ready", "Next: Bet Selection (we’ll wire it next).");
                        // nav.navigate("Bet");
                    }}
                    disabled={!canContinue}
                />
                <Button title="Back" variant="secondary" onPress={() => nav.goBack()} />
            </View>
        </View>
    );
}
