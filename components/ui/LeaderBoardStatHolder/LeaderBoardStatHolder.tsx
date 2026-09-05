import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { FontAwesome6, Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { ThemedText } from "@/components/ui/ThemedText";
import { STAT_SEPARATOR } from "@/utils/functions";
import { useSelectedPlayerStore } from "@/zustand/SelectedPlayerStore";

type Props = {
  label: string;
  // "<player_id><US><amount><US><unit>", built with `buildStatValue`. Split on
  // the unit separator rather than a space: player ids contain spaces.
  value: string;
  type?: "medic" | "killer" | "destroyer" | "player";
  statsArray?: { name: string; value: string | number }[];
  isFetching?: boolean;
};

// Row values are usually numbers, but the prop allows a formatted string; a
// value that is not a number simply gets no bar.
const toBarValue = (value: string | number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

type RowItemProps = {
  index: number;
  name: string;
  value: string | number;
  // 0..1 of the headline player's total — how far the bar behind the row fills.
  ratio: number;
  barColor: string;
};

// The runners up under the highlighted player: rank, name, value. The name is
// the player id, so the row doubles as a link to that player's page.
const RowItem = ({ index, name, value, ratio, barColor }: RowItemProps) => {
  const router = useRouter();
  const setSelectedPlayer = useSelectedPlayerStore(
    (state) => state.setSelectedPlayer,
  );

  const pressPlayerHandler = () => {
    setSelectedPlayer(name);
    router.push(`/viewPlayers/${name}`);
  };

  return (
    <TouchableOpacity onPress={pressPlayerHandler} style={styles.row}>
      {/* First child, so the text paints over it. */}
      <View pointerEvents={"none"} style={styles.bar(ratio * 100, barColor)} />
      <View style={styles.indexCell}>
        <ThemedText type={"cell"} style={styles.index}>
          {index}
        </ThemedText>
      </View>
      <ThemedText type={"name"} numberOfLines={1} style={styles.rowName}>
        {name}
      </ThemedText>
      <ThemedText type={"cell"} style={styles.rowValue}>
        {value}
      </ThemedText>
    </TouchableOpacity>
  );
};

const LeaderBoardStatHolder = ({
  label,
  value,
  type = "medic",
  statsArray = [],
  isFetching,
}: Props) => {
  const [topName, topValue, topUnit] = value.split(STAT_SEPARATOR);

  // Bars are measured against the headline player, so the runner up reads as a
  // fraction of #1 instead of filling the card edge to edge. When the headline
  // has no usable number ("-" on an empty range) the rows scale among themselves.
  const barMax = useMemo(() => {
    const headline = Number(topValue);
    if (Number.isFinite(headline) && headline > 0) {
      return headline;
    }
    return statsArray.reduce(
      (max, item) => Math.max(max, toBarValue(item.value)),
      0,
    );
  }, [topValue, statsArray]);

  const colors = useMemo(() => {
    switch (type) {
      case "medic":
        return {
          typeColor: UnistylesRuntime.getTheme().colors.accentMedic,
        };
      case "destroyer":
        return {
          typeColor: UnistylesRuntime.getTheme().colors.accentVehicle,
        };
      case "killer":
        return {
          typeColor: UnistylesRuntime.getTheme().colors.accentKill,
        };
      case "player":
        return {
          typeColor: UnistylesRuntime.getTheme().colors.accentSelect,
        };
      default:
        return {
          typeColor: UnistylesRuntime.getTheme().colors.accentMedic,
        };
    }
  }, [type]);

  return (
    <View
      style={[
        styles.dataHolder,
        {
          borderColor: colors.typeColor,
        },
      ]}
    >
      <View style={styles.topPart}>
        {type === "medic" && (
          <Ionicons
            style={{ position: "absolute", right: 8, top: 6, opacity: 0.2 }}
            name="bandage-sharp"
            size={90}
            color={UnistylesRuntime.getTheme().colors.accentMedic}
          />
        )}
        {type === "killer" && (
          <SimpleLineIcons
            style={{ position: "absolute", right: 8, top: 6, opacity: 0.2 }}
            name="target"
            size={90}
            color={UnistylesRuntime.getTheme().colors.accentKill}
          />
        )}
        {type === "destroyer" && (
          <FontAwesome6
            name="explosion"
            style={{ position: "absolute", right: 8, top: 20, opacity: 0.2 }}
            size={60}
            color={UnistylesRuntime.getTheme().colors.accentVehicle}
          />
        )}
        <ThemedText
          type={"log"}
          style={{
            color: colors.typeColor,
          }}
        >
          {`• ${label}`}
        </ThemedText>
        <ThemedText type={"name"} style={{ fontSize: 20 }}>
          {topName}
        </ThemedText>
        <ThemedText
          style={{
            color: colors.typeColor,
          }}
          type={"stat"}
        >
          {topValue}
          <ThemedText type={"label"}>{` ${topUnit}`}</ThemedText>
        </ThemedText>
      </View>

      {isFetching && (
        <ActivityIndicator
          style={styles.loadingIndicator}
          color={colors.typeColor}
        />
      )}

      {statsArray?.length !== 0 && (
        <View style={styles.rowsHolder}>
          {statsArray.map((item, index) => (
            <RowItem
              key={item.name}
              // The card's headline player is #1, so the list picks up at #2.
              index={index + 2}
              name={item.name}
              value={item.value}
              ratio={barMax > 0 ? toBarValue(item.value) / barMax : 0}
              barColor={colors.typeColor}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default LeaderBoardStatHolder;

const styles = StyleSheet.create((theme) => ({
  loadingIndicator: {
    position: "absolute",
    top: theme.margins.md,
    right: theme.margins.md,
  },
  topPart: {
    padding: 10,
    paddingTop: 10,
    paddingBottom: 0,
    gap: theme.margins.md,
  },
  rowsHolder: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderHairline,
  },
  // Full bleed fill behind a row, sized to that player's share of the leader.
  // Kept faint enough to sit under the text rather than compete with it, and
  // quieter than the card's background icon.
  bar: (widthPercent: number, color: string) => ({
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    height: 3,
    borderRadius: 5,
    width: `${Math.max(0, Math.min(100, widthPercent))}%`,
    backgroundColor: color,
    opacity: 0.65,
  }),
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.md,
    paddingHorizontal: theme.margins.md,
    paddingVertical: theme.margins.mdlg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderHairline,
  },
  // Fixed width so the names line up no matter how wide the rank gets.
  indexCell: {
    width: 20,
  },
  index: {
    color: theme.colors.textMuted,
  },
  rowName: {
    flex: 1,
    flexShrink: 1,
  },
  rowValue: {
    color: theme.colors.textPrimary,
  },
  dateAndSeparator: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.xl,
  },
  dataHolderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  dataHolder: {
    maxWidth: 600,
    // Grow to share the row, but never below minWidth — that's what forces a wrap.
    flexGrow: 1,
    flexBasis: 220,
    minWidth: 220,
    backgroundColor: theme.colors.surface1,
    justifyContent: "space-around",
    // padding: 10,
    // paddingTop: 10,
    // paddingBottom: 0,
    // aspectRatio: 1.2,
    // borderRadius: 10,
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
    borderTopWidth: 2,
    overflow: "hidden",
    // gap: 20,
  },
}));
