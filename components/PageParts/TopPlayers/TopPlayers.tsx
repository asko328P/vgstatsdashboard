import { TouchableOpacity, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/utils/supabase";
import { GameRound } from "@/components/ui/GameRoundItem2/GameRoundItem2";
import { GameRoundPlayer } from "@/app/viewDemo";
import { ThemedText } from "@/components/ui/ThemedText";
import LeaderBoardStatHolder from "@/components/ui/LeaderBoardStatHolder/LeaderBoardStatHolder";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { toReadableDate, toReadableDayMonth } from "@/utils/functions";
import { useRouter } from "expo-router";

type GameData = GameRound & { game_round_player: GameRoundPlayer[] };

const TopPlayers = () => {
  const router = useRouter();
  const [gameData, setGameData] = useState<GameData[] | null>([]);

  useEffect(() => {
    const fetchData = async () => {
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - sevenDaysInMs);
      const { data, error } = await supabase
        .from("game_rounds")
        .select(`*, game_round_player!inner(*)`)
        .order("played_at", {
          ascending: true,
        })
        .gte("played_at", sevenDaysAgo.toISOString())
        .overrideTypes<GameData[]>();

      setGameData(data);
    };

    fetchData();
  }, []);

  const topKiller = useMemo(() => {
    if (!gameData) return "";
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
      allKillsArray.push({
        player_id: key,
        revivals: value,
      });
    }
    allKillsArray = allKillsArray.sort((a, b) => b.revivals - a.revivals);

    return `${allKillsArray[0]?.player_id ?? " -"} ${allKillsArray[0]?.revivals ?? "0"} kills`;
  }, [gameData]);

  const topMedic = useMemo(() => {
    if (!gameData) return "";
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
      allMedicsArray.push({
        player_id: key,
        revivals: value,
      });
    }
    allMedicsArray = allMedicsArray.sort((a, b) => b.revivals - a.revivals);

    return `${allMedicsArray[0]?.player_id ?? " -"} ${allMedicsArray[0]?.revivals ?? "0"} revives`;
  }, [gameData]);

  const topDestroyer = useMemo(() => {
    if (!gameData) return "";
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
      allDestructorsArray.push({
        player_id: key,
        vehicle_destroyeds: value,
      });
    }
    allDestructorsArray = allDestructorsArray.sort(
      (a, b) => b.vehicle_destroyeds - a.vehicle_destroyeds,
    );

    return `${allDestructorsArray[0]?.player_id ?? " -"} ${allDestructorsArray[0]?.vehicle_destroyeds ?? "0"} assets`;
  }, [gameData]);

  const mostRounds = useMemo(() => {
    if (!gameData) return "";
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

    return `${allPlayersArray[0]?.player_id ?? " -"} ${allPlayersArray[0]?.rounds ?? "-"} rounds`;
  }, [gameData]);

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

  const navigateToLeaderBoards = () => {
    router.push("/viewLeaderboards");
  };

  return (
    <TouchableOpacity onPress={navigateToLeaderBoards} style={styles.container}>
      <View style={styles.dateAndSeparator}>
        <ThemedText type={"label"}>{`Last ${daysCovered} days`}</ThemedText>
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
      <View style={styles.dataHolderRow}>
        <LeaderBoardStatHolder
          label={"Best medic"}
          value={topMedic}
          type={"medic"}
        />
        <LeaderBoardStatHolder
          label={"Most kills"}
          value={topKiller}
          type={"killer"}
        />
        <LeaderBoardStatHolder
          label={"Vehicle destroyer"}
          value={topDestroyer}
          type={"destroyer"}
        />
        <LeaderBoardStatHolder
          label={"Most rounds played"}
          value={mostRounds}
          type={"player"}
        />
      </View>
    </TouchableOpacity>
  );
};

export default TopPlayers;

const styles = StyleSheet.create((theme) => ({
  rounds: {
    color: theme.colors.textMuted,
  },
  dateAndSeparator: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.xl,
  },
  dataHolderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  container: {
    // padding: 20,
    // flexDirection: "row",
    gap: 16,
    backgroundColor: theme.colors.surfaceBase,
    paddingVertical: 16,
    borderRadius: 16,
  },
}));
