import { Image, ImageProps, StyleProp, ImageStyle } from "react-native";
import type { Card } from "../../types/cards";
import { cardToCode } from "../cardCode";
import { getImageByCode } from "../../assets/cardImages";

type Props = { card: Card; style?: StyleProp<ImageStyle>; } & Omit<ImageProps,"source">;

export function CardImage({ card, style, ...rest }: Props) {
    return (
        <Image
            source={getImageByCode(cardToCode(card))}
            resizeMode="contain"
            style={[{ width: 96, height: 134 }, style]}
            {...rest}
        />
    );
}
