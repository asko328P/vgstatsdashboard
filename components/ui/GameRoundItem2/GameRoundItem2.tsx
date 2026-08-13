import {
  TouchableOpacity,
  View,
  LayoutChangeEvent,
  ViewStyle,
} from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { GameRoundPlayer } from "@/app/viewDemo";
import { interpolateColor } from "react-native-reanimated";
import MapImage from "@/components/ui/MapImage/MapImage";
import { LinearGradient } from "expo-linear-gradient";
import { useSelectedPlayerStore } from "@/zustand/SelectedPlayerStore";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { formatDuration, toTimestamp } from "@/utils/functions";

export type GameRound = {
  id: string;
  played_at: string;
  length: number;
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
    if (!gameRound?.id) {
      return "";
    }
    let text = gameRound.id;
    text = text.replaceAll("_", " ");
    text = text.substring(20, text.length);
    text = text.replaceAll("gpm coop", "");
    text = text.replaceAll("16", "-  Infantry");
    text = text.replaceAll("32", "-  Alternative");
    text = text.replaceAll("64", "-  Standard");
    text = text.replaceAll("128", "-  Large");
    return text;
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

  const tkkPerMille = useMemo(() => {
    return ((summedTeamKills / summedKills) * 1000).toFixed(2);
  }, [summedKills, summedTeamKills]);

  return (
    <TouchableOpacity
      onLayout={onLayout}
      onPress={navigateToViewDemo}
      style={[styles.container, style]}
    >
      <View style={styles.imageHolder}>
        <MapImage style={{ opacity: 0.7 }} gameRound={gameRound} />
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
        <ThemedText
          style={{ color: UnistylesRuntime.getTheme().colors.textMuted }}
          type={"log"}
        >{`${toTimestamp(gameRound?.played_at ?? "")} • ${formatDuration(gameRound?.length ?? 0)}`}</ThemedText>
      </View>
      <View style={styles.rightItems}>
        <ThemedText>{"asdas"}</ThemedText>
      </View>

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
  leftItems: {
    gap: theme.margins.md,
  },
  rightItems: {},
  imageHolder: {
    position: "absolute",
    right: 0,
    top: 0,
    height: "100%",
    width: "40%",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
    borderWidth: 1,
    borderColor: theme.colors.borderHairline,
    backgroundColor: theme.colors.surface1,
    // flexDirection: "row",
    // justifyContent: "space-between",
    padding: 10,
    borderRadius: 1,
    overflow: "hidden",
  },
}));
