import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/WelcomeScreen";
import LobbyScreen from "../screens/LobbyScreen";

export type RootStackParamList = {
    Welcome: undefined;
    Lobby: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Lobby" component={LobbyScreen} />
        </Stack.Navigator>
    );
}
