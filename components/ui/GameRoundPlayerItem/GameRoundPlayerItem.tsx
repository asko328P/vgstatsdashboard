import { StyleSheet, TouchableOpacity, View } from "react-native";
import { GameRoundPlayer } from "@/app/viewDemo";
import { ThemedText } from "@/components/ui/ThemedText";
import { interpolateColor } from "react-native-reanimated";
import {
  SelectedPlayerState,
  useSelectedPlayerStore,
} from "@/zustand/SelectedPlayerStore";
import { Feather } from "@expo/vector-icons";

type Props = {
  item: GameRoundPlayer;
};

export const FirstRow = () => {
  return (
    <View style={[styles.container, { padding: 0 }]}>
      <View style={{ flex: 1 }}>
        <ThemedText style={[styles.label]}>{"Name"}</ThemedText>
      </View>
      <View style={styles.cell}>
        <ThemedText style={[styles.label]}>{"Score"}</ThemedText>
      </View>
      <View style={styles.cell}>
        <ThemedText style={[styles.label]}>{"Score TW"}</ThemedText>
      </View>
      <View style={styles.cell}>
        <ThemedText style={[styles.label]}>{"Kills"}</ThemedText>
      </View>
      <View style={styles.cell}>
        <ThemedText style={[styles.label]}>{"Deaths"}</ThemedText>
      </View>
      <View style={styles.cell}>
        <ThemedText style={[styles.label]}>{"Teamkills"}</ThemedText>
      </View>
    </View>
  );
};

const GameRoundPlayerItem = ({ item }: Props) => {
  const setSelectedPlayer = useSelectedPlayerStore(
    (state) => state.setSelectedPlayer,
  );
  const selectedPlayer = useSelectedPlayerStore(
    (state: SelectedPlayerState) => state.selectedPlayer,
  );

  const pressPlayerHandler = () => {
    setSelectedPlayer(item.player_id);
  };

  return (
    <TouchableOpacity
      onPress={pressPlayerHandler}
      style={[
        styles.container,
        {
          borderWidth: 1,
          borderColor: selectedPlayer === item.player_id ? "#bfac49" : "black",
        },
      ]}
    >
      <View
        style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}
      >
        <ThemedText style={[styles.value]}>{item.player_id}</ThemedText>
      </View>
      <View style={styles.cell}>
        <ThemedText style={[styles.value]}>{item.score}</ThemedText>
      </View>
      <View style={styles.cell}>
        <ThemedText style={[styles.value]}>{item.scoreTW}</ThemedText>
      </View>
      <View style={styles.cell}>
        <ThemedText style={[styles.value]}>{item.kills}</ThemedText>
      </View>
      <View style={styles.cell}>
        <ThemedText style={[styles.value]}>{item.deaths}</ThemedText>
      </View>
      <View style={styles.cell}>
        <ThemedText
          style={[
            styles.value,
            {
              fontWeight: item.teamkills > 1 ? "900" : "200",
              color: interpolateColor(
                item.teamkills,
                [0, 3],
                ["#353535", "#fb3d3d"],
              ),
            },
          ]}
        >
          {item.teamkills}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

export default GameRoundPlayerItem;

const styles = StyleSheet.create({
  cell: { flex: 0.2, alignItems: "center" },
  value: {},
  label: {
    fontSize: 10,
  },
  container: {
    borderRadius: 5,
    alignItems: "center",
    flexDirection: "row",
    padding: 5,
    backgroundColor: "#1b1717",
  },
});
