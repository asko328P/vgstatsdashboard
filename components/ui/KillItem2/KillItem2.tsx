import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { formatTime } from "@/utils/functions";
import { Kill } from "@/components/ui/KillItem/KillItem";
import {
  SelectedPlayerState,
  useSelectedPlayerStore,
} from "@/zustand/SelectedPlayerStore";
import { StyleSheet } from "react-native-unistyles";

// Shared by the row and by the list header so both stay aligned.
export const killRowStyles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.md,
    paddingHorizontal: theme.margins.md,
    paddingVertical: theme.margins.md,
  },
  playerCell: {
    flex: 1,
    minWidth: 50,
  },
  weaponCell: {
    flex: 1,
    minWidth: 50,
  },
  timeCell: {
    width: 60,
    alignItems: "flex-end",
  },
}));

const PlayerName = ({ playerId }: { playerId: string }) => {
  const isBot = playerId.startsWith("[R-BOT] ");

  return (
    <ThemedText
      type={"name"}
      numberOfLines={1}
      style={styles.playerName(isBot)}
    >
      {playerId}
    </ThemedText>
  );
};

type Props = {
  kill: Kill;
  onPress?: (playerId: string) => void;
};

const KillItem2 = ({ kill, onPress }: Props) => {
  const setSelectedPlayer = useSelectedPlayerStore(
    (state) => state.setSelectedPlayer,
  );
  const selectedPlayer = useSelectedPlayerStore(
    (state: SelectedPlayerState) => state.selectedPlayer,
  );

  const pressPlayerHandler = () => {
    if (onPress) {
      onPress(kill.killer_player_id);
      return;
    }
    setSelectedPlayer(kill.killer_player_id);
  };

  const isSelected = selectedPlayer === kill.killer_player_id;

  return (
    <TouchableOpacity
      onPress={pressPlayerHandler}
      style={[killRowStyles.row, styles.container(isSelected)]}
    >
      <View style={killRowStyles.playerCell}>
        <PlayerName playerId={kill.killer_player_id} />
      </View>
      <View style={killRowStyles.weaponCell}>
        <ThemedText type={"cell"} numberOfLines={1} style={styles.weapon}>
          {kill.weapon_id.replaceAll("_", " ")}
        </ThemedText>
      </View>
      <View style={killRowStyles.playerCell}>
        <PlayerName playerId={kill.victim_player_id} />
      </View>
      <View style={killRowStyles.timeCell}>
        <ThemedText type={"micro"}>{formatTime(kill.current_time)}</ThemedText>
      </View>
    </TouchableOpacity>
  );
};

export default KillItem2;

const styles = StyleSheet.create((theme) => ({
  playerName: (isBot: boolean) => ({
    color: isBot ? theme.colors.playerBot : theme.colors.playerHuman,
  }),
  weapon: {
    color: theme.colors.textSecondary,
  },
  container: (isSelected: boolean) => ({
    backgroundColor: isSelected
      ? theme.colors.selectBackground
      : theme.colors.killBackground,
    // Teamkill rows carry a red left mark rather than tinted text.
    borderLeftWidth: 3,
    borderLeftColor: isSelected
      ? theme.colors.accentSelect
      : theme.colors.accentKill,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderHairline,
  }),
}));
