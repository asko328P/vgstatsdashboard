import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { formatTime } from "@/utils/functions";

export type Message = {
  id: number;
  created_at: string;
  game_round_id: string | null;
  channel: number;
  player_id: string;
  text: string;
  current_time: number;
};

type Props = {
  message: Message;
};

const ChatItem = ({ message }: Props) => {
  return (
    <View style={[styles.container]}>
      <ThemedText style={[styles.playerNameText, {}]}>
        {message.player_id}
        {message.channel === 20 && (
          <ThemedText
            style={[
              styles.teamText,
              {
                color: "#315370",
              },
            ]}
          >
            {" TEAM 2"}
          </ThemedText>
        )}
        {((message.channel > 10 && message.channel < 20) ||
          (message.channel > 20 && message.channel < 30)) && (
          <ThemedText
            style={[
              styles.teamText,
              {
                color: "#4f7031",
              },
            ]}
          >
            {` SQUAD ${message.channel % 10}`}
          </ThemedText>
        )}
        {message.channel === 10 && (
          <ThemedText
            style={[
              styles.teamText,
              {
                color: "#702a34",
              },
            ]}
          >
            {" TEAM 1"}
          </ThemedText>
        )}
        {/*<ThemedText>{` ${message.channel}`}</ThemedText>*/}
      </ThemedText>
      <ThemedText style={styles.text}>{`   └ ${message.text}`}</ThemedText>
      <ThemedText style={styles.time}>
        {`time: ${formatTime(message.current_time)}`}
      </ThemedText>
    </View>
  );
};

export default ChatItem;

const styles = StyleSheet.create({
  time: {
    position: "absolute",
    right: 10,
    top: 2,
    fontSize: 12,
  },
  teamText: {
    fontSize: 12,
  },
  text: {
    fontSize: 16,
  },
  playerNameText: {
    color: "#b5b5b5",
    gap: 10,
    fontSize: 12,
  },
  container: {
    backgroundColor: "#151313",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRadius: 5,
  },
});
