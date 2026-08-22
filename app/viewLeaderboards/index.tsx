import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native-unistyles";
import LeaderboardsHeader from "@/components/ui/LeaderboardsHeader/LeaderboardsHeader";
import { supabase } from "@/utils/supabase";
import { GameRound } from "@/components/ui/GameRoundItem2/GameRoundItem2";
import { GameRoundPlayer } from "@/app/viewDemo";
import LeaderBoardStatHolder from "@/components/ui/LeaderBoardStatHolder/LeaderBoardStatHolder";

type GameData = GameRound & { game_round_player: GameRoundPlayer[] };

const POSSIBLE_RANGES = ["1D", "3D", "7D"];

const DAYS_PER_RANGE: { [range: string]: number } = {
  "1D": 1,
  "3D": 3,
  "7D": 7,
};

const fetchRounds = async (range: string) => {
  const daysBack = DAYS_PER_RANGE[range] ?? 1;
  const rangeStart = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("game_rounds")
    .select(`*, game_round_player!inner(*)`)
    .order("played_at", {
      ascending: true,
    })
    .gte("played_at", rangeStart.toISOString())
    .overrideTypes<GameData[]>();

  // Thrown rather than logged, so the query lands in an error state instead of
  // silently rendering empty cards.
  if (error) {
    throw error;
  }
  return data ?? [];
};

export default function Page() {
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState("1D");

  // One cache entry per range: flipping back to a range already looked at is
  // instant and costs no request.
  const { data: gameData } = useQuery({
    queryKey: ["leaderboardRounds", selectedRange],
    queryFn: () => fetchRounds(selectedRange),
    // Keeps the previous range's cards on screen while the new one loads.
    placeholderData: (previous) => previous,
  });

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

  return (
    <View style={styles.container}>
      <LeaderboardsHeader
        headerTitle={"Leaderboards"}
        possibleRanges={POSSIBLE_RANGES}
        selectedRange={selectedRange}
        onRangePress={setSelectedRange}
        onBackPress={onBackPress}
      />
      <View style={styles.leaderBoardsHolder}>
        {topMedic.length !== 0 && (
          <LeaderBoardStatHolder
            label={"Best medic"}
            value={`${topMedic.at(0)?.player_id ?? " -"} ${topMedic.at(0)?.revivals ?? "0"} revives`}
            type={"medic"}
            statsArray={topMedic
              .slice(1, 8)
              .map((item) => ({ name: item.player_id, value: item.revivals }))}
          />
        )}
        {topKiller.length !== 0 && (
          <LeaderBoardStatHolder
            label={"Most kills"}
            value={`${topKiller.at(0)?.player_id ?? " -"} ${topKiller.at(0)?.kills ?? "0"} kills`}
            type={"killer"}
            statsArray={topKiller
              .slice(1, 8)
              .map((item) => ({ name: item.player_id, value: item.kills }))}
          />
        )}
        {topDestroyer.length !== 0 && (
          <LeaderBoardStatHolder
            label={"Vehicle destroyer"}
            value={`${topDestroyer.at(0)?.player_id ?? " -"} ${topDestroyer.at(0)?.vehicle_destroyeds ?? "0"} assets`}
            type={"destroyer"}
            statsArray={topDestroyer.slice(1, 8).map((item) => ({
              name: item.player_id,
              value: item.vehicle_destroyeds,
            }))}
          />
        )}
        {mostRounds.length !== 0 && (
          <LeaderBoardStatHolder
            label={"Most rounds played"}
            value={`${mostRounds.at(0)?.player_id ?? " -"} ${mostRounds.at(0)?.rounds ?? "-"} rounds`}
            type={"player"}
            statsArray={mostRounds
              .slice(1, 8)
              .map((item) => ({ name: item.player_id, value: item.rounds }))}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  leaderBoardsHolder: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: theme.margins.lg,
    paddingHorizontal: theme.margins.md,
  },
  container: {
    flex: 1,
    gap: theme.margins.md,
  },
}));
