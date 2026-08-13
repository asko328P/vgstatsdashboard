import { FlatList, TextInput, TouchableOpacity, View } from "react-native";
import { useMemo, useState } from "react";
import { ThemedText } from "@/components/ui/ThemedText";
import { Message } from "@/components/ui/ChatItem/ChatItem";
import ChatItem2, {
  chatRowStyles,
  isCommand,
} from "@/components/ui/ChatItem2/ChatItem2";
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

  const [searchInput, setSearchInput] = useState("");

  const searchedMessages = useMemo(() => {
    if (!searchInput) {
      return messages;
    }
    if (searchInput.toLowerCase() === "!commands") {
      return messages.filter((message) => {
        return isCommand(message.text);
      });
    }
    const search = searchInput.toLowerCase();
    return messages.filter(
      (message) =>
        message.player_id.toLowerCase().includes(search) ||
        message.text.toLowerCase().includes(search),
    );
  }, [messages, searchInput]);

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
          {searchedMessages.length}
        </ThemedText>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.textInputHolder}>
          <TextInput
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder={"Filter messages, players, !commands"}
            placeholderTextColor={UnistylesRuntime.getTheme().colors.textMuted}
            style={styles.searchInput}
          />
        </View>
      )}

      {isExpanded && (
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          data={searchedMessages}
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
  textInputHolder: {
    padding: theme.margins.md,
    backgroundColor: theme.colors.surface1,
  },
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
  searchInput: {
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.borderHairline,
    borderRadius: 2,
    paddingHorizontal: theme.margins.md,
    paddingVertical: theme.margins.sm,
    marginTop: theme.margins.sm,
  },
  header: {
    backgroundColor: theme.colors.surface2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderHairline,
  },
}));
