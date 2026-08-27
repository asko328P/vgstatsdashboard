import {
  TouchableOpacity,
  View,
  LayoutChangeEvent,
  ViewStyle,
} from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { GameRoundPlayer } from "@/app/viewDemo";
import { interpolateColor } from "react-native-reanimated";
import MapImage from "@/components/ui/MapImage/MapImage";
import { LinearGradient } from "expo-linear-gradient";
import { useSelectedPlayerStore } from "@/zustand/SelectedPlayerStore";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import {
  findTopPlayer,
  formatDuration,
  formatRoundTitle,
  toTimestamp,
} from "@/utils/functions";

import { Image } from "expo-image";
import DiagonalLinesBackground from "@/assets/images/svg/background/DiagonalLinesBackground";

type TopStatHolderProps = {
  label: string;
  value: string | number;
  dotColor?: string;
};

export const TopStatHolder = ({
  label,
  value,
  dotColor,
}: TopStatHolderProps) => {
  if (!value) return;
  return (
    <View style={styles.topStatHolder}>
      <ThemedText type={"micro"} style={styles.dataHolderLabel}>
        {label}
      </ThemedText>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 30,
            backgroundColor: dotColor,
          }}
        />
        <ThemedText type={"cell"}>{value.toString().trim()}</ThemedText>
      </View>
    </View>
  );
};

type DataHolderProps = {
  label: string;
  value: string | number;
  showBar?: boolean;
  colorValues?: boolean;
  smallText?: boolean;
};

export const DataHolder = ({
  label,
  value,
  showBar = false,
  colorValues = false,
  smallText = false,
}: DataHolderProps) => {
  return (
    <View style={styles.dataHolder}>
      <ThemedText type={"log"} style={styles.dataHolderLabel}>
        {label}
      </ThemedText>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {showBar && <TeamKillBar value={Number(value)} />}
        <ThemedText
          style={[colorValues && styles.value(Number(value))]}
          type={smallText ? "cell" : "metric"}
        >
          {value.toString().trim()}
        </ThemedText>
      </View>
    </View>
  );
};

// A value of 30 should read as a half-full bar, so the track tops out at 60.
const TEAM_KILL_BAR_MAX = 80;
const TEAM_KILL_WARN_AT = 70;
const TEAM_KILL_DANGER_AT = 80;

type TeamKillBarProps = {
  value: number;
};
export const TeamKillBar = ({ value }: TeamKillBarProps) => {
  const ratio =
    Math.min(Math.max(value, 0), TEAM_KILL_BAR_MAX) / TEAM_KILL_BAR_MAX;

  return (
    <View style={styles.teamKillBarTrack}>
      <View style={styles.teamKillBarFill(ratio, value)} />
    </View>
  );
};

// Hatching for rounds nobody played. No SVG in the project, so the stripes are
// rotated views clipped by the overlay.
const STRIPE_SPACING = 14;
const STRIPE_WIDTH = 2;

const DiagonalStripes = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };
  return (
    <View pointerEvents={"none"} onLayout={onLayout} style={styles.stripeLayer}>
      <DiagonalLinesBackground />
    </View>
  );
};

