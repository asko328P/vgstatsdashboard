import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { supabase } from "@/utils/supabase";
import { useAuthStore } from "@/zustand/AuthStore";
import { ThemedText } from "@/components/ui/ThemedText";

type Props = {};

// Renders nothing while signed out, so every header can drop it in
// unconditionally.
const LogoutButton = ({}: Props) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const textMuted = UnistylesRuntime.getTheme().colors.textMuted;

  const onLogoutPress = async () => {
    await supabase.auth.signOut();
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <TouchableOpacity onPress={onLogoutPress} style={styles.button}>
      <ThemedText type={"micro"}>{"logout"}</ThemedText>
      {/*<Feather name={"log-out"} size={14} color={textMuted} />*/}
    </TouchableOpacity>
  );
};

export default LogoutButton;

const styles = StyleSheet.create((theme) => ({
  button: {
    cursor: "pointer",
    backgroundColor: theme.colors.surface3,
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.margins.md,
    paddingVertical: theme.margins.sm,
  },
}));
