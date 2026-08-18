import { ScrollView, View } from "react-native";
import { useMemo } from "react";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { GameRoundPlayer } from "@/app/viewDemo";
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

// Bars are measured against the best round in the set rather than against the
// other bar in their own pair, so heights stay comparable across the chart.
const ReviveItem = ({ gameRound, maxValue }: KDItemProps) => {
  const surfaceColor = UnistylesRuntime.getTheme().colors.surface2;
  // Surviving the round makes the ratio unbounded; "∞" reads better than the
  // "Infinity" that toFixed would produce. Nothing at all is a plain 0.0.

  return (
    <View style={styles.reviveItemContainer}>
      <LinearGradient
        colors={[surfaceColor, "transparent"]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={{ position: "absolute", height: "100%", width: "100%" }}
      />
      <ThemedText>{gameRound.revivals}</ThemedText>
      <View style={styles.barsHolder}>
        <View
          style={[
            styles.bar(gameRound.revivals / maxValue),
            { backgroundColor: accentMedic },
          ]}
        />
      </View>
      {/*<ThemedText style={{ textAlign: "center", minHeight: 30 }} type={"micro"}>*/}
      {/*  {formatRoundTitle(gameRound.game_round_id)*/}
      {/*    .split(" ")*/}
      {/*    .slice(0, -3)*/}
      {/*    .join(" ")}*/}
      {/*</ThemedText>*/}
    </View>
  );
};

const RevivesOverView = ({ gameRounds }: Props) => {
  const maxRevives = gameRounds.reduce((max, current) =>
    current.revivals > max.revivals ? current : max,
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText
          type={"label"}
        >{`Revives · last ${gameRounds.length} rounds`}</ThemedText>
        <ThemedText
          type={"label"}
          style={{ color: accentMedic }}
        >{`PEAK ${maxRevives.revivals}`}</ThemedText>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.horizontalScrollContainer}
        horizontal={true}
      >
        {gameRounds.map((item) => (
          <ReviveItem
            maxValue={maxRevives.revivals}
            key={item.game_round_id}
            gameRound={item}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default RevivesOverView;

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
  barsHolder: {
    justifyContent: "center",
    flex: 1,
    gap: 5,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  reviveItemContainer: {
    alignItems: "center",
    flex: 1,
    minHeight: 100,
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
    // flex: 1,
    backgroundColor: theme.colors.surface1,
    borderWidth: 1,
    borderColor: theme.colors.borderHairline,
    borderRadius: 2,
    padding: { xs: theme.margins.lg, md: theme.margins.xl },
    paddingBottom: { xs: theme.margins.sm },
    gap: theme.margins.xl,
  },
}));
