import { TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { PlayerStats } from "@/app/viewPlayers";
import Chip, { getChips } from "@/components/ui/Chip/Chip";
import { ThemedText } from "@/components/ui/ThemedText";
import { timeSince } from "@/utils/functions";
import {
  SelectedPlayerState,
  useSelectedPlayerStore,
} from "@/zustand/SelectedPlayerStore";
import { useRouter } from "expo-router";

// Shared by the row and by the list header so both stay aligned.
export const playerRowStyles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    padding: theme.margins.md,
  },
  nameCell: {
    gap: theme.margins.md,
    flexDirection: "row",
    alignItems: "center",
    flex: 3,
  },
  cell: {
    paddingRight: 5,
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
}));

type Props = {
  item: PlayerStats;
};

const PlayerStatItem = ({ item }: Props) => {
  const router = useRouter();
  const chips = getChips(item);

  const setSelectedPlayer = useSelectedPlayerStore(
    (state) => state.setSelectedPlayer,
  );
  const selectedPlayer = useSelectedPlayerStore(
    (state: SelectedPlayerState) => state.selectedPlayer,
  );

  const pressPlayerHandler = () => {
    setSelectedPlayer(item.id);
    router.push(`/viewPlayers/${item.id}`);
  };

  return (
    <TouchableOpacity
      onPress={pressPlayerHandler}
      style={[
        playerRowStyles.row,
        styles.container(selectedPlayer === item.id),
      ]}
    >
      <View style={playerRowStyles.nameCell}>
        <ThemedText type={"default"}>{item.id}</ThemedText>
        {chips.map((chip) => (
          <Chip key={chip.text} text={chip.text} color={chip.color} />
        ))}
      </View>
      <View style={playerRowStyles.cell}>
        <ThemedText>{item.rounds}</ThemedText>
      </View>
      <View style={playerRowStyles.cell}>
        <ThemedText style={styles.kd(item.kills / item.deaths)}>
          {(item.kills / item.deaths).toFixed(1)}
        </ThemedText>
      </View>
      <View style={playerRowStyles.cell}>
        <ThemedText>{item.kills}</ThemedText>
      </View>
      <View style={playerRowStyles.cell}>
        <ThemedText style={styles.revives(item.revivals)}>
          {item.revivals}
        </ThemedText>
      </View>
      <View style={playerRowStyles.cell}>
        <ThemedText>{timeSince(item.last_seen)}</ThemedText>
      </View>
    </TouchableOpacity>
  );
};

export default PlayerStatItem;

const styles = StyleSheet.create((theme) => ({
  kd: (value: number) => ({
    color:
      value > 5
        ? theme.colors.accentMedic
        : value < 1
          ? theme.colors.accentSelect
          : theme.colors.textPrimary,
  }),
  revives: (value: number) => ({
    color: value > 30 ? theme.colors.accentMedic : theme.colors.textPrimary,
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
