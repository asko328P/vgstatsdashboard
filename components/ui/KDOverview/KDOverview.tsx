import { ScrollView, View } from "react-native";
import { useMemo } from "react";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { GameRoundPlayer } from "@/utils/queries";
import { ThemedText } from "@/components/ui/ThemedText";
import { LinearGradient } from "expo-linear-gradient";
import { formatRoundTitle } from "@/utils/functions";

type Props = {
  gameRounds: GameRoundPlayer[];
};

type KDItemProps = {
  gameRound: GameRoundPlayer;
  maxValue: number;
};

const accentKill = UnistylesRuntime.getTheme().colors.accentKill;
const accentDeath = UnistylesRuntime.getTheme().colors.surface3;
const accentMedic = UnistylesRuntime.getTheme().colors.accentMedic;
// Kills are a saturated fill, deaths a plain surface — each needs its own
// readable label color.
const killLabelColor = UnistylesRuntime.getTheme().colors.textOnAccent;
const deathLabelColor = UnistylesRuntime.getTheme().colors.textPrimary;

type BarProps = {
  value: number;
  maxValue: number;
  color: string;
  labelColor: string;
};

// The count is laid over the foot of the bar, so every bar reads its value on
// the same baseline no matter how tall it grows.
const Bar = ({ value, maxValue, color, labelColor }: BarProps) => (
  <View style={styles.barTrack}>
    <View style={[styles.bar(value / maxValue), { backgroundColor: color }]} />
    <ThemedText type={"micro"} style={[styles.barValue, { color: labelColor }]}>
      {value}
    </ThemedText>
  </View>
);

// Bars are measured against the best round in the set rather than against the
// other bar in their own pair, so heights stay comparable across the chart.
const KDItem = ({ gameRound, maxValue }: KDItemProps) => {
  const surfaceColor = UnistylesRuntime.getTheme().colors.surface2;
  // Surviving the round makes the ratio unbounded; "∞" reads better than the
  // "Infinity" that toFixed would produce. Nothing at all is a plain 0.0.
  const kd = gameRound.deaths
    ? (gameRound.kills / gameRound.deaths).toFixed(1)
    : gameRound.kills
      ? "∞"
      : "0.0";

  return (
    <View style={styles.KDItemContainer}>
      <LinearGradient
        colors={[surfaceColor, "transparent"]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={{ position: "absolute", height: "100%", width: "100%" }}
      />
      <ThemedText>{kd}</ThemedText>
      <View style={styles.barsHolder}>
        <Bar
          value={gameRound.kills}
          maxValue={maxValue}
          color={accentKill}
          labelColor={killLabelColor}
        />
        <Bar
          value={gameRound.deaths}
          maxValue={maxValue}
          color={accentDeath}
          labelColor={deathLabelColor}
        />
      </View>
      <ThemedText style={{ textAlign: "center", minHeight: 30 }} type={"micro"}>
        {formatRoundTitle(gameRound.game_round_id)
          .split(" ")
          .slice(0, -3)
          .join(" ")}
      </ThemedText>
    </View>
  );
};

const KDOverview = ({ gameRounds }: Props) => {
  const maxKills = gameRounds.reduce((max, current) =>
    current.kills > max.kills ? current : max,
  );
  const maxDeaths = gameRounds.reduce((max, current) =>
    current.deaths > max.deaths ? current : max,
  );

  const maxKillAndDeathValue = Math.max(maxKills.kills, maxDeaths.deaths);

  // Total kills over total deaths, not the mean of each round's ratio — a single
  // deathless round would otherwise be an infinite average.
  const averageKD = useMemo(() => {
    const totals = gameRounds.reduce(
      (sum, round) => ({
        kills: sum.kills + round.kills,
        deaths: sum.deaths + round.deaths,
      }),
      { kills: 0, deaths: 0 },
    );

    return totals.deaths ? totals.kills / totals.deaths : totals.kills;
  }, [gameRounds]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText
          type={"label"}
        >{`K/D · last ${gameRounds.length} rounds`}</ThemedText>
        <View style={styles.legendHolder}>
          <View style={styles.colorSquare(accentKill)} />
          <ThemedText type={"label"}>{"KILLS "}</ThemedText>
          <View style={styles.colorSquare(accentDeath)} />
          <ThemedText type={"label"}>{"DEATHS "}</ThemedText>
          <ThemedText
            type={"label"}
          >{`AVG ${averageKD.toFixed(2)}`}</ThemedText>
        </View>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.horizontalScrollContainer}
        horizontal={true}
      >
        {gameRounds.map((item) => (
          <KDItem
            maxValue={maxKillAndDeathValue}
            key={item.game_round_id}
            gameRound={item}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default KDOverview;

const styles = StyleSheet.create((theme) => ({
  // The bars size themselves as a percentage, so every ancestor up to here needs
  // a resolved height: `flex` on the ScrollView, `flexGrow` on its content.
  scroll: {
    flex: 1,
  },
  horizontalScrollContainer: {
    flexGrow: 1,
    gap: theme.margins.md,
    paddingBottom: 10,
  },
  // A round with no kills, or an empty set, must not produce NaN%.
  bar: (fraction: number) => ({
    borderTopStartRadius: 3,
    borderTopEndRadius: 3,
    height: `${(Number.isFinite(fraction) ? Math.max(0, Math.min(1, fraction)) : 0) * 100}%`,
    minHeight: 3,
    width: 30,
  }),
  // Full height so the bar percentage resolves against the whole chart area.
  barTrack: {
    height: "100%",
    width: 30,
    justifyContent: "flex-end",
  },
  // Laid over the bar rather than stacked above it, so it never steals height.
  barValue: {
    position: "absolute",
    bottom: 3,
    left: 0,
    right: 0,
    textAlign: "center",
  },
  barsHolder: {
    flex: 1,
    gap: 5,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  KDItemContainer: {
    // backgroundColor: theme.colors.surface2,
    flex: 1,
    gap: theme.margins.sm,
    alignItems: "center",
    minHeight: 100,
    maxWidth: 150,
  },
  colorSquare: (color: string) => ({
    backgroundColor: color,
    width: 13,
    height: 13,
  }),
  legendHolder: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.md,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  container: {
    // minHeight: 230,
    flex: 1,
    backgroundColor: theme.colors.surface1,
    borderWidth: 1,
    borderColor: theme.colors.borderHairline,
    borderRadius: 2,
    padding: { xs: theme.margins.lg, md: theme.margins.xl },
    paddingBottom: { xs: theme.margins.sm },
    gap: theme.margins.xl,
  },
}));
