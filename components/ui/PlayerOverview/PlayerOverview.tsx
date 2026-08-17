import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { ThemedText } from "@/components/ui/ThemedText";
import { timeSince, toTimestamp } from "@/utils/functions";

// "2024-01-28T09:32:00+00:00" -> "2024-01-28". toTimestamp already handles the
// timezone parsing, so take the day half of what it returns.
const toDay = (isoString?: string) =>
  isoString ? toTimestamp(isoString).split(" • ")[0] : "";

// "positive" is the green reading — a favClass worth calling out, an account in
// good standing.
type Tone = "default" | "positive";

type Row = {
  label: string;
  value: string;
  tone?: Tone;
};

type Props = {
  callsign: string;
  createdAt?: string;
  firstRoundAt?: string;
  firstRoundMap?: string;
  lastSeenAt?: string;
  lastSeenMap?: string;
  favClass?: string;
  favMap?: string;
  favMapRounds?: number;
  favWeapon?: string;
  favWeaponKillShare?: number;
  status?: string;
};

// Joins the parts of a value that are actually known, so a missing map does not
// leave a dangling separator.
const join = (...parts: (string | number | undefined | null)[]) =>
  parts.filter(Boolean).join(" · ");

const PlayerOverview = ({
  callsign,
  createdAt,
  firstRoundAt,
  firstRoundMap,
  lastSeenAt,
  lastSeenMap,
  favClass,
  favMap,
  favMapRounds,
  favWeapon,
  favWeaponKillShare,
  status,
}: Props) => {
  const rows: Row[] = [
    {
      label: "Account",
      value: createdAt ? `Created ${toDay(createdAt)}` : "",
    },
    {
      label: "First round",
      value: join(toDay(firstRoundAt), firstRoundMap),
    },
    {
      label: "Last seen",
      value: join(lastSeenAt && timeSince(lastSeenAt), lastSeenMap),
    },
    { label: "Fav class", value: favClass ?? "", tone: "positive" },
    {
      label: "Fav map",
      value: join(favMap, favMapRounds && `${favMapRounds} rounds`),
    },
    {
      label: "Fav weapon",
      value: join(
        favWeapon,
        favWeaponKillShare && `${Math.round(favWeaponKillShare)}% of kills`,
      ),
    },
    { label: "Status", value: status ?? "", tone: "positive" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.callsignHolder}>
        <ThemedText type={"label"} style={styles.callsignLabel}>
          {"CALLSIGN"}
        </ThemedText>
        <ThemedText type={"title"}>{callsign}</ThemedText>
      </View>

      <View style={styles.rows}>
        {rows
          .filter((row) => !!row.value)
          .map((row) => (
            <View key={row.label} style={styles.row}>
              <ThemedText type={"micro"} style={styles.rowLabel}>
                {row.label}
              </ThemedText>
              <ThemedText type={"cell"} style={styles.rowValue(row.tone)}>
                {row.value}
              </ThemedText>
            </View>
          ))}
      </View>
    </View>
  );
};

export default PlayerOverview;

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface1,
    borderWidth: 1,
    borderColor: theme.colors.borderHairline,
    // The gold cap is the only piece of chrome the panel gets.
    borderTopWidth: 3,
    borderTopColor: theme.colors.primary,
    borderRadius: 2,
    padding: { xs: theme.margins.lg, md: theme.margins.xl },
    gap: theme.margins.xl,
  },
  callsignHolder: {
    gap: theme.margins.md,
    paddingBottom: theme.margins.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderHairline,
  },
  callsignLabel: {
    color: theme.colors.primary,
  },
  rows: {
    gap: theme.margins.mdlg,
  },
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: theme.margins.lg,
  },
  // A fixed label column keeps every value on the same left edge; the value
  // wraps inside what is left rather than pushing the row wider.
  rowLabel: {
    textTransform: "uppercase",
    width: { xs: 90, md: 110 },
  },
  rowValue: (tone: Tone = "default") => ({
    flexShrink: 1,
    color:
      tone === "positive" ? theme.colors.accentMedic : theme.colors.textPrimary,
  }),
}));
