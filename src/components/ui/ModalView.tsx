import { Modal, View, Text, TouchableOpacity } from "react-native";
import { palette, spacing, radius, shadow } from "../../theme/theme";

interface ModalViewProps {
    visible: boolean;
    title?: string;
    message?: string;
    onClose?: () => void;
}

export default function ModalView({
                                      visible,
                                      title,
                                      message,
                                      onClose,
                                  }: ModalViewProps) {
    return (
        <Modal animationType="fade" transparent visible={visible}>
            <View
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <View
                    style={{
                        backgroundColor: palette.surface,
                        borderRadius: radius.lg,
                        padding: spacing(3),
                        width: "80%",
                        ...shadow.card,
                    }}
                >
                    {title && (
                        <Text
                            style={{
                                color: palette.text,
                                fontWeight: "800",
                                fontSize: 20,
                                marginBottom: spacing(1),
                            }}
                        >
                            {title}
                        </Text>
                    )}
                    {message && (
                        <Text
                            style={{
                                color: palette.text,
                                marginBottom: spacing(3),
                                opacity: 0.9,
                            }}
                        >
                            {message}
                        </Text>
                    )}
                    <TouchableOpacity
                        onPress={onClose}
                        style={{
                            backgroundColor: palette.primary,
                            borderRadius: radius.lg,
                            padding: spacing(2),
                        }}
                    >
                        <Text
                            style={{ textAlign: "center", fontWeight: "700", color: "#000" }}
                        >
                            OK
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