export type GameRound = {
  id: string;
  played_at: string;
  length: number;
  download_link?: string;
};
type Props = {
  gameRound?: GameRound & { game_round_player: GameRoundPlayer[] };
  onLayout?: (e: LayoutChangeEvent) => void;
  style?: ViewStyle;
};
const GameRoundItem2 = ({ gameRound, onLayout, style }: Props) => {
  const router = useRouter();
  // LinearGradient takes plain colors, not a Unistyles style, so read it directly.
  const surface1 = UnistylesRuntime.getTheme().colors.surface1;
  const setSelectedPlayer = useSelectedPlayerStore(
    (state) => state.setSelectedPlayer,
  );

  const formattedTitle = useMemo(() => {
    return formatRoundTitle(gameRound?.id ?? "");
  }, [gameRound]);

  const date = useMemo(() => {
    if (!gameRound) {
      return new Date();
    }
    return new Date(gameRound.played_at);
  }, [gameRound]);

  const navigateToViewDemo = () => {
    if (!gameRound) {
      return;
    }
    setSelectedPlayer("");
    router.push({
      pathname: "/viewDemo",
      params: { gameRoundId: gameRound.id },
    });
  };

  const summedKills = useMemo(() => {
    if (!gameRound) {
      return 0;
    }
    return gameRound.game_round_player.reduce((acc, val) => {
      return acc + val.kills;
    }, 0);
  }, []);
  const summedTeamKills = useMemo(() => {
    if (!gameRound) {
      return 0;
    }
    return gameRound.game_round_player.reduce((acc, val) => {
      return acc + val.teamkills;
    }, 0);
  }, []);

  // Bots would win most rounds outright, so they never count as the leader.
  const topKiller = useMemo(() => {
    return findTopPlayer(
      gameRound?.game_round_player,
      (player) => player.kills,
    );
  }, [gameRound]);

  const topReviver = useMemo(() => {
    return findTopPlayer(
      gameRound?.game_round_player,
      (player) => player.revivals,
    );
  }, [gameRound]);

  const tkkPerMille = useMemo(() => {
    return ((summedTeamKills / summedKills) * 1000).toFixed(2);
  }, [summedKills, summedTeamKills]);

  // Date, time and length are separate rows so they can stack on phones.
  const metaParts = useMemo(() => {
    return [
      ...toTimestamp(gameRound?.played_at ?? "").split(" • "),
      formatDuration(gameRound?.length ?? 0),
    ].filter(Boolean);
  }, [gameRound]);

  return (
    <TouchableOpacity
      disabled={summedKills === 0}
      onLayout={onLayout}
      onPress={navigateToViewDemo}
      style={[styles.container, style]}
    >
      <View style={styles.imageHolder}>
        <MapImage style={{ opacity: 0.5 }} gameRound={gameRound} />
        <LinearGradient
          colors={[surface1, "transparent"]}
          start={{ x: 0.0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ position: "absolute", height: 500, width: "100%" }}
        />
      </View>
      <View style={styles.leftItems}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <ThemedText style={{ textTransform: "uppercase" }} type={"heading"}>
            {formattedTitle.split(" ").slice(0, -3).join(" ")}
          </ThemedText>
          <View style={styles.mapType}>
            <ThemedText type={"cell"}>
              {formattedTitle.split(" ").pop()}
            </ThemedText>
          </View>
        </View>
        <View style={styles.metaHolder}>
          {metaParts.map((part) => (
            <ThemedText key={part} style={styles.meta} type={"log"}>
              {part}
            </ThemedText>
          ))}
        </View>
      </View>
      <View style={styles.middleItems}>
        <TopStatHolder
          label={"TOP KILLER"}
          value={topKiller}
          dotColor={UnistylesRuntime.getTheme().colors.accentKill}
        />
        <TopStatHolder
          label={"TOP MEDIC"}
          value={topReviver}
          dotColor={UnistylesRuntime.getTheme().colors.accentMedic}
        />
      </View>
      <View style={styles.rightItems}>
        <View style={styles.verticalSeparator} />
        <DataHolder label={"KILLS"} value={summedKills} />
        <DataHolder label={"TEAMKILLS"} value={summedTeamKills} />
        <DataHolder
          label={"TK/K ‰"}
          colorValues={true}
          value={Number(tkkPerMille).toFixed(1)}
          showBar={true}
        />
        <View style={styles.verticalSeparator} />
        <DataHolder
          label={"PLAYERS"}
          value={
            gameRound?.game_round_player.length
              ? gameRound?.game_round_player.length - 42
              : 0
          }
        />
      </View>

      {summedKills === 0 && <DiagonalStripes />}

      {/*<View style={styles.titleAndDateHolder}>*/}
      {/*  <ThemedText type={"heading"} style={styles.title}>*/}
      {/*    {formattedTitle}*/}
      {/*  </ThemedText>*/}
      {/*  <ThemedText*/}
      {/*    style={styles.date}*/}
      {/*  >{`${date.toLocaleTimeString()} ${date.toLocaleDateString()}`}</ThemedText>*/}
      {/*</View>*/}

      {/*<ThemedText>*/}
      {/*  <ThemedText style={{ color: "#e3e3e3" }}>{"kills"}</ThemedText>*/}
      {/*  {"/"}*/}
      {/*  <ThemedText style={{ color: "#cdcdcd" }}>*/}
      {/*    {"teamkills:"}*/}
      {/*  </ThemedText>{" "}*/}
      {/*  <ThemedText style={{ color: "#beefa1" }}>{summedKills}</ThemedText>*/}
      {/*  {"/"}*/}
      {/*  <ThemedText style={{ color: "#efa6a6" }}>{summedTeamKills}</ThemedText>*/}
      {/*  <ThemedText*/}
      {/*    style={{*/}
      {/*      color: interpolateColor(*/}
      {/*        Number(tkkPerMille),*/}
      {/*        [20, 50],*/}
      {/*        ["#d1d1d1", "#fb3d3d"],*/}
      {/*      ),*/}
      {/*    }}*/}
      {/*  >{`   TK/K ‰: ${tkkPerMille}`}</ThemedText>*/}
      {/*</ThemedText>*/}
      {/*<ThemedText>{`Number of players: ${gameRound?.game_round_player.length ?? 40 - 40}`}</ThemedText>*/}
    </TouchableOpacity>
  );
};

