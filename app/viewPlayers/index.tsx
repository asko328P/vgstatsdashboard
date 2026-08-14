import { View } from "react-native";
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
        //@ts-ignore
        // setSingleGameData(data);
      }
    };
    getData();
  }, []);

  return (
    <View style={styles.container}>
      <PageHeader />
      <View style={styles.horizontalVerticalContainer(expandAllLists)}></View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  horizontalVerticalContainer: (isExpanded) => ({
    flexDirection: isExpanded ? "row" : "column",
  }),

  container: {
    flex: 1,
    // padding: theme.margins.md,
    gap: theme.margins.md,
    // flexDirection: "row",
  },
}));
