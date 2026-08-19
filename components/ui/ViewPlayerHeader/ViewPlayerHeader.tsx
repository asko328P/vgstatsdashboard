import { Linking, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { Feather, Ionicons } from "@expo/vector-icons";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import {
  SelectedPlayerState,
  useSelectedPlayerStore,
} from "@/zustand/SelectedPlayerStore";
import { PlayerStats } from "@/app/viewPlayers";
import Chip, { getChips } from "@/components/ui/Chip/Chip";
import { useAuthStore } from "@/zustand/AuthStore";
import LogoutButton from "@/components/ui/LogoutButton/LogoutButton";

type Props = {
  headerTitle: string;
  player?: PlayerStats | null;
  onBackPress?: () => void;
};

const ViewPlayerHeader = ({ headerTitle, player, onBackPress }: Props) => {
  const textPrimary = UnistylesRuntime.getTheme().colors.textPrimary;
  const surfaceBase = UnistylesRuntime.getTheme().colors.surfaceBase;

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const setSelectedPlayer = useSelectedPlayerStore(
    (state) => state.setSelectedPlayer,
  );
  const closePlayer = () => {
    setSelectedPlayer("");
  };

  // No row yet while the query is in flight, so no badges to show.
  const chips = player ? getChips(player) : [];

  return (
    <View style={styles.container(isLoggedIn)}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Ionicons name={"chevron-back"} size={24} color={textPrimary} />
      </TouchableOpacity>

      <View style={styles.titleHolder}>
        <ThemedText type={"micro"}>{"PLAYERS /"}</ThemedText>
        <ThemedText type={"heading"} style={styles.title}>
          {headerTitle}
        </ThemedText>
        {chips.map((chip) => (
          <Chip key={chip.text} text={chip.text} color={chip.color} />
        ))}
      </View>

      <View style={styles.spacer} />

      <LogoutButton />
    </View>
  );
};

export default ViewPlayerHeader;

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
    alignItems: "center",
    flexDirection: "row",
    // A long callsign plus several badges has to wrap rather than overflow.
    flexWrap: "wrap",
    flexShrink: 1,
    gap: theme.margins.md,
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
  container: (isLoggedIn: boolean) => ({
    backgroundColor: theme.colors.surface1,
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.margins.lg,
    paddingHorizontal: { xs: theme.margins.lg, md: 25 },
    paddingVertical: 15,
    borderBottomColor: "#1d1f22",
    borderBottomWidth: 2,
    borderTopColor: isLoggedIn ? theme.colors.accentMedic : "transparent",
    borderTopWidth: 2,
  }),
}));
