import "react-native-get-random-values";
import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme, Theme } from "@react-navigation/native";
import { View, ActivityIndicator, Text } from "react-native";
import NetInfo from "@react-native-community/netinfo";

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

export default function App() {
  const ready = usePreloadCards();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Internetstatus beobachten
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

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
