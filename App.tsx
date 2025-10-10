import "react-native-get-random-values";
import { useState, useEffect, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme, Theme } from "@react-navigation/native";
import { View, ActivityIndicator, Text } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { Asset } from "expo-asset";                  // 👈 NEU: Assets vorladen
import { setAudioModeAsync } from "expo-audio";       // 👈 NEU: Audio-Mode global setzen

import RootNavigator from "./src/navigation/RootNavigator";
import { palette } from "./src/theme/theme";
import { usePreloadCards } from "./src/assets/usePreloadCards";

const appTheme: Theme = {
    ...DefaultTheme,
    dark: true,
    colors: {
        ...DefaultTheme.colors,
        background: palette.background,
        card: palette.surface,
        border: palette.surface,
        text: palette.text,
        primary: palette.primary,
        notification: palette.accent,
    },
};

async function preloadAppAssets() {
    const assets = [
        require("./assets/DrunkenHorse_Icon_APP.png"),
        require("./assets/DrunkenHorse_Icon.png"),
        require("./assets/DrunkenHorse_Logo.png"),
        // 🔊 Audio
        require("./assets/audio/Race_loop.mp3"),
        require("./assets/audio/Winner.mp3"),
    ];
    await Asset.loadAsync(assets);

    // globalen Audio-Mode einmal setzen
    try {
        await setAudioModeAsync({ playsInSilentMode: true });
    } catch {}
}

export default function App() {
    const cardsReady = usePreloadCards();   // dein bestehendes Karten-Preload
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [assetsReady, setAssetsReady] = useState(false);

    // Internetstatus beobachten
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected);
        });
        return () => unsubscribe();
    }, []);

    // App-Assets (Audio+Bilder) vorladen
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                await preloadAppAssets();
            } catch (e) {
                console.warn("Preload error:", e);
            } finally {
                if (!cancelled) setAssetsReady(true);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const ready = cardsReady && assetsReady;

    if (!ready) {
        const message =
            isConnected === false
                ? "Karten für Offlinefunktion werden geladen..."
                : "Lade Spieldaten...";

        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: palette.background,
                }}
            >
                <ActivityIndicator size="large" color={palette.primary} />
                <Text style={{ color: palette.text, marginTop: 16, fontSize: 16 }}>
                    {message}
                </Text>
            </View>
        );
    }

    return (
        <NavigationContainer theme={appTheme}>
            <StatusBar style="light" />
            <RootNavigator />
        </NavigationContainer>
    );
}
