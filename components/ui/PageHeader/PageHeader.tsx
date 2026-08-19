//@ts-nocheck
//cursor: "not-allowed" works but screams in red
import { TextInput, TouchableOpacity, View } from "react-native";
import { ThemedText, fonts } from "@/components/ui/ThemedText";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "expo-router";
import { supabase } from "@/utils/supabase";
import { timeSince, toReadableDate } from "@/utils/functions";
import { useAuthStore } from "@/zustand/AuthStore";
import LogoutButton from "@/components/ui/LogoutButton/LogoutButton";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";

type PageButtonProps = {
  name: string;
  currentPath: string;
  notAllowed?: boolean;
};
export const PageButton = ({
  name,
  currentPath,
  notAllowed = false,
}: PageButtonProps) => {
  const router = useRouter();
  const path = `/${name.toLowerCase()}`;
  const isActive =
    currentPath === path ||
    (currentPath === "/" && name === BUTTON_NAMES.rounds) ||
    (currentPath === "/viewPlayers" && name === BUTTON_NAMES.players);

  const navigate = () => {
    if (name === BUTTON_NAMES.rounds && currentPath !== "/") {
      router.replace("/");
      return;
    }
    if (name === BUTTON_NAMES.players && currentPath !== "/viewPlayers") {
      router.replace("/viewPlayers");
      return;
    }
    if (name === BUTTON_NAMES.maps && currentPath !== "/viewMaps") {
      router.replace("/viewMaps");
      return;
    }
  };
  return (
    <TouchableOpacity
      disabled={notAllowed}
      onPress={navigate}
      // @ts-ignore
      style={styles.pageButton(isActive, notAllowed)}
    >
      <ThemedText type={"label"}>{name}</ThemedText>
    </TouchableOpacity>
  );
};

const BUTTON_NAMES = {
  players: "PLAYERS",
  rounds: "ROUNDS",
  maps: "MAPS",
};

type Props = {};

const PageHeader = ({}: Props) => {
  const [syncDate, setSyncDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const currentPath = usePathname();
  // The full timestamp is the first thing to go once the header gets tight.
  const { rt } = useUnistyles();
  const showFullSyncDate = rt.breakpoint !== "xs" && rt.breakpoint !== "sm";

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("sync_time")
        .select(`created_at`)
        .order("id", {
          ascending: false,
        })
        .limit(1)
        .overrideTypes<[{ created_at: string }]>();

      if (data) {
        setSyncDate(data[0]?.created_at);
      }
    };

    fetchData();
  }, []);

  const signIn = async () => {
    if (!email || !password) return;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      setEmail("");
      setPassword("");
    }
  };

  const primary = UnistylesRuntime.getTheme().colors.primary;
  const textMuted = UnistylesRuntime.getTheme().colors.textMuted;
  const accentMedic = UnistylesRuntime.getTheme().colors.accentMedic;
  return (
    <View style={styles.container(isLoggedIn)}>
      <View style={styles.brandAndNav}>
        <ThemedText type={"title"} style={{ color: primary }}>
          {"[ "}
          <ThemedText type={"title"}>{"VG.STATS"}</ThemedText>
          <ThemedText type={"title"} style={{ color: primary }}>
            {" ]"}
          </ThemedText>
        </ThemedText>
        <View style={styles.nav}>
          <PageButton name={BUTTON_NAMES.rounds} currentPath={currentPath} />
          <PageButton name={BUTTON_NAMES.players} currentPath={currentPath} />
          <PageButton
            name={BUTTON_NAMES.maps}
            currentPath={currentPath}
            notAllowed
          />
        </View>
      </View>
      <View style={styles.rightSide}>
        {!isLoggedIn && (
          <View style={styles.login}>
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
          </View>
        )}
        <ThemedText style={styles.text} numberOfLines={1}>
          {showFullSyncDate ? `Last synced: ${toReadableDate(syncDate)} · ` : ""}
          <ThemedText
            style={[{ color: accentMedic }, styles.text]}
          >{`${timeSince(syncDate)}`}</ThemedText>
        </ThemedText>
        <LogoutButton />
      </View>
    </View>
  );
};

export default PageHeader;

const styles = StyleSheet.create((theme) => ({
  brandAndNav: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.margins.xl,
    flexShrink: 1,
  },
  nav: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  pageButton: (isActive: boolean, notAllowed: boolean) => ({
    cursor: notAllowed ? "not-allowed" : "pointer",
    backgroundColor: isActive ? theme.colors.surface3 : theme.colors.surface1,
    borderColor: isActive ? theme.colors.borderStrong : theme.colors.surface1,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: theme.margins.lg,
    paddingVertical: theme.margins.sm,
  }),
  text: {
    textTransform: "uppercase",
  },
  rightSide: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.margins.md,
    flexShrink: 1,
  },
  // Has to be shrinkable itself, otherwise it keeps its full intrinsic width
  // and the inputs inside never run out of room to wrap.
  login: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: theme.margins.sm,
    flexShrink: 1,
  },
  input: {
    minWidth: 120,
    flexShrink: 1,
    color: theme.colors.textPrimary,
    fontFamily: fonts.mono,
    fontSize: 12,
    backgroundColor: theme.colors.surface2,
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: theme.margins.md,
    paddingVertical: theme.margins.sm,
  },
  container: (isLoggedIn: boolean) => ({
    backgroundColor: theme.colors.surface1,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 25,
    paddingVertical: 25,
    borderBottomColor: "#1d1f22",
    borderBottomWidth: 2,
    borderTopColor: isLoggedIn ? theme.colors.accentMedic : "transparent",
    borderTopWidth: 2,
  }),
}));
