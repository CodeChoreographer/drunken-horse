import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    Image,
    Alert,
    Animated,
    LayoutChangeEvent,
    Pressable,
    ImageSourcePropType,
} from "react-native";
import { Accelerometer } from "expo-sensors";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import type { Player, Bet, Suit } from "../types/game";
import { palette, spacing } from "../theme/theme";
import Button from "../components/ui/Button";
import rules from "../data/rules_drunken_horse.json";
// für lokales Deck
import { generateDeck } from "../types/cards";
import { shuffle } from "../utils/shuffle";
import { getImageByCode } from "../assets/cardImages";

// Suits
const SUIT_ORDER: Suit[] = ["HEARTS", "DIAMONDS", "CLUBS", "SPADES"];
const SUIT_SYMBOL: Record<Suit, string> = { HEARTS: "♥", DIAMONDS: "♦", CLUBS: "♣", SPADES: "♠" };
const SUIT_COLOR: Record<Suit, string> = { HEARTS: "#E53935", DIAMONDS: "#E53935", CLUBS: "#000000", SPADES: "#000000" };

// Rennen / Layout
const TRACK_LENGTH = 8;                 // 8 Felder ⇒ 7 Zwischenkarten
const SIDELINE_COUNT = TRACK_LENGTH - 1;
const TRACK_HEIGHT = 28;
const MARKER_SIZE = 30;
const MARKER_BOX = 35;
const RAIL_HEIGHT = 84;
const TOP_CARD_W = 140;
const TOP_CARD_H = 196;

// Shake Einstellungen
const SHAKE_THRESHOLD_G = 3.4;
const SHAKE_COOLDOWN_MS = 1000;

const CARD_BACK = require("../../assets/card-back-orange.png");

// Bildquellen vereinheitlichen (API-URI oder lokales require)
type DrawnCard = { suit: Suit; imageSource: ImageSourcePropType };
type SideCard  = { suit: Suit; rank: string; imageSource: ImageSourcePropType; faceUp: boolean; flip: Animated.Value };

// Hilfsfunktion: lokales Bild aus Suit+Rank (A,2..K)
const suitShort: Record<Suit, "S" | "H" | "D" | "C"> = {
    SPADES: "S",
    HEARTS: "H",
    DIAMONDS: "D",
    CLUBS: "C",
};
const localImageFor = (suit: Suit, rank: string): ImageSourcePropType =>
    getImageByCode(`${rank}${suitShort[suit]}`);

