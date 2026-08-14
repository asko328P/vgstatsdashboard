import { TouchableOpacity, View } from "react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { PlayerStats } from "@/app/viewPlayers";
import { ThemedText } from "@/components/ui/ThemedText";
import { adjustColorBrightness, timeSince } from "@/utils/functions";
import {
  SelectedPlayerState,
  useSelectedPlayerStore,
} from "@/zustand/SelectedPlayerStore";

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

type ChipProps = {
  text: string;
  color: string;
};

const Chip = ({ text, color }: ChipProps) => {
  return (
    <View style={styles.chip(color)}>
      <ThemedText
        type={"small"}
        style={{ color: color, textTransform: "uppercase" }}
      >
        {text}
      </ThemedText>
    </View>
  );
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Every badge a player has earned, most notable first.
const getChips = (item: PlayerStats) => {
  const colors = UnistylesRuntime.getTheme().colors;
  const chips: ChipProps[] = [];

  const isNew =
    !!item.created_at &&
    Date.now() - new Date(item.created_at).getTime() < DAY_IN_MS;

  if (isNew) {
    chips.push({ text: "new", color: colors.chanSquad });
  }
  if (item.kills > 10000) {
    chips.push({ text: "killer", color: colors.accentKill });
  }
  if (item.revivals > 600) {
    chips.push({ text: "medic", color: colors.accentMedic });
  }
  if (item.vehicle_destroyeds > 1000) {
    chips.push({ text: "destroyer", color: colors.accentVehicle });
  }
  if (item.teamkills > 200) {
    chips.push({ text: "Saboteur", color: colors.accentWarn });
  }
  if (item.rounds > 50) {
    chips.push({
      text: "regular",
      color: adjustColorBrightness(colors.surface3, 10),
    });
  }

  return chips;
};

const PlayerStatItem = ({ item }: Props) => {
  const chips = getChips(item);

  const setSelectedPlayer = useSelectedPlayerStore(
    (state) => state.setSelectedPlayer,
  );
  const selectedPlayer = useSelectedPlayerStore(
    (state: SelectedPlayerState) => state.selectedPlayer,
  );

  const pressPlayerHandler = () => {
    setSelectedPlayer(item.id);
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
  chip: (color: string) => ({
    backgroundColor: adjustColorBrightness(color, -50),
    borderWidth: 1,
    borderRadius: 5,
    borderColor: color,
    paddingHorizontal: theme.margins.md,
  }),
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
