import {Platform, View, Text, Alert, Image, TouchableOpacity} from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { palette, spacing } from "../theme/theme";
import Button from "../components/ui/Button";
import rules from "../data/rules_drunken_horse.json";

export default function WelcomeScreen() {
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [acknowledged, setAcknowledged] = useState(false);
    const [funText, setFunText] = useState("The ultimate party experience");

    const funnyLines = [
        "Horse ahead, shots behind!",
        "Gallop before you gulp!",
        "Don’t drink and ride",
        "Bet you drink!",
        "May the best horse stumble last!",
        "Ride hard. Drink harder.",
        "Place your bets — and your liver.",
        "Hooves up, bottoms up!",
        "Gallop, gulp, repeat",
        "Saddle up — it’s shot o’clock!"
    ];

    const changeText = () => {
        const random = funnyLines[Math.floor(Math.random() * funnyLines.length)];
        setFunText(random);
    };

    useEffect(() => {
        // Wenn Web: direkt freischalten, kein Alert
        if (Platform.OS === "web") {
            setAcknowledged(true);
            return;
        }

        // Auf Mobile normal mit Alert
        Alert.alert(
            "Drink responsibly",
            "Please enjoy Drunken Horse responsibly. By continuing, you confirm you are of legal drinking age in your country.",
            [{ text: "I agree", onPress: () => setAcknowledged(true) }],
            { cancelable: false }
        );
    }, []);

    const showRules = () => {
        const msg = (rules as any[])
            .map((r) => `${r.icon ? r.icon + "  " : ""}${r.text}`)
            .join("\n\n");
        Alert.alert("Rules", msg, [{ text: "OK" }], { cancelable: true });
    };

    if (!acknowledged) {
        return <View style={{ flex: 1, backgroundColor: palette.background }} />;
    }

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: palette.background,
                padding: spacing(3),
                justifyContent: "center",
            }}
        >
            <TouchableOpacity onPress={changeText} activeOpacity={0.8}>
                <Image
                    source={require("../../assets/DrunkenHorse_Logo-transparent.png")}
                    style={{
                        width: 240,
                        height: 240,
                        alignSelf: "center",
                        marginBottom: spacing(2),
                    }}
                    resizeMode="contain"
                />
            </TouchableOpacity>

            <Text
                style={{
                    color: palette.text,
                    fontSize: 36,
                    fontWeight: "800",
                    textAlign: "center",
                    marginBottom: spacing(1),
                }}
            >
                Drunken Horse
            </Text>

            <Text
                style={{
                    color: palette.muted,
                    fontSize: 16,
                    textAlign: "center",
                    marginBottom: spacing(6),
                }}
            >
                {funText}
            </Text>

            <View style={{ gap: spacing(2) }}>
                <Button title="Start Game" onPress={() => nav.navigate("Lobby")} />
                <Button title="Rules" variant="secondary" onPress={showRules} />
            </View>

            <Text
                style={{
                    color: palette.muted,
                    textAlign: "center",
                    marginTop: spacing(10),
                    opacity: 0.8,
                }}
            >
                DrunkenHorse © CodeChoreographer
            </Text>
        </View>
    );
}
