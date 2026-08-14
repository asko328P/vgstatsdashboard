import { View } from "react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { PlayerStats } from "@/app/viewPlayers";
import { ThemedText } from "@/components/ui/ThemedText";
import { adjustColorBrightness, timeSince } from "@/utils/functions";

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
  if (item.kills > 6000) {
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

  return (
    <View style={[playerRowStyles.row, styles.container]}>
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
        <ThemedText>{item.rounds}</ThemedText>
      </View>
      <View style={playerRowStyles.cell}>
        <ThemedText style={styles.revives}>{item.revivals}</ThemedText>
      </View>
      <View style={playerRowStyles.cell}>
        <ThemedText>{timeSince(item.last_seen)}</ThemedText>
      </View>
    </View>
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
      value > 3
        ? theme.colors.accentMedic
        : value < 1
          ? theme.colors.accentSelect
          : theme.colors.textPrimary,
  }),
  revives: {
    color: theme.colors.accentMedic,
  },
  container: {
    backgroundColor: theme.colors.surface1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderHairline,
  },
}));
