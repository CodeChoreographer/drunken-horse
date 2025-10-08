import { useEffect, useState } from "react";
import { Asset } from "expo-asset";
import { CARD_IMAGES } from "./cardImages";

export function usePreloadCards() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        (async () => {
            await Promise.all(
                Object.values(CARD_IMAGES).map((m) =>
                    Asset.fromModule(m).downloadAsync()
                )
            );
            setReady(true);
        })();
    }, []);

    return ready;
}
