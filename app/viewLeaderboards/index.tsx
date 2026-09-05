import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import LeaderboardsHeader from "@/components/ui/LeaderboardsHeader/LeaderboardsHeader";
import LeaderBoardStatHolder from "@/components/ui/LeaderBoardStatHolder/LeaderBoardStatHolder";
import { ThemedText } from "@/components/ui/ThemedText";
import { buildStatValue, toReadableDayMonth } from "@/utils/functions";
import { LeaderboardRange, useLeaderboardRoundsQuery } from "@/utils/queries";

const POSSIBLE_RANGES: LeaderboardRange[] = ["1D", "3D", "7D"];

const SLICE_RANGE = 15;

export default function Page() {
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState<LeaderboardRange>("1D");

  const { data: gameData, isFetching: gameIsFetching } =
    useLeaderboardRoundsQuery(selectedRange);

  const topKiller = useMemo(() => {
    if (!gameData) return [];
    const allPlayersKills: {
      [key: string]: number;
    } = {};
    gameData.forEach((game) => {
      game.game_round_player.forEach((player) => {
        if (!allPlayersKills[player.player_id]) {
          allPlayersKills[player.player_id] = 0;
        }
        allPlayersKills[player.player_id] += player.kills;
      });
    });

    let allKillsArray = [];

    for (const [key, value] of Object.entries(allPlayersKills)) {
      if (key.startsWith("[R-BOT]")) {
        continue;
      }
      allKillsArray.push({
        player_id: key,
        kills: value,
      });
    }
    allKillsArray = allKillsArray.sort((a, b) => b.kills - a.kills);

    return allKillsArray;
  }, [gameData]);

  const topMedic = useMemo(() => {
    if (!gameData) return [];
    const allPlayersRevives: {
      [key: string]: number;
    } = {};
    gameData.forEach((game) => {
      game.game_round_player.forEach((player) => {
        if (!allPlayersRevives[player.player_id]) {
          allPlayersRevives[player.player_id] = 0;
        }
        allPlayersRevives[player.player_id] += player.revivals;
      });
    });

    let allMedicsArray = [];

    for (const [key, value] of Object.entries(allPlayersRevives)) {
      if (key.startsWith("[R-BOT]")) {
        continue;
      }
      allMedicsArray.push({
        player_id: key,
        revivals: value,
      });
    }
    allMedicsArray = allMedicsArray.sort((a, b) => b.revivals - a.revivals);

    return allMedicsArray;
    // return `${allMedicsArray[0]?.player_id ?? " -"} ${allMedicsArray[0]?.revivals ?? "0"} revives`;
  }, [gameData]);

  const topDestroyer = useMemo(() => {
    if (!gameData) return [];
    const allPlayersDestructions: {
      [key: string]: number;
    } = {};
    gameData.forEach((game) => {
      game.game_round_player.forEach((player) => {
        if (!allPlayersDestructions[player.player_id]) {
          allPlayersDestructions[player.player_id] = 0;
        }
        allPlayersDestructions[player.player_id] += player.vehicle_destroyeds;
      });
    });

    let allDestructorsArray = [];

    for (const [key, value] of Object.entries(allPlayersDestructions)) {
      if (key.startsWith("[R-BOT]")) {
        continue;
      }
      allDestructorsArray.push({
        player_id: key,
        vehicle_destroyeds: value,
      });
    }
    allDestructorsArray = allDestructorsArray.sort(
      (a, b) => b.vehicle_destroyeds - a.vehicle_destroyeds,
    );

    return allDestructorsArray;
  }, [gameData]);

  const mostRounds = useMemo(() => {
    if (!gameData) return [];
    const allPlayersRounds: {
      [key: string]: number;
    } = {};
    gameData.forEach((game) => {
      game.game_round_player.forEach((player) => {
        if (!allPlayersRounds[player.player_id]) {
          allPlayersRounds[player.player_id] = 0;
        }
        allPlayersRounds[player.player_id] += 1;
      });
    });

    let allPlayersArray = [];

    for (const [key, value] of Object.entries(allPlayersRounds)) {
      if (key.startsWith("[R-BOT]")) {
        continue;
      }
      allPlayersArray.push({
        player_id: key,
        rounds: value,
      });
    }
    allPlayersArray = allPlayersArray.sort((a, b) => b.rounds - a.rounds);

    return allPlayersArray;
  }, [gameData]);

  const onBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.dismissAll();
      router.replace("/");
    }
  };

  const daysCovered = useMemo(() => {
    const first = gameData?.at(0)?.played_at;
    const last = gameData?.at(-1)?.played_at;
    if (!first || !last) {
      return 0;
    }
    const msPerDay = 24 * 60 * 60 * 1000;
    const difference = new Date(last).getTime() - new Date(first).getTime();
    return Math.max(1, Math.round(Math.abs(difference) / msPerDay));
  }, [gameData]);

  return (
    <View style={styles.container}>
      <LeaderboardsHeader
        headerTitle={"Leaderboards"}
        possibleRanges={POSSIBLE_RANGES}
        selectedRange={selectedRange}
        onRangePress={(range) => setSelectedRange(range as LeaderboardRange)}
        onBackPress={onBackPress}
      />
      <View style={styles.dateAndSeparator}>
        <ThemedText
          type={"label"}
        >{`Last ${daysCovered} ${daysCovered === 1 ? "day" : "days"}`}</ThemedText>
        <View
          style={{
            flex: 1,
            borderTopColor: UnistylesRuntime.getTheme().colors.surface3,
            borderTopWidth: 1,
          }}
        />
        {gameData && (
          <ThemedText
            style={styles.rounds}
            type={"log"}
          >{`${toReadableDayMonth(gameData.at(0)?.played_at!)} - ${toReadableDayMonth(gameData.at(-1)?.played_at!)} · ${gameData.length} rounds`}</ThemedText>
        )}
      </View>
      <ScrollView contentContainerStyle={styles.leaderBoardsHolder}>
        {topMedic.length !== 0 && (
          <LeaderBoardStatHolder
            isFetching={gameIsFetching}
            label={"Best medic"}
            value={buildStatValue(
              topMedic.at(0)?.player_id ?? "-",
              topMedic.at(0)?.revivals ?? "0",
              "revives",
            )}
            type={"medic"}
            statsArray={topMedic
              .slice(1, SLICE_RANGE)
              .map((item) => ({ name: item.player_id, value: item.revivals }))}
          />
        )}
        {topKiller.length !== 0 && (
          <LeaderBoardStatHolder
            isFetching={gameIsFetching}
            label={"Most kills"}
            value={buildStatValue(
              topKiller.at(0)?.player_id ?? "-",
              topKiller.at(0)?.kills ?? "0",
              "kills",
            )}
            type={"killer"}
            statsArray={topKiller
              .slice(1, SLICE_RANGE)
              .map((item) => ({ name: item.player_id, value: item.kills }))}
          />
        )}
        {topDestroyer.length !== 0 && (
          <LeaderBoardStatHolder
            isFetching={gameIsFetching}
            label={"Vehicle destroyer"}
            value={buildStatValue(
              topDestroyer.at(0)?.player_id ?? "-",
              topDestroyer.at(0)?.vehicle_destroyeds ?? "0",
              "assets",
            )}
            type={"destroyer"}
            statsArray={topDestroyer.slice(1, SLICE_RANGE).map((item) => ({
              name: item.player_id,
              value: item.vehicle_destroyeds,
            }))}
          />
        )}
        {mostRounds.length !== 0 && (
          <LeaderBoardStatHolder
            isFetching={gameIsFetching}
            label={"Most rounds played"}
            value={buildStatValue(
              mostRounds.at(0)?.player_id ?? "-",
              mostRounds.at(0)?.rounds ?? "-",
              "rounds",
            )}
            type={"player"}
            statsArray={mostRounds
              .slice(1, SLICE_RANGE)
              .map((item) => ({ name: item.player_id, value: item.rounds }))}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  rounds: {
    color: theme.colors.textMuted,
  },
  dateAndSeparator: {
    paddingHorizontal: theme.margins.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.xl,
  },
  leaderBoardsHolder: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    paddingBottom: theme.margins.xxl,
    gap: theme.margins.lg,
    paddingHorizontal: theme.margins.md,
  },
  container: {
    flex: 1,
    gap: theme.margins.md,
  },
}));
