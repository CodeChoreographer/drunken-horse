import { View, Text, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { palette, spacing } from "../theme/theme";
import Button from "../components/ui/Button";
// 👇 Regeln einbinden
import rules from "../data/rules_drunken_horse.json";

export default function WelcomeScreen() {
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const showRules = () => {
        const msg = (rules as any[]).map(r => `${r.icon ? r.icon + "  " : ""}${r.text}`).join("\n\n");
        Alert.alert("Rules", msg, [{ text: "OK" }], { cancelable: true });
    };

    return (
        <View style={{ flex:1, backgroundColor: palette.background, padding: spacing(3), justifyContent:"center" }}>
            <Text style={{ color: palette.text, fontSize: 36, fontWeight: "800", textAlign:"center", marginBottom: spacing(2) }}>
                Drunken Horse
            </Text>
            <Text style={{ color: palette.muted, fontSize: 16, textAlign:"center", marginBottom: spacing(6) }}>
                The ultimate party experience
            </Text>

            <View style={{ gap: spacing(2) }}>
                <Button title="Start Game" onPress={() => nav.navigate("Lobby")} />
                <Button title="Rules" variant="secondary" onPress={showRules} />
            </View>

            <Text style={{ color: palette.muted, textAlign:"center", marginTop: spacing(6), opacity: 0.8 }}>
                DrunkenHorse © CodeChoreographer
            </Text>
        </View>
    );
}
