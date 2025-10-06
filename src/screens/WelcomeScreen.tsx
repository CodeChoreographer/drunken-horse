import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { palette, spacing, radius } from "../theme/theme";
import Button from "../components/ui/Button";

export default function WelcomeScreen() {
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
                <Button title="Rules" variant="secondary" onPress={() => nav.navigate("Rules" as any)} />
            </View>

            <Text style={{ color: palette.muted, textAlign:"center", marginTop: spacing(6), opacity: 0.8 }}>
            DrunkenHorse © CodeChoreographer
            </Text>
        </View>
    );
}
