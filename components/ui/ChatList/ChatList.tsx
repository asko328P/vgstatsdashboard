import { FlatList, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { Message } from "@/components/ui/ChatItem/ChatItem";
import ChatItem2, { chatRowStyles } from "@/components/ui/ChatItem2/ChatItem2";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";
import { Feather } from "@expo/vector-icons";

const ListHeader = () => {
  return (
    <View style={[chatRowStyles.row, styles.header]}>
      <View style={chatRowStyles.playerCell}>
        <ThemedText type={"micro"}>{"Player"}</ThemedText>
      </View>
      <View style={chatRowStyles.channelCell}>
        <ThemedText type={"micro"}>{"Channel"}</ThemedText>
      </View>
      <View style={chatRowStyles.messageCell}>
        <ThemedText type={"micro"}>{"Message"}</ThemedText>
      </View>
      <View style={chatRowStyles.timeCell}>
        <ThemedText type={"micro"}>{"Time"}</ThemedText>
      </View>
    </View>
  );
};

type Props = {
  messages: Message[];
  onPlayerPress?: (playerId: string) => void;
  isExpanded: boolean;
  onPress?: () => void;
  onExpandPress?: () => void;
};

const ChatList = ({
  messages,
  onPlayerPress,
  isExpanded,
  onExpandPress,
}: Props) => {
  const { rt } = useUnistyles();
  const expandAllLists =
    rt.breakpoint !== "xs" &&
    rt.breakpoint !== "sm" &&
    rt.breakpoint !== "md" &&
    rt.breakpoint !== "lg";

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={onExpandPress} style={styles.toggle}>
        <ThemedText type={"label"}>
          {!expandAllLists && !isExpanded && (
            <Feather
              name={"chevrons-down"}
              size={15}
              color={UnistylesRuntime.getTheme().colors.textMuted}
            />
          )}
          {"CHAT"}
        </ThemedText>
        <ThemedText type={"cell"} style={styles.count}>
          {messages.length}
        </ThemedText>
      </TouchableOpacity>

      {isExpanded && (
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ChatItem2 message={item} onPress={onPlayerPress} />
          )}
        />
      )}
    </View>
  );
};

export default ChatList;

const styles = StyleSheet.create((theme) => ({
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.margins.md,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.borderHairline,
    borderRadius: 2,
    paddingHorizontal: theme.margins.lg,
    paddingVertical: theme.margins.md,
  },
  count: {
    color: theme.colors.textMuted,
  },
  header: {
    backgroundColor: theme.colors.surface2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderHairline,
  },
}));
