import { FlatList, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/utils/supabase";
import { GameRound } from "@/components/ui/GameRoundItem2/GameRoundItem2";
import { Kill } from "@/components/ui/KillItem/KillItem";
import { Message } from "@/components/ui/ChatItem/ChatItem";
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
import PlayersList from "@/components/ui/PlayersList/PlayersList";
import { useUnistyles } from "react-native-unistyles";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import TeamkillList from "@/components/ui/TeamkillList/TeamkillList";
import ChatList from "@/components/ui/ChatList/ChatList";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import PlayerStatItem, {
  playerRowStyles,
} from "@/components/ui/PlayerStatItem/PlayerStatItem";
import { ThemedText } from "@/components/ui/ThemedText";

export interface PlayerStats {
  id: string;
  created_at: string;
  hash: string;
  last_seen: string;
  kills: number;
  deaths: number;
  teamkills: number;
  rounds: number;
  chat_messages: number;
  vehicle_destroyeds: number;
  revivals: number;
}

const COLUMNS = ["Rounds", "K/D", "Kills", "Revives", "Last seen"];

const ListHeader = () => {
  return (
    <View style={[playerRowStyles.row, styles.header]}>
      <View style={playerRowStyles.nameCell}>
        <ThemedText type={"micro"}>{"Player"}</ThemedText>
      </View>
      {COLUMNS.map((column) => (
        <View key={column} style={playerRowStyles.cell}>
          <ThemedText type={"micro"}>{column}</ThemedText>
        </View>
      ))}
    </View>
  );
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

  const [playersData, setPlayersData] = useState<PlayerStats[]>([]);

  useEffect(() => {
    const getData = async () => {
      const { data, error } = await supabase
        .from("players")
        .select(`*`)
        .neq("hash", "False")
        .not("last_seen", "is", null)
        .order("last_seen", { ascending: false })
        .limit(50);
      if (error) {
        console.log("single game error", error);
      }
      if (data) {
        console.log("player data", data);
        setPlayersData(data);
      }
    };
    getData();
  }, []);

  return (
    <View style={styles.container}>
      <PageHeader />
      <View style={styles.horizontalVerticalContainer(expandAllLists)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalContent}
        >
          <FlatList
            style={styles.flatlist}
            data={playersData}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={ListHeader}
            stickyHeaderIndices={[0]}
            renderItem={({ item }) => <PlayerStatItem item={item} />}
          />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  // flexGrow lets the table fill the screen when it is wider than 500px, while
  // still allowing the content to overflow and scroll on a phone.
  horizontalContent: {
    flexGrow: 1,
  },
  flatlist: {
    flex: 1,
    minWidth: 600,
    paddingHorizontal: theme.margins.md,
  },
  // Needs a bounded height, otherwise the FlatList grows to fit every row and
  // never scrolls.
  horizontalVerticalContainer: (isExpanded) => ({
    flex: 1,
    minHeight: 0,
    flexDirection: isExpanded ? "row" : "column",
  }),
  header: {
    backgroundColor: theme.colors.surface3,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderHairline,
  },

  container: {
    flex: 1,
    // padding: theme.margins.md,
    gap: theme.margins.md,
    // flexDirection: "row",
  },
}));
