import "react-native-get-random-values";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme, Theme } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { palette } from "./src/theme/theme";

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
  return (
      <NavigationContainer theme={appTheme}>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
  );
}
