import { Linking, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { Feather, Ionicons } from "@expo/vector-icons";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import {
  SelectedPlayerState,
  useSelectedPlayerStore,
} from "@/zustand/SelectedPlayerStore";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/zustand/AuthStore";
import LogoutButton from "@/components/ui/LogoutButton/LogoutButton";
import LoginButton from "@/components/ui/LoginButton/LoginButton";
import {
  HEADER_MIN_HEIGHT,
  HEADER_PADDING_VERTICAL,
} from "@/unistyles/constants";

type Props = {
  headerTitle: string;
  mapType?: string;
  bottomLabel?: string;
  selectedPlayer?: string;
  download_link?: string;
  onBackPress?: () => void;
};

const DemoHeader = ({
  headerTitle,
  mapType,
  bottomLabel,
  selectedPlayer,
  download_link,
  onBackPress,
}: Props) => {
  const router = useRouter();
  const textPrimary = UnistylesRuntime.getTheme().colors.textPrimary;
  const surfaceBase = UnistylesRuntime.getTheme().colors.surfaceBase;

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const setSelectedPlayer = useSelectedPlayerStore(
    (state) => state.setSelectedPlayer,
  );
  const closePlayer = () => {
    setSelectedPlayer("");
  };

  const onViewPlayerPress = () => {
    router.push(`/viewPlayers/${selectedPlayer}`);
  };

  const onDemoLinkPress = async () => {
    if (!download_link) {
      return;
    }
    const canOpen = await Linking.canOpenURL(download_link);
    if (canOpen) {
      await Linking.openURL(download_link);
    }
  };

  return (
    <View style={styles.container(isLoggedIn)}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Ionicons name={"chevron-back"} size={24} color={textPrimary} />
      </TouchableOpacity>

      <View style={styles.titleHolder}>
        <ThemedText type={"heading"} style={styles.title}>
          {headerTitle}
        </ThemedText>
        {!!bottomLabel && (
          <ThemedText type={"log"} style={styles.bottomLabel}>
            {bottomLabel}
          </ThemedText>
        )}
      </View>

      {!!mapType && (
        <View style={styles.mapType}>
          <ThemedText type={"cell"}>{mapType}</ThemedText>
        </View>
      )}

      {!!download_link && (
        <TouchableOpacity onPress={onDemoLinkPress} style={styles.demoButton}>
          <Feather name={"download"} size={14} color={textPrimary} />
          <ThemedText type={"label"}>{"DOWNLOAD DEMO"}</ThemedText>
        </TouchableOpacity>
      )}

      <View style={styles.spacer} />

      {!!selectedPlayer && (
        <View style={styles.selectedPlayer}>
          <ThemedText type={"label"} style={{ color: surfaceBase }}>
            {selectedPlayer}
          </ThemedText>
          <TouchableOpacity
            onPress={onViewPlayerPress}
            style={styles.clearPlayerButton}
          >
            <Feather name={"chevrons-right"} size={16} color={surfaceBase} />
          </TouchableOpacity>
          <View style={styles.playerSeparator} />
          <TouchableOpacity
            onPress={closePlayer}
            style={styles.clearPlayerButton}
          >
            <Ionicons name={"close"} size={16} color={surfaceBase} />
          </TouchableOpacity>
        </View>
      )}

      <LoginButton />
      <LogoutButton />
    </View>
  );
};

export default DemoHeader;

const styles = StyleSheet.create((theme) => ({
  backButton: {
    backgroundColor: theme.colors.surface3,
    padding: theme.margins.md,
    borderRadius: 4,
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleHolder: {
    gap: 2,
    flexShrink: 1,
    // Keeps the title on the first row with the back button rather than
    // letting a long map name push everything else onto its own line.
    minWidth: 120,
  },
  title: {
    textTransform: "uppercase",
  },
  bottomLabel: {
    color: theme.colors.textMuted,
  },
  mapType: {
    textTransform: "uppercase",
    backgroundColor: theme.colors.surface3,
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.margins.md,
    paddingVertical: theme.margins.sm,
    // paddingBottom: 2,
  },
  demoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.md,
    backgroundColor: theme.colors.surface3,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 4,
    paddingHorizontal: theme.margins.lg,
    paddingVertical: theme.margins.md,
  },
  // A flexing spacer would claim a whole row once the header wraps.
  spacer: {
    display: { xs: "none", md: "flex" },
    flex: 1,
  },
  selectedPlayer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.md,
    backgroundColor: theme.colors.accentSelect,
    borderRadius: 2,
    paddingLeft: theme.margins.lg,
    paddingRight: theme.margins.sm,
    paddingVertical: theme.margins.sm,
  },
  clearPlayerButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  // Sits on the gold chip, so it is the dark ink colour knocked back rather
  // than a border token.
  playerSeparator: {
    width: 1,
    height: 14,
    opacity: 0.4,
    backgroundColor: theme.colors.surfaceBase,
  },
  container: (isLoggedIn: boolean) => ({
    backgroundColor: theme.colors.surface1,
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.margins.lg,
    minHeight: HEADER_MIN_HEIGHT,
    paddingHorizontal: { xs: theme.margins.lg, md: 25 },
    paddingVertical: HEADER_PADDING_VERTICAL,
    borderBottomColor: "#1d1f22",
    borderBottomWidth: 2,
    borderTopColor: isLoggedIn ? theme.colors.accentMedic : "transparent",
    borderTopWidth: 2,
  }),
}));
