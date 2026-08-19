import { Modal, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { supabase } from "@/utils/supabase";
import { useAuthStore } from "@/zustand/AuthStore";
import { ThemedText, fonts } from "@/components/ui/ThemedText";

type Props = {};

// The counterpart to LogoutButton: renders nothing while signed in, so every
// header can drop it in unconditionally. The fields live in a sheet rather than
// in the header itself because two inputs never fit on a phone.
const LoginButton = ({}: Props) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasFailed, setHasFailed] = useState(false);

  const textMuted = UnistylesRuntime.getTheme().colors.textMuted;

  const closeSheet = () => {
    setIsOpen(false);
    setHasFailed(false);
  };

  const signIn = async () => {
    if (!email || !password) return;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setHasFailed(true);
      return;
    }

    setEmail("");
    setPassword("");
    closeSheet();
  };

  if (isLoggedIn) {
    return null;
  }

  return (
    <>
      <TouchableOpacity onPress={() => setIsOpen(true)} style={styles.button}>
        <ThemedText type={"micro"}>{"login"}</ThemedText>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType={"fade"}
        onRequestClose={closeSheet}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeSheet}
          style={styles.backdrop}
        >
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <ThemedText type={"label"}>{"SIGN IN"}</ThemedText>

            <TextInput
              value={email}
              onChangeText={setEmail}
              onSubmitEditing={signIn}
              placeholder={"email"}
              placeholderTextColor={textMuted}
              autoCapitalize={"none"}
              keyboardType={"email-address"}
              style={styles.input}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={signIn}
              placeholder={"password"}
              placeholderTextColor={textMuted}
              autoCapitalize={"none"}
              secureTextEntry
              style={styles.input}
            />

            {hasFailed && (
              <ThemedText type={"micro"} style={styles.error}>
                {"Wrong email or password"}
              </ThemedText>
            )}

            <TouchableOpacity onPress={signIn} style={styles.submit}>
              <ThemedText type={"label"}>{"SIGN IN"}</ThemedText>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default LoginButton;

const styles = StyleSheet.create((theme) => ({
  button: {
    // cursor: "pointer",
    backgroundColor: theme.colors.surface3,
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.margins.md,
    paddingVertical: theme.margins.sm,
  },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.margins.xl,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    // cursor: "default",
  },
  sheet: {
    width: "100%",
    maxWidth: 320,
    gap: theme.margins.md,
    backgroundColor: theme.colors.surface1,
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    borderRadius: 4,
    padding: theme.margins.xl,
    // cursor: "default",
  },
  input: {
    color: theme.colors.textPrimary,
    fontFamily: fonts.mono,
    fontSize: 12,
    backgroundColor: theme.colors.surface2,
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: theme.margins.md,
    paddingVertical: theme.margins.md,
  },
  error: {
    color: theme.colors.accentKill,
  },
  submit: {
    // cursor: "pointer",
    alignItems: "center",
    backgroundColor: theme.colors.surface3,
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: theme.margins.md,
  },
}));
