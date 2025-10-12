import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/utils/supabase";
import GameRoundItem, {
  GameRound,
} from "@/components/ui/GameRoundItem/GameRoundItem";
import KillItem, { Kill } from "@/components/ui/KillItem/KillItem";
import ChatItem, { Message } from "@/components/ui/ChatItem/ChatItem";
import { AntDesign } from "@expo/vector-icons";
import GameRoundPlayerItem, {
  FirstRow,
} from "@/components/ui/GameRoundPlayerItem/GameRoundPlayerItem";

export type GameRoundPlayer = {
  id: number;
  hash: string;
  created_at: string;
  game_round_id: string;
  player_id: string;
  kills: number;
  deaths: number;
  score: number;
  scoreTW: number;
  teamkills: number;
  revivals: number;
};

type GameData = GameRound & { kills: Kill[] } & { chat_messages: Message[] } & {
  game_round_player: GameRoundPlayer[];
};

export default function Page() {
  const router = useRouter();
  const { gameRoundId } = useLocalSearchParams<{ gameRoundId: string }>();

  const [singleGameData, setSingleGameData] = useState<GameData>();
  const [filterInputValue, setFilterInputValue] = useState("");

  useEffect(() => {
    const getData = async () => {
      const { data, error } = await supabase
        .from("game_rounds")
        .select(
          `
        *, kills!inner(*), chat_messages!inner(*), game_round_player!inner(*)
        `,
        )
        .eq("id", gameRoundId)
        .maybeSingle()
        .overrideTypes<GameData>();
      if (error) {
        console.log("error", error);
      }
      if (data) {
        console.log("data", data);
        //@ts-ignore
        setSingleGameData(data);
      }
    };
    getData();
  }, []);

  const filteredMessages = useMemo(() => {
    if (!singleGameData?.chat_messages) {
      return [];
    }
    let messagesCopy = singleGameData.chat_messages;
    messagesCopy = messagesCopy.filter((message) => {
      return !message.text.startsWith("!m ");
    });
    if (filterInputValue) {
      messagesCopy = messagesCopy.filter(
        (message) =>
          message.text.toLowerCase().includes(filterInputValue.toLowerCase()) ||
          message.player_id
            .toLowerCase()
            .includes(filterInputValue.toLowerCase()),
      );
    }
    return messagesCopy.sort((a, b) => a.id - b.id);
  }, [singleGameData?.chat_messages, filterInputValue]);
  return (
    <View style={styles.container}>
      <View style={styles.topHolder}>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <AntDesign name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <ThemedText
          type={"subtitle"}
        >{`Viewing demo: ${gameRoundId}`}</ThemedText>
      </View>
      <View style={styles.allFlatlistsHolder}>
        <View style={styles.singleFlatlistHolder}>
          <ThemedText>{"Players:"}</ThemedText>
          <FirstRow />
          <FlatList
            contentContainerStyle={styles.flatlistContainerStyle}
            data={singleGameData?.game_round_player
              .sort((a, b) => a.id - b.id)
              .filter((item) => !item.player_id.startsWith("[R-BOT]"))}
            renderItem={({ item }) => <GameRoundPlayerItem item={item} />}
          />
        </View>
        <View style={styles.singleFlatlistHolder}>
          <ThemedText>{"Kills:"}</ThemedText>
          <FlatList
            contentContainerStyle={styles.flatlistContainerStyle}
            data={singleGameData?.kills.sort((a, b) => a.id - b.id)}
            renderItem={({ item }) => <KillItem kill={item} />}
          />
        </View>

        <View style={styles.singleFlatlistHolder}>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <ThemedText>{"Filter messages:"}</ThemedText>
            <TextInput
              style={styles.chatTextInput}
              onChangeText={setFilterInputValue}
            />
          </View>

          <FlatList
            contentContainerStyle={styles.flatlistContainerStyle}
            data={filteredMessages}
            renderItem={({ item }) => <ChatItem message={item} />}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chatTextInput: {
    margin: 5,
    padding: 5,
    color: "#FFFFFF",
    backgroundColor: "#424242",
    borderRadius: 5,
  },
  flatlistContainerStyle: {
    paddingBottom: 400,
    gap: 4,
  },
  singleFlatlistHolder: {
    flex: 1,
    gap: 10,
    // padding: 10,
  },
  flatListsHolder: {
    gap: 10,
    flexDirection: "row",
    backgroundColor: "red",
  },
  topHolder: {
    gap: 10,
    flexDirection: "row",
    paddingVertical: 16,
  },
  allFlatlistsHolder: {
    gap: 10,
    flexDirection: "row",
    overflow: "hidden",
    maxHeight: "100%",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    // flexDirection: "row",
  },
});
