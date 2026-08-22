import { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native-unistyles";
import LeaderboardsHeader from "@/components/ui/LeaderboardsHeader/LeaderboardsHeader";
import { supabase } from "@/utils/supabase";
import { GameRound } from "@/components/ui/GameRoundItem2/GameRoundItem2";
import { GameRoundPlayer } from "@/app/viewDemo";

type GameData = GameRound & { game_round_player: GameRoundPlayer[] };

const POSSIBLE_RANGES = ["1D", "3D", "7D"];

export default function Page() {
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState("7D");

  const [gameData, setGameData] = useState<GameData[] | null>([]);

  useEffect(() => {
    const fetchData = async () => {
      let howManyDaysback = 1;
      switch (selectedRange) {
        case "7D":
          howManyDaysback = 7;
          return;
        case "3D":
          howManyDaysback = 3;
          return;
        case "1D":
          howManyDaysback = 1;
          return;
      }
      const sevenDaysInMs = howManyDaysback * 24 * 60 * 60 * 1000;
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
  }, [selectedRange]);

  return (
    <View style={styles.container}>
      <LeaderboardsHeader
        headerTitle={"Leaderboards"}
        possibleRanges={POSSIBLE_RANGES}
        selectedRange={selectedRange}
        onRangePress={setSelectedRange}
        onBackPress={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    gap: theme.margins.md,
  },
}));
