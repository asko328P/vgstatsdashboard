import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { useMemo } from "react";
import { useRouter } from "expo-router";

export type GameRound = {
  id: string;
  played_at: string;
};
type Props = {
  gameRound: GameRound;
};
const GameRoundItem = ({ gameRound }: Props) => {
  const router = useRouter();
  const formattedText = useMemo(() => {
    let text = gameRound.id;
    text = text.replaceAll("_", " ");
    text = text.substring(20, text.length - 0);
    text = text.replaceAll("gpm coop", "");
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
  return (
    <TouchableOpacity onPress={navigateToViewDemo} style={styles.container}>
      <ThemedText type={"subtitle"} style={styles.title}>
        {formattedText}
      </ThemedText>
      <ThemedText
        style={styles.title}
      >{`${date.toLocaleTimeString()} ${date.toLocaleDateString()}`}</ThemedText>
    </TouchableOpacity>
  );
};

export default GameRoundItem;

const styles = StyleSheet.create({
  title: {
    textTransform: "capitalize",
  },
  container: {
    backgroundColor: "#171616",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
  },
});
