import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { GameRound } from "@/components/ui/GameRoundItem2/GameRoundItem2";
import { GameRoundPlayer } from "@/app/viewDemo";

export type GameData = GameRound & { game_round_player: GameRoundPlayer[] };

export type LeaderboardRange = "1D" | "3D" | "7D";

export const DAYS_PER_RANGE: { [range in LeaderboardRange]: number } = {
  "1D": 1,
  "3D": 3,
  "7D": 7,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const fetchLeaderboardRounds = async (range: LeaderboardRange) => {
  const daysBack = DAYS_PER_RANGE[range] ?? 1;
  const rangeStart = new Date(Date.now() - daysBack * MS_PER_DAY);

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

const fetchGameRounds = async (from: number, to: number) => {
  const { data, error } = await supabase
    .from("game_rounds")
    .select(`*,game_round_player(*)`)
    .order("played_at", {
      ascending: false,
    })
    .range(from, to)
    .overrideTypes<GameData[]>();

  if (error) {
    throw error;
  }
  return data ?? [];
};

const fetchGameRoundCount = async () => {
  const { count, error } = await supabase
    .from("game_rounds")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw error;
  }
  return count ?? 0;
};

/**
 * Rounds (with their players) played within the last `range` days.
 *
 * One cache entry per range, shared by every caller: the home page summary and
 * the leaderboards screen hit the same entry for the same range, so opening the
 * leaderboards costs no extra request.
 */
export const useLeaderboardRoundsQuery = (range: LeaderboardRange) =>
  useQuery({
    queryKey: ["leaderboardRounds", range],
    queryFn: () => fetchLeaderboardRounds(range),
    // Keeps the previous range's cards on screen while the new one loads.
    placeholderData: (previous) => previous,
  });

/**
 * A single page of rounds. Each page is its own cache entry, so paging back is
 * instant. `from`/`to` are only known once the list has been measured, hence
 * the `enabled` guard.
 */
export const useGameRoundsQuery = (gameRange: number[]) =>
  useQuery({
    queryKey: ["gameRounds", gameRange[0], gameRange[1]],
    queryFn: () => fetchGameRounds(gameRange[0], gameRange[1]),
    enabled: gameRange.length !== 0,
    // Keeps the current page visible while the next one loads, so the list
    // does not collapse and re-trigger the measurement.
    placeholderData: (previous) => previous,
  });

export const useGameRoundCountQuery = () =>
  useQuery({
    queryKey: ["gameRoundCount"],
    queryFn: fetchGameRoundCount,
  });
