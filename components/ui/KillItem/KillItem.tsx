import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { useMemo } from "react";
import { formatTime } from "@/utils/functions";

export type Kill = {
  id: number;
  created_at: string;
  game_round_id: string;
  killer_player_id: string;
  victim_player_id: string;
  weapon_id: string;
  is_teamkill: boolean | null;
  current_time: number;
  is_bot_involved: boolean;
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
    <View
      style={[
        styles.container,
        kill.is_teamkill &&
          !kill.is_bot_involved && {
            backgroundColor: "#552d2d",
          },
      ]}
    >
      <PlayerNameItem playerId={kill.killer_player_id} />
      <ThemedText>{`[${kill.weapon_id}]`}</ThemedText>
      <PlayerNameItem playerId={kill.victim_player_id} />
      <ThemedText style={styles.time}>
        {`time: ${formatTime(kill.current_time)}`}
      </ThemedText>
    </View>
  );
};

export default KillItem;

const styles = StyleSheet.create({
  time: {
    position: "absolute",
    right: 10,
    top: 2,
    fontSize: 12,
  },
  weaponText: {
    color: "#b1b119",
  },
  container: {
    gap: 5,
    flexDirection: "row",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#151313",
  },
});
