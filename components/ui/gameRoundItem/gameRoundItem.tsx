import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { useMemo } from "react";

export type GameRound = {
  id: string;
};
type Props = {
  gameRound: GameRound;
};
const GameRoundItem = ({ gameRound }: Props) => {
  console.log(gameRound.id);
  const formattedText = useMemo(() => {
    let text = gameRound.id;
    let splitArray = text.split("/");
    text = splitArray[splitArray.length - 1];
    text = text.replaceAll("_", " ");
    text = text.substring(28, text.length - 7);
    text = text.replaceAll("gpm coop", "");
    return text;
  }, [gameRound]);

  const date = useMemo(() => {
    let text = gameRound.id;
    let splitArray = text.split("/");
    text = splitArray[splitArray.length - 1];
    text = text.substring(8, 27);
    let textArray = text.split("_");
    return new Date(
      Number(textArray[0]),
      Number(textArray[1]) - 1,
      Number(textArray[2]),
      Number(textArray[3]),
      Number(textArray[4]),
      Number(textArray[5]),
    );
  }, [gameRound]);
  return (
    <TouchableOpacity style={styles.container}>
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
