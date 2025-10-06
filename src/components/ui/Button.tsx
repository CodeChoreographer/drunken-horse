import { TouchableOpacity, Text, GestureResponderEvent } from "react-native";
import { palette, spacing, radius, shadow } from "../../theme/theme";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps {
    title: string;
    onPress?: (e: GestureResponderEvent) => void;
    variant?: Variant;
    disabled?: boolean;
    fullWidth?: boolean;
}

export default function Button({
                                   title,
                                   onPress,
                                   variant = "primary",
                                   disabled = false,
                                   fullWidth = true,
                               }: ButtonProps) {
    const background =
        variant === "primary"
            ? palette.primary
            : variant === "secondary"
                ? palette.accent
                : palette.danger;

    return (
        <TouchableOpacity
            disabled={disabled}
            onPress={onPress}
            style={{
                backgroundColor: disabled ? "#555" : background,
                borderRadius: radius.lg,
                paddingVertical: spacing(2),
                paddingHorizontal: spacing(3),
                opacity: disabled ? 0.7 : 1,
                width: fullWidth ? "100%" : undefined,
                ...shadow.card,
            }}
        >
            <Text
                style={{
                    textAlign: "center",
                    fontWeight: "700",
                    color: variant === "primary" ? "#000" : "#fff",
                }}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
}
