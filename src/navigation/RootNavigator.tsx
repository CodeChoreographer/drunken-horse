import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/WelcomeScreen";
import LobbyScreen from "../screens/LobbyScreen";
import BetSelectionScreen from "../screens/BetSelectionScreen";
import ConfirmBetsScreen from "../screens/ConfirmBetsScreen";
import GameScreen from "../screens/GameScreen";
import {Player, Bet } from "../types/game";

export type RootStackParamList = {
    Welcome: undefined;
    Lobby: undefined;
    Bet: { players: Player[]; initialBets?: Bet[] };
    Confirm: { players: Player[]; bets: Bet[] };
    Game: { players: Player[]; bets: Bet[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Lobby" component={LobbyScreen} />
            <Stack.Screen name="Bet" component={BetSelectionScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="Confirm" component={ConfirmBetsScreen} />
        </Stack.Navigator>
    );
}
