import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { GameRoundPlayer } from "@/app/viewDemo";
import { interpolateColor } from "react-native-reanimated";
import MapImage from "@/components/ui/MapImage/MapImage";
import { LinearGradient } from "expo-linear-gradient";

export type GameRound = {
  id: string;
  played_at: string;
};
type Props = {
  gameRound: GameRound & { game_round_player: GameRoundPlayer[] };
};
const GameRoundItem = ({ gameRound }: Props) => {
  const router = useRouter();
  const formattedTitle = useMemo(() => {
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
    return new Date(gameRound.played_at);
  }, [gameRound]);

  const navigateToViewDemo = () => {
    router.push({
      pathname: "/viewDemo",
      params: { gameRoundId: gameRound.id },
    });
  };

  const summedKills = useMemo(() => {
    return gameRound.game_round_player.reduce((acc, val) => {
      return acc + val.kills;
    }, 0);
  }, []);
  const summedTeamKills = useMemo(() => {
    return gameRound.game_round_player.reduce((acc, val) => {
      return acc + val.teamkills;
    }, 0);
  }, []);

  const tkkPerMille = useMemo(() => {
    return ((summedTeamKills / summedKills) * 1000).toFixed(2);
  }, [summedKills, summedTeamKills]);

  return (
    <TouchableOpacity onPress={navigateToViewDemo} style={styles.container}>
      <View style={styles.imageHolder}>
        <MapImage style={{ opacity: 0.9 }} gameRound={gameRound} />
      </View>
      <View style={styles.titleAndDateHolder}>
        <ThemedText type={"subtitle"} style={styles.title}>
          {formattedTitle}
        </ThemedText>
        <ThemedText
          style={styles.date}
        >{`${date.toLocaleTimeString()} ${date.toLocaleDateString()}`}</ThemedText>
      </View>

      <ThemedText>
        <ThemedText style={{ color: "#e3e3e3" }}>{"kills"}</ThemedText>
        {"/"}
        <ThemedText style={{ color: "#cdcdcd" }}>
          {"teamkills:"}
        </ThemedText>{" "}
        <ThemedText style={{ color: "#beefa1" }}>{summedKills}</ThemedText>
        {"/"}
        <ThemedText style={{ color: "#efa6a6" }}>{summedTeamKills}</ThemedText>
        <ThemedText
          style={{
            color: interpolateColor(
              Number(tkkPerMille),
              [20, 50],
              ["#d1d1d1", "#fb3d3d"],
            ),
          }}
        >{`   TK/K ‰: ${tkkPerMille}`}</ThemedText>
      </ThemedText>
      <ThemedText>{`Number of players: ${gameRound.game_round_player.length - 40}`}</ThemedText>
    </TouchableOpacity>
  );
};

export default GameRoundItem;

const styles = StyleSheet.create({
  imageHolder: {
    position: "absolute",
    right: 0,
    top: 0,
    height: "100%",
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
    gap: 5,
    backgroundColor: "#171616",
    // flexDirection: "row",
    // justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    overflow: "hidden",
    paddingBottom: 50,
  },
});
