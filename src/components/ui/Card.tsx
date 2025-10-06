import { View, ViewProps } from "react-native";
import { palette, radius, spacing, shadow } from "../../theme/theme";

export default function Card({ children, style, ...rest }: ViewProps) {
    return (
        <View
            style={[
                {
                    backgroundColor: palette.surface,
                    borderRadius: radius.lg,
                    padding: spacing(2),
                    ...shadow.card,
                },
                style,
            ]}
            {...rest}
        >
            {children}
        </View>
    );
}