export default GameRoundItem2;

const styles = StyleSheet.create((theme) => ({
  middleItems: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.md,
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
  },
  stripeLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: "hidden",
  },
  verticalSeparator: {
    display: { xs: "none", md: "flex" },
    alignSelf: "stretch",
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: theme.colors.borderStrong,
    marginHorizontal: theme.margins.md,
  },
  value: (value: number) => ({
    color:
      value >= TEAM_KILL_DANGER_AT
        ? theme.colors.accentKill
        : value >= TEAM_KILL_WARN_AT
          ? theme.colors.accentWarn
          : theme.colors.textMuted,
  }),
  teamKillBarTrack: {
    width: 50,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.surface3,
    overflow: "hidden",
  },
  teamKillBarFill: (ratio: number, value: number) => ({
    height: "100%",
    borderRadius: 2,
    width: `${ratio * 100}%`,
    backgroundColor:
      value >= TEAM_KILL_DANGER_AT
        ? theme.colors.accentKill
        : value >= TEAM_KILL_WARN_AT
          ? theme.colors.accentWarn
          : theme.colors.textMuted,
  }),
  mapType: {
    textTransform: "uppercase",
    backgroundColor: theme.colors.surface3,
    padding: theme.margins.sm,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    paddingHorizontal: theme.margins.md,
    paddingBottom: 2,
  },
  // Constant width per column, so a long nickname or an extra digit does not
  // shift everything after it.
  topStatHolder: {
    gap: theme.margins.sm,
    alignItems: "flex-start",
    width: { xs: "auto", md: 170 },
  },
  dataHolder: {
    gap: theme.margins.sm,
    alignItems: "flex-end",
    minWidth: { xs: 0, md: 60 },
  },
  // No color override — a soft shadow keeps the label legible over the map image.
  dataHolderLabel: {
    textShadowColor: theme.colors.surfaceBase,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  // The three blocks form fixed columns so they align across cards: the title
  // block absorbs all slack, the stat blocks keep a constant width whatever
  // their content. flexBasis is per breakpoint because the container stacks on
  // phones, where a basis of 0 would collapse the height instead of the width.
  leftItems: {
    gap: theme.margins.md,
    flexGrow: { xs: 0, md: 1 },
    flexShrink: 1,
    flexBasis: { xs: "auto", md: 0 },
    minWidth: { xs: 0, md: 200 },
  },
  // Stacked on phones, inline from tablets up.
  metaHolder: {
    flexDirection: { xs: "column", md: "row" },
    gap: { xs: 2, md: theme.margins.md },
  },
  meta: {
    color: theme.colors.textMuted,
  },
  rightItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-end",
    flexGrow: 0,
    flexShrink: 0,
    gap: { xs: theme.margins.lg, md: theme.margins.xl },
  },
  imageHolder: {
    position: "absolute",
    right: 0,
    top: 0,
    height: "100%",
    width: { xs: "100%", md: "60%" },
  },
  imageFade: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "60%",
    height: "60%",
  },
  titleAndDateHolder: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  date: {
    alignSelf: "flex-end",
  },
  title: {
    textTransform: "capitalize",
  },
  container: {
    flexDirection: { xs: "column", md: "row" },
    alignItems: { xs: "stretch", md: "center" },
    justifyContent: "space-between",
    gap: { xs: theme.margins.lg, md: 5 },
    borderWidth: 1,
    borderColor: theme.colors.borderHairline,
    backgroundColor: theme.colors.surface1,
    // flexDirection: "row",
    // justifyContent: "space-between",
    padding: 10,
    paddingVertical: { xs: 10, md: 20 },
    borderRadius: 1,
    overflow: "hidden",
  },
}));
