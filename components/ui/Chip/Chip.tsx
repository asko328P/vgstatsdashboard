import { View } from "react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { PlayerStats } from "@/app/viewPlayers";
import { ThemedText } from "@/components/ui/ThemedText";
import { adjustColorBrightness, daysSince } from "@/utils/functions";

export type ChipProps = {
  text: string;
  color: string;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Every badge a player has earned, most notable first.
export const getChips = (item: PlayerStats) => {
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
  if (item.rounds > 50 && item.rounds / daysSince(item.created_at) > 0.3) {
    chips.push({
      text: "regular",
      color: adjustColorBrightness(colors.surface3, 10),
    });
  }

  return chips;
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

export default Chip;

const styles = StyleSheet.create((theme) => ({
  chip: (color: string) => ({
    backgroundColor: adjustColorBrightness(color, -50),
    borderWidth: 1,
    borderRadius: 5,
    borderColor: color,
    paddingHorizontal: theme.margins.md,
  }),
}));
