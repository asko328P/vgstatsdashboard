import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  SelectedPlayerState,
  useSelectedPlayerStore,
} from "@/zustand/SelectedPlayerStore";
import DemoHeader from "@/components/ui/DemoHeader/DemoHeader";
import {
  formatDuration,
  formatRoundTitle,
  toTimestamp,
} from "@/utils/functions";
import { useSingleGameRoundQuery } from "@/utils/queries";
import PlayersList from "@/components/ui/PlayersList/PlayersList";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import TeamkillList from "@/components/ui/TeamkillList/TeamkillList";
import ChatList from "@/components/ui/ChatList/ChatList";

const LISTS = {
  players: "PLAYERS",
  teamkills: "TEAMKILLS",
  chat: "CHAT",
};

export default function Page() {
  const router = useRouter();
  const { rt } = useUnistyles();
  const expandAllLists =
    rt.breakpoint !== "xs" &&
    rt.breakpoint !== "sm" &&
    rt.breakpoint !== "md" &&
    rt.breakpoint !== "lg";
  const { gameRoundId } = useLocalSearchParams<{ gameRoundId: string }>();

  const setSelectedPlayer = useSelectedPlayerStore(
    (state) => state.setSelectedPlayer,
  );
  const selectedPlayer = useSelectedPlayerStore(
    (state: SelectedPlayerState) => state.selectedPlayer,
  );

  const [filterInputValue, setFilterInputValue] = useState("");
  const [expandedList, setExpandedList] = useState(LISTS.players);

  const { data: singleGameData } = useSingleGameRoundQuery(gameRoundId);

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

  // On wide screens every list is open, so they share the space equally.
  const isListExpanded = (list: string) =>
    expandAllLists || expandedList === list;

  const onBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.dismissAll();
      router.replace("/");
    }
  };
  return (
    <View style={styles.container}>
      <DemoHeader
        onBackPress={onBackPress}
        headerTitle={formatRoundTitle(gameRoundId)
          .split(" ")
          .slice(0, -3)
          .join(" ")}
        mapType={formatRoundTitle(gameRoundId).split(" ").pop()}
        bottomLabel={`${toTimestamp(singleGameData?.played_at ?? "")} • ${formatDuration(singleGameData?.length ?? 0)}`}
        selectedPlayer={selectedPlayer}
        download_link={singleGameData?.download_link}
      />
      <View
        style={[
          styles.allFlatlistsHolder,
          !expandAllLists && { flexDirection: "column" },
        ]}
      >
        <View
          style={styles.singleFlatlistHolder(isListExpanded(LISTS.players))}
        >
          {singleGameData && (
            <PlayersList
              allSquadsObject={singleGameData.all_squads_object}
              isExpanded={isListExpanded(LISTS.players)}
              onExpandPress={() => {
                setExpandedList(LISTS.players);
              }}
              players={singleGameData?.game_round_player
                .sort((a, b) => a.id - b.id)
                .filter((item) => !item.player_id.startsWith("[R-BOT]"))}
              roundLength={singleGameData?.length}
            />
          )}
        </View>
        <View
          style={styles.singleFlatlistHolder(isListExpanded(LISTS.teamkills))}
        >
          {singleGameData && (
            <TeamkillList
              onExpandPress={() => {
                setExpandedList(LISTS.teamkills);
              }}
              kills={singleGameData?.kills.sort((a, b) => a.id - b.id)}
              isExpanded={isListExpanded(LISTS.teamkills)}
            />
          )}
        </View>

        <View style={styles.singleFlatlistHolder(isListExpanded(LISTS.chat))}>
          {singleGameData && (
            <ChatList
              onExpandPress={() => {
                setExpandedList(LISTS.chat);
              }}
              messages={filteredMessages}
              isExpanded={isListExpanded(LISTS.chat)}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
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
  // Collapsed lists shrink to just their toggle; the expanded one takes the rest.
  singleFlatlistHolder: (isExpanded: boolean) => ({
    flexGrow: isExpanded ? 1 : 0,
    flexShrink: isExpanded ? 1 : 0,
    // 0 when expanded so columns split evenly instead of sizing to their
    // content; auto when collapsed so the holder hugs its toggle button.
    flexBasis: isExpanded ? 0 : "auto",
    gap: 10,
  }),
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
    flex: 1,
    paddingHorizontal: 16,
    gap: 10,
    flexDirection: "row",
    overflow: "hidden",
  },
  container: {
    flex: 1,
    // padding: theme.margins.md,
    gap: theme.margins.md,
    paddingBottom: 10,
    // flexDirection: "row",
  },
}));
