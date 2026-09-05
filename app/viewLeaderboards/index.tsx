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

type LeaderboardMode = "TOTAL" | "PER ROUND";

const POSSIBLE_MODES: LeaderboardMode[] = ["TOTAL", "PER ROUND"];

// A rate board needs a floor on rounds played: one lucky round would otherwise
// outrank every regular on the server.
const MIN_ROUNDS_FOR_RATE = 3;

const SLICE_RANGE = 15;

type PlayerStat = { player_id: string; value: number };

// Totals become per round averages when the mode asks for them. Players under
// the rounds floor drop out of the board entirely rather than ranking on a
// sample too small to mean anything.
const applyMode = (
  entries: PlayerStat[],
  roundsByPlayer: { [player_id: string]: number },
  mode: LeaderboardMode,
) => {
  if (mode === "TOTAL") {
    return entries;
  }
  return entries
    .filter(
      (entry) => (roundsByPlayer[entry.player_id] ?? 0) >= MIN_ROUNDS_FOR_RATE,
    )
    .map((entry) => ({
      ...entry,
      value: entry.value / (roundsByPlayer[entry.player_id] || 1),
    }))
    .sort((a, b) => b.value - a.value);
};

// Totals are whole; averages need decimals to tell 2.4 apart from 2.35.
const formatStatValue = (
  value: number | undefined,
  mode: LeaderboardMode = "TOTAL",
) => {
  if (value === undefined) {
    return "0";
  }
  return mode === "TOTAL" ? String(value) : value.toFixed(2);
};

const formatUnit = (unit: string, mode: LeaderboardMode) =>
  mode === "TOTAL" ? unit : `${unit}/round`;

export default function Page() {
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState<LeaderboardRange>("1D");
  const [selectedMode, setSelectedMode] = useState<LeaderboardMode>("TOTAL");

  const { data: gameData, isFetching: gameIsFetching } =
    useLeaderboardRoundsQuery(selectedRange);

  // Rounds played per player, bots included: it is both its own board and the
  // divisor every other board uses in "per round" mode.
  const roundsByPlayer = useMemo(() => {
    const rounds: { [player_id: string]: number } = {};
    gameData?.forEach((game) => {
      game.game_round_player.forEach((player) => {
        rounds[player.player_id] = (rounds[player.player_id] ?? 0) + 1;
      });
    });
    return rounds;
  }, [gameData]);

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

    let allKillsArray: PlayerStat[] = [];

    for (const [key, value] of Object.entries(allPlayersKills)) {
      if (key.startsWith("[R-BOT]")) {
        continue;
      }
      allKillsArray.push({
        player_id: key,
        value,
      });
    }
    allKillsArray = allKillsArray.sort((a, b) => b.value - a.value);

    return applyMode(allKillsArray, roundsByPlayer, selectedMode);
  }, [gameData, roundsByPlayer, selectedMode]);

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

    let allMedicsArray: PlayerStat[] = [];

    for (const [key, value] of Object.entries(allPlayersRevives)) {
      if (key.startsWith("[R-BOT]")) {
        continue;
      }
      allMedicsArray.push({
        player_id: key,
        value,
      });
    }
    allMedicsArray = allMedicsArray.sort((a, b) => b.value - a.value);

    return applyMode(allMedicsArray, roundsByPlayer, selectedMode);
  }, [gameData, roundsByPlayer, selectedMode]);

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

    let allDestructorsArray: PlayerStat[] = [];

    for (const [key, value] of Object.entries(allPlayersDestructions)) {
      if (key.startsWith("[R-BOT]")) {
        continue;
      }
      allDestructorsArray.push({
        player_id: key,
        value,
      });
    }
    allDestructorsArray = allDestructorsArray.sort((a, b) => b.value - a.value);

    return applyMode(allDestructorsArray, roundsByPlayer, selectedMode);
  }, [gameData, roundsByPlayer, selectedMode]);

  // Always a total: every player plays exactly one round per round, so this
  // board has no per round form.
  const mostRounds = useMemo(() => {
    let allPlayersArray: PlayerStat[] = [];

    for (const [key, value] of Object.entries(roundsByPlayer)) {
      if (key.startsWith("[R-BOT]")) {
        continue;
      }
      allPlayersArray.push({
        player_id: key,
        value,
      });
    }
    allPlayersArray = allPlayersArray.sort((a, b) => b.value - a.value);

    return allPlayersArray;
  }, [roundsByPlayer]);

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
        possibleModes={POSSIBLE_MODES}
        selectedMode={selectedMode}
        infoText={
          selectedMode === "PER ROUND"
            ? `Min ${MIN_ROUNDS_FOR_RATE} rounds`
            : undefined
        }
        onRangePress={(range) => setSelectedRange(range as LeaderboardRange)}
        onModePress={(mode) => setSelectedMode(mode as LeaderboardMode)}
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
              formatStatValue(topMedic.at(0)?.value, selectedMode),
              formatUnit("revives", selectedMode),
            )}
            type={"medic"}
            statsArray={topMedic.slice(1, SLICE_RANGE).map((item) => ({
              name: item.player_id,
              value: formatStatValue(item.value, selectedMode),
            }))}
          />
        )}
        {topKiller.length !== 0 && (
          <LeaderBoardStatHolder
            isFetching={gameIsFetching}
            label={"Most kills"}
            value={buildStatValue(
              topKiller.at(0)?.player_id ?? "-",
              formatStatValue(topKiller.at(0)?.value, selectedMode),
              formatUnit("kills", selectedMode),
            )}
            type={"killer"}
            statsArray={topKiller.slice(1, SLICE_RANGE).map((item) => ({
              name: item.player_id,
              value: formatStatValue(item.value, selectedMode),
            }))}
          />
        )}
        {topDestroyer.length !== 0 && (
          <LeaderBoardStatHolder
            isFetching={gameIsFetching}
            label={"Vehicle destroyer"}
            value={buildStatValue(
              topDestroyer.at(0)?.player_id ?? "-",
              formatStatValue(topDestroyer.at(0)?.value, selectedMode),
              formatUnit("assets", selectedMode),
            )}
            type={"destroyer"}
            statsArray={topDestroyer.slice(1, SLICE_RANGE).map((item) => ({
              name: item.player_id,
              value: formatStatValue(item.value, selectedMode),
            }))}
          />
        )}
        {mostRounds.length !== 0 && (
          <LeaderBoardStatHolder
            isFetching={gameIsFetching}
            label={"Most rounds played"}
            value={buildStatValue(
              mostRounds.at(0)?.player_id ?? "-",
              formatStatValue(mostRounds.at(0)?.value),
              "rounds",
            )}
            type={"player"}
            statsArray={mostRounds
              .slice(1, SLICE_RANGE)
              .map((item) => ({ name: item.player_id, value: item.value }))}
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
