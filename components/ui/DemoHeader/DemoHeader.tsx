import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import {
  SelectedPlayerState,
  useSelectedPlayerStore,
} from "@/zustand/SelectedPlayerStore";

type Props = {
  headerTitle: string;
  mapType?: string;
  bottomLabel?: string;
  selectedPlayer?: string;
  onBackPress?: () => void;
};

const DemoHeader = ({
  headerTitle,
  mapType,
  bottomLabel,
  selectedPlayer,
  onBackPress,
}: Props) => {
  const textPrimary = UnistylesRuntime.getTheme().colors.textPrimary;
  const surfaceBase = UnistylesRuntime.getTheme().colors.surfaceBase;

  const setSelectedPlayer = useSelectedPlayerStore(
    (state) => state.setSelectedPlayer,
  );
  const closePlayer = () => {
    setSelectedPlayer("");
  };

  return (
    <View style={styles.container}>
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

      <View style={styles.spacer} />

      {!!selectedPlayer && (
        <View style={styles.selectedPlayer}>
          <ThemedText type={"label"} style={{ color: surfaceBase }}>
            {selectedPlayer}
          </ThemedText>
          <TouchableOpacity
            onPress={closePlayer}
            style={styles.clearPlayerButton}
          >
            <Ionicons name={"close"} size={16} color={surfaceBase} />
          </TouchableOpacity>
        </View>
      )}
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
  spacer: {
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
  container: {
    backgroundColor: theme.colors.surface1,
    alignItems: "center",
    flexDirection: "row",
    gap: theme.margins.lg,
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderBottomColor: "#1d1f22",
    borderBottomWidth: 2,
  },
}));