export default function GameScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { players, bets } = route.params as { players: Player[]; bets: Bet[] };

    // Modus/Deck-Verwaltung
    const [mode, setMode] = useState<"api" | "local">("api");
    const [deckId, setDeckId] = useState<string | null>(null);              // nur für API-Modus
    const [localDeck, setLocalDeck] = useState<{ suit: Suit; rank: string }[]>([]); // lokales Deck
    const [localIdx, setLocalIdx] = useState(0);

    // Rennzustand
    const [positions, setPositions] = useState<Record<Suit, number>>({
        HEARTS: 0, DIAMONDS: 0, CLUBS: 0, SPADES: 0,
    });
    const markerProg = useRef<Record<Suit, Animated.Value>>({
        HEARTS: new Animated.Value(0),
        DIAMONDS: new Animated.Value(0),
        CLUBS: new Animated.Value(0),
        SPADES: new Animated.Value(0),
    }).current;

    // letzte gezogene Karte (bleibt sichtbar bis zur nächsten)
    const [lastCard, setLastCard] = useState<DrawnCard | null>(null);
    const cardFade = useRef(new Animated.Value(0)).current;
    const fadeInCard = useCallback(() => {
        cardFade.setValue(0);
        Animated.timing(cardFade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    }, [cardFade]);

    // Sideline
    const [sideline, setSideline] = useState<SideCard[]>([]);
    const [laneWidth, setLaneWidth] = useState(0);

    // Deck initialisieren + Sideline laden (API → Fallback lokal)
    const initDeckWithSideline = useCallback(async () => {
        try {
            // ONLINE: frisches API-Deck + 7 Karten für die Sideline
            const newDeckRes = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
            const newDeck = await newDeckRes.json();
            const id = newDeck.deck_id as string;

            const drawRes = await fetch(`https://deckofcardsapi.com/api/deck/${id}/draw/?count=${SIDELINE_COUNT}`);
            const drawJson = await drawRes.json();
            let cards = drawJson.cards;

            if (!cards?.length || cards.length < SIDELINE_COUNT) {
                await fetch(`https://deckofcardsapi.com/api/deck/${id}/shuffle/`);
                const drawRes2 = await fetch(`https://deckofcardsapi.com/api/deck/${id}/draw/?count=${SIDELINE_COUNT}`);
                cards = (await drawRes2.json()).cards;
            }

            const rankMap: Record<string, string> = { ACE: "A", KING: "K", QUEEN: "Q", JACK: "J" };
            const side: SideCard[] = (cards ?? []).slice(0, SIDELINE_COUNT).map((c: any) => {
                const rank = rankMap[c.value?.toUpperCase()] ?? c.value; // "A","2"..,"K"
                const suit = (c.suit as string).toUpperCase() as Suit;
                return {
                    suit,
                    rank,
                    imageSource: { uri: c.image as string },
                    faceUp: false,
                    flip: new Animated.Value(0),
                };
            });


            setDeckId(id);
            setMode("api");
            setSideline(side);
            setLocalDeck([]);
            setLocalIdx(0);
        } catch {
            // OFFLINE: lokales Deck + lokale Bilder
            const deck = shuffle(generateDeck());
            const sideLocal: SideCard[] = deck.slice(0, SIDELINE_COUNT).map((c) => ({
                suit: c.suit,
                rank: c.rank,
                imageSource: localImageFor(c.suit, c.rank),
                faceUp: false,
                flip: new Animated.Value(0),
            }));

            setDeckId(null);
            setMode("local");
            setSideline(sideLocal);
            setLocalDeck(deck.slice(SIDELINE_COUNT)); // Rest bleibt zum Ziehen
            setLocalIdx(0);
        }
    }, []);

    useEffect(() => {
        (async () => {
            try { await initDeckWithSideline(); }
            catch {
                // wenn hier etwas schiefgeht, fallbacken wir nochmal sicherheitshalber lokal
                const deck = shuffle(generateDeck());
                const sideLocal: SideCard[] = deck.slice(0, SIDELINE_COUNT).map((c) => ({
                    suit: c.suit, rank: c.rank, imageSource: localImageFor(c.suit, c.rank), faceUp: false, flip: new Animated.Value(0),
                }));
                setDeckId(null);
                setMode("local");
                setSideline(sideLocal);
                setLocalDeck(deck.slice(SIDELINE_COUNT));
                setLocalIdx(0);
            }
        })();
    }, [initDeckWithSideline]);

    // Marker sanft bewegen
    const animateMarkerTo = (suit: Suit, nextStep: number) => {
        const prog = Math.min(nextStep / TRACK_LENGTH, 1);
        Animated.timing(markerProg[suit], { toValue: prog, duration: 250, useNativeDriver: false }).start();
    };

    const isColumnReady = (c: number, pos: Record<Suit, number>) => SUIT_ORDER.every((s) => (pos[s] ?? 0) >= c);

    const resetRace = useCallback(async () => {
        setPositions({ HEARTS: 0, DIAMONDS: 0, CLUBS: 0, SPADES: 0 });
        SUIT_ORDER.forEach((s) => markerProg[s].setValue(0));
        setLastCard(null);
        setFinished(false);
        await initDeckWithSideline();
    }, [initDeckWithSideline, markerProg]);

    const flipAndRetreat = useCallback((idx: number, sc?: SideCard) => {
        if (!sc) return;
        Animated.timing(sc.flip, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        setSideline((prev) => {
            const copy = [...prev];
            if (copy[idx]) copy[idx] = { ...copy[idx], faceUp: true };
            return copy;
        });
        setPositions((prev) => {
            const val = Math.max(0, (prev[sc.suit] ?? 0) - 1);
            const next = { ...prev, [sc.suit]: val };
            animateMarkerTo(sc.suit, val);
            return next;
        });
    }, []);

    const [isDrawing, setIsDrawing] = useState(false);
    const [finished, setFinished] = useState(false);

    // Karte ziehen (Button/Shake) – mit Auto-Failover: API → lokal
    const drawCard = useCallback(async () => {
        if (isDrawing || finished) return;
        setIsDrawing(true);
        try {
            if (mode === "api" && deckId) {
                // ONLINE: API ziehen
                const j = await (async () => {
                    const r = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
                    const jj = await r.json();
                    if (jj.success && jj.cards?.length) return jj;
                    await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`);
                    const r2 = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
                    return await r2.json();
                })();

                const card = j.cards?.[0];
                const suit = (card?.suit as string | undefined)?.toUpperCase() as Suit | undefined;
                if (!suit) return;

                setLastCard({ suit, imageSource: { uri: card.image as string } });
                fadeInCard();

                // Fortschritt
                setPositions((cur) => {
                    const nextVal = Math.min((cur[suit] ?? 0) + 1, TRACK_LENGTH);
                    const nextPositions: Record<Suit, number> = { ...cur, [suit]: nextVal };
                    animateMarkerTo(suit, nextVal);

                    // Sideline: kleinste reife Spalte flippen
                    let readyIdx = -1;
                    for (let c = 1; c <= SIDELINE_COUNT; c++) {
                        const idx = c - 1;
                        if (!sideline[idx]?.faceUp && isColumnReady(c, nextPositions)) { readyIdx = idx; break; }
                    }
                    if (readyIdx >= 0) flipAndRetreat(readyIdx, sideline[readyIdx]);

                    const winner = (Object.keys(nextPositions) as Suit[]).find((s) => nextPositions[s] >= TRACK_LENGTH);
                    if (winner) {
                        setFinished(true);
                        navigation.navigate("Winner", { players, bets, winningSuit: winner });
                    }
                    return nextPositions;
                });
            } else {
                // OFFLINE: lokal ziehen
                const c = localDeck[localIdx];
                if (!c) return; // Deckende (kommt praktisch nicht vor)
                setLastCard({ suit: c.suit, imageSource: localImageFor(c.suit, c.rank) });
                fadeInCard();

                setPositions((cur) => {
                    const nextVal = Math.min((cur[c.suit] ?? 0) + 1, TRACK_LENGTH);
                    const nextPositions: Record<Suit, number> = { ...cur, [c.suit]: nextVal };
                    animateMarkerTo(c.suit, nextVal);

                    let readyIdx = -1;
                    for (let col = 1; col <= SIDELINE_COUNT; col++) {
                        const idx = col - 1;
                        if (!sideline[idx]?.faceUp && isColumnReady(col, nextPositions)) { readyIdx = idx; break; }
                    }
                    if (readyIdx >= 0) flipAndRetreat(readyIdx, sideline[readyIdx]);

                    const winner = (Object.keys(nextPositions) as Suit[]).find((s) => nextPositions[s] >= TRACK_LENGTH);
                    if (winner) {
                        setFinished(true);
                        navigation.navigate("Winner", { players, bets, winningSuit: winner });
                    }
                    return nextPositions;
                });

                setLocalIdx((i) => i + 1);
            }
        } catch {
            // ➜ Mitten im Spiel Netz weg oder API down → sofort auf lokal umschalten
            const deck = shuffle(generateDeck());

            // Sideline-Frontbilder auf lokale Assets umstellen (Suit passt optisch)
            setSideline((prev) =>
                prev.map((sc) => ({ ...sc, imageSource: localImageFor(sc.suit, sc.rank ?? "A") }))
            );

            setMode("local");
            setDeckId(null);
            setLocalDeck(deck);
            setLocalIdx(0);

            // direkt eine lokale Karte ziehen, damit der Flow nicht abreisst
            const c = deck[0];
            setLastCard({ suit: c.suit, imageSource: localImageFor(c.suit, c.rank) });
            fadeInCard();
            setPositions((cur) => {
                const nextVal = Math.min((cur[c.suit] ?? 0) + 1, TRACK_LENGTH);
                const next = { ...cur, [c.suit]: nextVal };
                animateMarkerTo(c.suit, nextVal);
                return next;
            });
            setLocalIdx(1);
        } finally {
            setIsDrawing(false);
        }
    }, [mode, deckId, isDrawing, finished, localDeck, localIdx, sideline, navigation, players, bets, fadeInCard, flipAndRetreat]);

    // Shake-to-Draw
    const lastShake = useRef(0);
    useEffect(() => {
        let sub: any;
        (async () => {
            try {
                await Accelerometer.setUpdateInterval(100);
                sub = Accelerometer.addListener(({ x, y, z }) => {
                    const g = Math.sqrt(x * x + y * y + z * z);
                    const now = Date.now();
                    if (g > SHAKE_THRESHOLD_G && now - lastShake.current > SHAKE_COOLDOWN_MS) {
                        lastShake.current = now; drawCard();
                    }
                });
            } catch {}
        })();
        return () => sub?.remove();
    }, [drawCard]);

    const showRules = () => {
        const msg = rules.map((r: any) => `${r.icon ? r.icon + "  " : ""}${r.text}`).join("\n\n");
        Alert.alert("Rules", msg, [{ text: "OK" }], { cancelable: true });
    };
    const confirmBackHome = () => {
        Alert.alert("Back to lobby?", "", [
            { text: "Cancel", style: "cancel" },
            { text: "Yes", onPress: () => navigation.navigate("Lobby") },
        ]);
    };

    return (
        <View style={{ flex: 1, backgroundColor: palette.background, padding: spacing(3) }}>
            <View style={{ position: "absolute", top: spacing(4), left: spacing(2), right: spacing(2), zIndex: 5, flexDirection: "row", justifyContent: "space-between" }}>
                <TinyIconButton label="🏠" onPress={confirmBackHome} />
                <TinyIconButton label="📜" onPress={showRules} />
            </View>

            <View style={{ alignItems: "center", marginBottom: spacing(3), marginTop: spacing(6), gap: spacing(2) }}>
                <View style={{ width: TOP_CARD_W, height: TOP_CARD_H, borderRadius: 10, overflow: "hidden" }}>
                    {lastCard ? (
                        <Animated.Image
                            source={lastCard.imageSource}
                            style={{
                                width: "100%", height: "100%", opacity: cardFade,
                                transform: [{ translateY: cardFade.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
                            }}
                            resizeMode="cover"
                        />
                    ) : (
                        <Image source={CARD_BACK} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                    )}
                </View>

                <View style={{ width: "100%" }}>
                    <Button title={`Draw Card ${mode === "api" ? "🌐" : "📴"}`} onPress={drawCard} disabled={isDrawing || finished} />
                </View>
            </View>

            <View
                style={{ flex: 1, position: "relative", paddingBottom: RAIL_HEIGHT }}
                onLayout={(e: LayoutChangeEvent) => setLaneWidth(e.nativeEvent.layout.width)}
            >
                <View style={{ gap: spacing(6) }}>
                    {SUIT_ORDER.map((s, i) => (
                        <TrackRow
                            key={s}
                            suit={s}
                            symbol={SUIT_SYMBOL[s]}
                            symbolColor={SUIT_COLOR[s]}
                            barColor={i % 2 === 0 ? "#356AE6" : "#FF7A00"}
                            progressAnim={markerProg[s]}
                            laneWidth={laneWidth}
                        />
                    ))}
                </View>

                <SidelineRail laneWidth={laneWidth} sideline={sideline} trackLength={TRACK_LENGTH} />
            </View>

            <View style={{ height: spacing(6) }} />
        </View>
    );
}

function TinyIconButton({ label, onPress }: { label: string; onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.12)",
                alignItems: "center", justifyContent: "center",
            }}
            hitSlop={10}
        >
            <Text style={{ fontSize: 18 }}>{label}</Text>
        </Pressable>
    );
}

function SidelineRail({
                          laneWidth,
                          sideline,
                          trackLength,
                      }: {
    laneWidth: number;
    sideline: SideCard[];
    trackLength: number;
}) {
    if (!laneWidth || sideline.length === 0) return null;

    const CARD_W = Math.max(42, Math.min(64, (laneWidth / (SIDELINE_COUNT + 0.5)) * 0.8));
    const CARD_H = Math.round(CARD_W * 1.4);
    const PERSPECTIVE = 600;

    const xForColumn = (c: number) => {
        const span = laneWidth - MARKER_BOX;
        const base = span * (c / trackLength);
        const centerAdjust = (MARKER_BOX - CARD_W) / 2;
        return Math.max(0, Math.min(laneWidth - CARD_W, base + centerAdjust));
    };

    return (
        <View
            pointerEvents="none"
            style={{
                position: "absolute",
                left: 0, right: 0, bottom: 0,
                height: RAIL_HEIGHT, justifyContent: "center", zIndex: 2,
            }}
        >
            {sideline.map((sc, idx) => {
                const col = idx + 2;
                const x = xForColumn(col);

                const rotateY = sc.flip.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
                const backOpacity = sc.flip.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] });
                const frontOpacity = sc.flip.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });

                return (
                    <Animated.View
                        key={idx}
                        style={{
                            position: "absolute",
                            left: x,
                            width: CARD_W,
                            height: CARD_H,
                            transform: [{ perspective: PERSPECTIVE }, { rotateY }],
                        }}
                    >
                        <Animated.View
                            style={{ position: "absolute", inset: 0, borderRadius: 8, overflow: "hidden", opacity: backOpacity }}
                        >
                            <Image source={CARD_BACK} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                        </Animated.View>

                        <Animated.View
                            style={{
                                position: "absolute", inset: 0, borderRadius: 8, overflow: "hidden",
                                opacity: frontOpacity, transform: [{ rotateY: "180deg" }],
                            }}
                        >
                            <Image source={sc.imageSource} style={{ width: "100%", height: "100%" }} />
                        </Animated.View>
                    </Animated.View>
                );
            })}
        </View>
    );
}

function TrackRow({
                      suit,
                      symbol,
                      symbolColor,
                      barColor,
                      progressAnim,
                      laneWidth,
                  }: {
    suit: Suit;
    symbol: string;
    symbolColor: string;
    barColor: string;
    progressAnim: Animated.Value;
    laneWidth: number;
}) {
    const translateX = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Math.max(0, (laneWidth || 0) - MARKER_BOX)],
    });

    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(2), height: TRACK_HEIGHT }}>
            <Text style={{ fontSize: 21, width: 24, textAlign: "center", color: symbolColor }}>{symbol}</Text>
            <View
                style={{
                    flex: 1, height: TRACK_HEIGHT, backgroundColor: "rgba(255,255,255,0.12)",
                    borderRadius: TRACK_HEIGHT / 2, overflow: "visible", position: "relative", justifyContent: "center",
                }}
            >
                <View style={{ position: "absolute", left: 0, right: 0, height: 4, backgroundColor: barColor, opacity: 0.9 }} />
                <Animated.View
                    style={{
                        position: "absolute", left: 0, width: MARKER_BOX, height: MARKER_BOX,
                        transform: [{ translateX }], alignItems: "center", justifyContent: "center",
                    }}
                >
                    <Text style={{ fontSize: MARKER_SIZE, includeFontPadding: false, textAlignVertical: "center", lineHeight: MARKER_SIZE + 2, transform: [{ scaleX: -1 }] }}>
                        🐎
                    </Text>
                </Animated.View>
            </View>
        </View>
    );
}
