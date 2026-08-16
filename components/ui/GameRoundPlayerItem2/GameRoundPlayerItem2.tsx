import { TouchableOpacity, View } from "react-native";
import { GameRoundPlayer } from "@/app/viewDemo";
import { ThemedText } from "@/components/ui/ThemedText";
import { interpolateColor } from "react-native-reanimated";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import {
  SelectedPlayerState,
  useSelectedPlayerStore,
} from "@/zustand/SelectedPlayerStore";

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
};

const GameRoundPlayerItem2 = ({ item, onPress }: Props) => {
  const setSelectedPlayer = useSelectedPlayerStore(
    (state) => state.setSelectedPlayer,
  );
  const selectedPlayer = useSelectedPlayerStore(
    (state: SelectedPlayerState) => state.selectedPlayer,
  );

  const pressPlayerHandler = () => {
    setSelectedPlayer(item.player_id);
  };

  return (
    <TouchableOpacity
      onPress={pressPlayerHandler}
      style={[
        rowStyles.row,
        styles.container(selectedPlayer === item.player_id),
      ]}
    >
      <View style={rowStyles.nameCell()}>
        <ThemedText
          style={styles.name(selectedPlayer === item.player_id)}
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
  name: (isSelected: boolean) => ({
    color: isSelected ? theme.colors.accentSelect : theme.colors.textPrimary,
  }),
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
