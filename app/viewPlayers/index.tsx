import {
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
  toReadableDayMonth,
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
//@ts-ignore
import { fonts, ThemedText } from "@/components/ui/ThemedText";

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
  const [searchInputValue, setSearchInputValue] = useState("");
  const [searchResults, setSearchResults] = useState<PlayerStats[] | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [upcomingPlayersData, setUpcomingPlayersData] = useState<PlayerStats[]>(
    [],
  );

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
    const getUpcomingData = async () => {
      const dateCutoff = new Date();
      dateCutoff.setDate(dateCutoff.getDate() - 7);
      const { data, error } = await supabase
        .from("players")
        .select(`*`)
        .neq("hash", "False")
        .gte("created_at", dateCutoff.toISOString())
        .gte("rounds", 10)
        .not("last_seen", "is", null)
        .order("rounds", { ascending: false })
        .limit(3);
      if (error) {
        console.log("single game error", error);
      }
      if (data) {
        console.log("player data", data);
        setUpcomingPlayersData(data);
      }
    };
    getUpcomingData();
    getData();
  }, []);

  const searchPlayers = async () => {
    const term = searchInputValue.trim();

    // An empty search clears the results and falls back to the default list.
    if (!term) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);

    // `%` are wildcards in a LIKE pattern, so escape any the user typed.
    const pattern = `%${term.replace(/[%_]/g, "\\$&")}%`;

    const { data, error } = await supabase
      .from("players")
      .select(`*`)
      .neq("hash", "False")
      .ilike("id", pattern)
      .order("last_seen", { ascending: false })
      .limit(50)
      .overrideTypes<PlayerStats[]>();

    setIsSearching(false);

    if (error) {
      console.log("player search error", error);
      return;
    }

    setSearchResults(data ?? []);
  };

  const titleRow = (label: string) => (
    <View style={styles.dateAndSeparator}>
      <ThemedText type={"label"}>{label}</ThemedText>
      <View
        style={{
          flex: 1,
          borderTopColor: UnistylesRuntime.getTheme().colors.surface3,
          borderTopWidth: 1,
        }}
      />
    </View>
  );

  const search = (
    <View style={styles.searchHolder}>
      <TextInput
        value={searchInputValue}
        onChangeText={setSearchInputValue}
        onSubmitEditing={searchPlayers}
        returnKeyType={"search"}
        placeholder={`Search callsign or alias - try "doc"`}
        placeholderTextColor={UnistylesRuntime.getTheme().colors.textMuted}
        style={styles.searchInput}
      />
      {!!searchInputValue && (
        <TouchableOpacity onPress={searchPlayers} style={styles.searchButton}>
          <ThemedText type={"label"}>
            {isSearching ? "SEARCHING" : "SEARCH"}
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );

  // On phones the page itself scrolls, so the list must not scroll separately.
  const table = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalContent}
    >
      <FlatList
        style={styles.flatlist}
        scrollEnabled={expandAllLists}
        data={searchResults ?? playersData}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        stickyHeaderIndices={[0]}
        renderItem={({ item }) => <PlayerStatItem item={item} />}
      />
    </ScrollView>
  );

  const sidePanel = (
    <View style={styles.sidePanel}>
      {upcomingPlayersData.map((item, index) => (
        <View style={styles.upcomingPlayer} key={item.id}>
          <ThemedText>{item.id}</ThemedText>
        </View>
      ))}
    </View>
  );

  // Phones: one column, side panel first, then a table that grows with the page.
  if (!expandAllLists) {
    return (
      <View style={styles.container}>
        <PageHeader />
        <ScrollView contentContainerStyle={styles.pageContent}>
          {titleRow("Upcoming")}
          {sidePanel}
          {titleRow("Players")}
          {search}
          {table}
        </ScrollView>
      </View>
    );
  }

  // Wide: table takes two thirds, side panel the remaining third.
  return (
    <View style={styles.container}>
      <PageHeader />
      <View style={styles.columns}>
        <View style={styles.mainColumn}>
          {titleRow("Players")}
          {search}
          {table}
        </View>
        <View style={styles.sideColumn}>
          {titleRow("Upcoming")}
          {sidePanel}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  upcomingPlayer: {
    flexDirection: "row",
    padding: theme.margins.md,
    borderBottomColor: theme.colors.borderHairline,
    borderBottomWidth: 1,
  },
  dateAndSeparator: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.xl,
  },
  searchHolder: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.md,
  },
  searchInput: {
    flex: 1,
    // TextInput does not inherit from ThemedText, so set the face explicitly.
    fontFamily: fonts.mono,
    fontSize: 14,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.borderHairline,
    borderRadius: 4,
    paddingHorizontal: theme.margins.md,
    paddingVertical: theme.margins.md,
  },
  searchButton: {
    justifyContent: "center",
    backgroundColor: theme.colors.surface3,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 4,
    paddingHorizontal: theme.margins.md,
    paddingVertical: theme.margins.md,
  },
  // flexGrow lets the table fill the screen when it is wider than 500px, while
  // still allowing the content to overflow and scroll on a phone.
  horizontalContent: {
    flexGrow: 1,
  },
  flatlist: {
    flex: 1,
    minWidth: 600,
    // paddingHorizontal: theme.margins.md,
  },
  // Wide layout: the two columns need a bounded height so the table scrolls
  // inside its own column rather than growing the page.
  columns: {
    flex: 1,
    minHeight: 0,
    flexDirection: "row",
    gap: theme.margins.lg,
    paddingHorizontal: theme.margins.md,
  },
  mainColumn: {
    flex: 2,
    minHeight: 0,
    gap: theme.margins.md,
  },
  sideColumn: {
    flex: 1,
    gap: theme.margins.md,
  },
  // Phone layout: everything stacks and the page scroll does the work.
  pageContent: {
    gap: theme.margins.md,
    paddingHorizontal: theme.margins.md,
    paddingBottom: theme.margins.xxl,
  },
  sidePanel: {
    gap: theme.margins.sm,
    backgroundColor: theme.colors.surface1,
    borderWidth: 1,
    borderColor: theme.colors.borderHairline,
    borderRadius: 2,
  },
  sidePanelText: {
    color: theme.colors.textMuted,
  },
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
