import { TextInput, TextInputProps } from "react-native";
import { palette, spacing, radius } from "../../theme/theme";

export default function Input(props: TextInputProps) {
    return (
        <TextInput
            placeholderTextColor={palette.muted}
            style={{
                backgroundColor: palette.surface,
                color: palette.text,
                paddingHorizontal: spacing(2),
                paddingVertical: spacing(2),
                borderRadius: radius.lg,
                marginBottom: spacing(2),
            }}
            {...props}
        />
    );
}
