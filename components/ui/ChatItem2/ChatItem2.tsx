import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { adjustColorBrightness, formatTime } from "@/utils/functions";
import { Message } from "@/components/ui/ChatItem/ChatItem";
import {
  SelectedPlayerState,
  useSelectedPlayerStore,
} from "@/zustand/SelectedPlayerStore";
import { useMemo } from "react";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";

// Shared by the row and by the list header so both stay aligned.
export const chatRowStyles = StyleSheet.create((theme) => ({
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
  channelCell: {
    width: 80,
  },
  messageCell: {
    flex: 2,
    minWidth: 80,
  },
  timeCell: {
    width: 60,
    alignItems: "flex-end",
  },
}));

// Admin commands are called out in gold, per the design system.
const isCommand = (text: string) => {
  const lower = text.toLowerCase();
  return (
    lower.startsWith("!r ") ||
    lower.startsWith("!rp ") ||
    lower.startsWith("!kick ") ||
    lower.startsWith("!kill ") ||
    lower.startsWith("!ban ") ||
    lower.startsWith("!resign ") ||
    lower.startsWith("!k ") ||
    lower.startsWith("!roundban ") ||
    lower.startsWith("!rb ") ||
    lower.startsWith("!tempban ") ||
    lower.startsWith("!timeban ") ||
    lower.startsWith("!unban ") ||
    lower.startsWith("!b ") ||
    lower.startsWith("!setnext ") ||
    lower.startsWith("!runnext ") ||
    lower.startsWith("!ban ") ||
    lower.startsWith("!mvote ") ||
    lower.startsWith("!w ") ||
    lower.startsWith("!tb ")
  );
};

const channelLabel = (channel: number) => {
  if (channel === 0) return "ALL";
  if (channel === 10) return "TEAM 1";
  if (channel === 20) return "TEAM 2";
  if ((channel > 10 && channel < 20) || (channel > 20 && channel < 30)) {
    return `SQUAD ${channel % 10}`;
  }
  return "";
};

const channelColor = (channel: number) => {
  const colors = UnistylesRuntime.getTheme().colors;
  if (channel === 0) return colors.textSecondary;
  if (channel === 10) return colors.chanTeam1;
  if (channel === 20) return colors.chanTeam2;
  return colors.chanSquad;
};

type Props = {
  message: Message;
  onPress?: (playerId: string) => void;
};

const ChatItem2 = ({ message, onPress }: Props) => {
  const setSelectedPlayer = useSelectedPlayerStore(
    (state) => state.setSelectedPlayer,
  );
  const selectedPlayer = useSelectedPlayerStore(
    (state: SelectedPlayerState) => state.selectedPlayer,
  );

  const pressPlayerHandler = () => {
    if (onPress) {
      onPress(message.player_id);
      return;
    }
    setSelectedPlayer(message.player_id);
  };

  const isSelected = selectedPlayer === message.player_id;
  const command = useMemo(() => isCommand(message.text), [message.text]);
  const label = channelLabel(message.channel);

  return (
    <TouchableOpacity
      onPress={pressPlayerHandler}
      style={[styles.container(isSelected, command)]}
    >
      <View style={styles.timeHolder}>
        <ThemedText type={"micro"}>
          {formatTime(message.current_time)}
        </ThemedText>
      </View>
      <View style={styles.rightSideHolder}>
        <View style={styles.channelAndNameHolder}>
          <View
            style={[
              styles.teamCell,
              {
                backgroundColor: adjustColorBrightness(
                  channelColor(message.channel),
                  -45,
                ),
              },
            ]}
          >
            {!!label && (
              <ThemedText
                type={"micro"}
                numberOfLines={1}
                style={{ color: channelColor(message.channel) }}
              >
                {label}
              </ThemedText>
            )}
          </View>
          <View style={chatRowStyles.playerCell}>
            <ThemedText type={"name"} numberOfLines={1}>
              {message.player_id}
            </ThemedText>
          </View>
        </View>

        <View style={{ flexShrink: 1 }}>
          <ThemedText type={"log"} style={styles.message(isSelected, command)}>
            {message.text}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ChatItem2;

const styles = StyleSheet.create((theme) => ({
  rightSideHolder: {
    flexShrink: 1,
    gap: theme.margins.sm,
  },
  timeHolder: {
    alignItems: "center",
    paddingHorizontal: theme.margins.md,
  },
  teamCell: {
    paddingHorizontal: 9,
    borderRadius: 5,
    paddingVertical: 2,
  },
  channelAndNameHolder: {
    flexDirection: "row",
    gap: theme.margins.md,
    alignItems: "center",
  },
  message: (isSelected: boolean, command: boolean) => ({
    flexShrink: 1,
    color: command
      ? theme.colors.accentSelect
      : isSelected
        ? theme.colors.textPrimary
        : theme.colors.textSecondary,
  }),
  container: (isSelected: boolean, command: boolean) => ({
    flexDirection: "row",
    paddingVertical: 10,
    backgroundColor: isSelected
      ? theme.colors.selectBackground
      : theme.colors.surface2,
    borderLeftWidth: isSelected || command ? 3 : 0,
    borderLeftColor: theme.colors.accentSelect,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderHairline,
  }),
}));
