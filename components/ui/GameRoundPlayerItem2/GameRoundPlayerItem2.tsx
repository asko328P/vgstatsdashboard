import { TouchableOpacity, View } from "react-native";
import { GameRoundPlayer } from "@/utils/queries";
import { ThemedText } from "@/components/ui/ThemedText";
import { interpolateColor } from "react-native-reanimated";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { Feather } from "@expo/vector-icons";
import {
  SelectedPlayerState,
  useSelectedPlayerStore,
} from "@/zustand/SelectedPlayerStore";
import { formatSquadName, isSquadLeader } from "@/utils/functions";

// Shared by the row and by the list header so both stay aligned.
export const rowStyles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.md,
    paddingHorizontal: theme.margins.md,
    paddingVertical: theme.margins.md,
  },
  nameCell: (isSelected: boolean = false) => ({
    flexDirection: "row",
    gap: UnistylesRuntime.getTheme().margins.sm,
    flexWrap: "wrap",
    alignItems: "center",
    flex: 2,
    minWidth: 67,
  }),
  cell: (isSelected: boolean = false) => ({
    flex: 0.5,
    flexShrink: 1,
    alignItems: "flex-end",
  }),
}));

type Props = {
  item: GameRoundPlayer;
  onPress?: (playerId: string) => void;
  roundLength?: number;
  // Set when the squads data says this player led a squad; falls back to the
  // lead-time heuristic for rounds without it.
  isSquadLead?: boolean;
};

const GameRoundPlayerItem2 = ({
  item,
  onPress,
  roundLength,
  isSquadLead,
}: Props) => {
  const setSelectedPlayer = useSelectedPlayerStore(
    (state) => state.setSelectedPlayer,
  );
  const selectedPlayer = useSelectedPlayerStore(
    (state: SelectedPlayerState) => state.selectedPlayer,
  );

  const isSelected = selectedPlayer === item.player_id;
  const isLeader =
    isSquadLead ?? isSquadLeader(item.total_time_as_squad_lead, roundLength);
  const squadName = formatSquadName(item.squad_name);

  const pressPlayerHandler = () => {
    setSelectedPlayer(item.player_id);
  };

  return (
    <TouchableOpacity
      onPress={pressPlayerHandler}
      style={[rowStyles.row, styles.container(isSelected)]}
    >
      <View style={rowStyles.nameCell()}>
        {isLeader && (
          <Feather
            name={"chevrons-up"}
            size={14}
            color={UnistylesRuntime.getTheme().colors.accentSquadLead}
          />
        )}
        <ThemedText
          style={styles.name(isSelected, isLeader)}
          type={"name"}
          numberOfLines={1}
        >
          {item.player_id}
        </ThemedText>
      </View>
      <View style={rowStyles.cell()}>
        <ThemedText type={"cell"}>{item.score}</ThemedText>
      </View>
      <View style={rowStyles.cell()}>
        <ThemedText type={"cell"}>{item.scoreTW}</ThemedText>
      </View>
      <View style={rowStyles.cell()}>
        <ThemedText type={"cell"}>{item.kills}</ThemedText>
      </View>
      <View style={rowStyles.cell()}>
        <ThemedText type={"cell"}>{item.deaths}</ThemedText>
      </View>
      <View style={rowStyles.cell()}>
        <ThemedText
          type={"cell"}
          style={{
            color: interpolateColor(
              item.teamkills,
              [1, 4],
              [
                UnistylesRuntime.getTheme().colors.textPrimary,
                UnistylesRuntime.getTheme().colors.accentKill,
              ],
            ),
          }}
        >
          {item.teamkills}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

export default GameRoundPlayerItem2;

const styles = StyleSheet.create((theme) => ({
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.sm,
  },
  name: (isSelected: boolean, isSquadLead: boolean = false) => ({
    color: isSelected
      ? theme.colors.accentSelect
      : isSquadLead
        ? theme.colors.accentSquadLead
        : theme.colors.textPrimary,
  }),
  squadName: {
    color: theme.colors.accentSquadLead,
    opacity: 0.7,
    // Line the label up with the name rather than the shield icon.
    marginLeft: 11 + theme.margins.sm,
  },
  container: (isSelected: boolean) => ({
    backgroundColor: isSelected
      ? theme.colors.selectBackground
      : theme.colors.surface1,
    borderLeftWidth: isSelected ? 3 : 0,
    borderLeftColor: theme.colors.accentSelect,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderHairline,
  }),
}));
