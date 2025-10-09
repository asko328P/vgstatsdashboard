import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { useMemo } from "react";

export type Kill = {
  id: string;
  killer_player_id: string;
  victim_player_id: string;
  weapon_id: string;
};

type Props = {
  kill: Kill;
};

const PlayerNameItem = ({ playerId }: { playerId: string }) => {
  return (
    <ThemedText
      style={{ color: playerId.startsWith("[R-BOT] ") ? "#bc4040" : "#3986c3" }}
    >
      {playerId}
    </ThemedText>
  );
};

const KillItem = ({ kill }: Props) => {
  return (
    <View style={styles.container}>
      <PlayerNameItem playerId={kill.killer_player_id} />
      <ThemedText>{`[${kill.weapon_id}]`}</ThemedText>
      <PlayerNameItem playerId={kill.victim_player_id} />
    </View>
  );
};

export default KillItem;

const styles = StyleSheet.create({
  weaponText: {
    color: "#b1b119",
  },
  container: {
    gap: 5,
    flexDirection: "row",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#201e1e",
  },
});
