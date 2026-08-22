import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
  LayoutRectangle,
} from "react-native";
import GameRoundItem2, {
  GameRound,
} from "@/components/ui/GameRoundItem2/GameRoundItem2";
import { ThemedText } from "@/components/ui/ThemedText";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { GameRoundPlayer } from "@/app/viewDemo";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { toReadableDayMonth } from "@/utils/functions";

const NUMBER_OF_GAMES_TO_SHOW = 10;

type GameData = GameRound & { game_round_player: GameRoundPlayer[] };

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

const AllGameRounds = () => {
  const [measuredRectangle, setMeasuredRectangle] = useState<
    LayoutRectangle | undefined
  >(undefined);
  const [dummyRectangle, setDummyRectangle] = useState<
    LayoutRectangle | undefined
  >(undefined);

  const [gameRange, setGameRange] = useState<number[]>([]);

  // The range is only known once the list has been measured, hence `enabled`.
  // Each page is its own cache entry, so paging back is instant.
  const { data: gameData = [], isFetching: isLoading } = useQuery({
    queryKey: ["gameRounds", gameRange[0], gameRange[1]],
    queryFn: () => fetchGameRounds(gameRange[0], gameRange[1]),
    enabled: gameRange.length !== 0,
    // Keeps the current page visible while the next one loads, so the list
    // does not collapse and re-trigger the measurement below.
    placeholderData: (previous) => previous,
  });

  const { data: gameRoundCount = 0 } = useQuery({
    queryKey: ["gameRoundCount"],
    queryFn: fetchGameRoundCount,
  });

  useEffect(() => {
    if (!measuredRectangle || !dummyRectangle) return;
    setGameRange((prevState) => {
      if (prevState.length !== 0) {
        return prevState;
      } else {
        return [
          0,
          Math.max(
            3,
            Math.floor(measuredRectangle.height / dummyRectangle.height),
          ),
        ];
      }
    });
  }, [measuredRectangle, dummyRectangle]);

  const previousPaginationHandler = () => {
    let copiedGameRange = gameRange.slice(0);
    let difference = Math.abs(copiedGameRange[1] - copiedGameRange[0]);
    copiedGameRange[1] = copiedGameRange[0] - 1;
    copiedGameRange[0] = copiedGameRange[0] - 1 - difference;
    setGameRange(copiedGameRange);
  };

  const nextPaginationHandler = () => {
    let copiedGameRange = gameRange.slice(0);
    let difference = Math.abs(copiedGameRange[1] - copiedGameRange[0]);
    copiedGameRange[0] = copiedGameRange[1] + 1;
    copiedGameRange[1] = copiedGameRange[1] + 1 + difference;
    setGameRange(copiedGameRange);
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateAndSeparator}>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            flexShrink: 1,
          }}
        >
          <View>
            <ThemedText type={"label"}>{"Rounds"}</ThemedText>
          </View>
          <View style={{ flexShrink: 1 }}>
            <ThemedText
              type={"micro"}
            >{` ${gameRoundCount} recorded`}</ThemedText>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            borderTopColor: UnistylesRuntime.getTheme().colors.surface3,
            borderTopWidth: 1,
          }}
        />
        <View style={styles.paginationButtonsHolder}>
          <TouchableOpacity
            disabled={gameRange[0] === 0}
            onPress={previousPaginationHandler}
            style={[
              styles.paginationTouchable,
              {
                opacity: gameRange[0] === 0 ? 0.5 : 1,
              },
            ]}
          >
            <ThemedText>{"◀ PREV"}</ThemedText>
            {isLoading && (
              <View style={styles.activityIndicatorHolder}>
                <ActivityIndicator style={{ opacity: 0.2 }} />
              </View>
            )}
          </TouchableOpacity>
          <ThemedText>{`${gameRange[0] + 1} to ${gameRange[1] + 1}`}</ThemedText>
          <TouchableOpacity
            onPress={nextPaginationHandler}
            style={styles.paginationTouchable}
          >
            <ThemedText>{"NEXT ▶"}</ThemedText>
            {isLoading && (
              <View style={styles.activityIndicatorHolder}>
                <ActivityIndicator style={{ opacity: 0.2 }} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={styles.measurerView}
        onLayout={(event) => setMeasuredRectangle(event.nativeEvent.layout)}
      >
        {/*dummy measure*/}
        <GameRoundItem2
          style={{ opacity: 0, position: "absolute" }}
          onLayout={(event) => setDummyRectangle(event.nativeEvent.layout)}
        />
        {gameData.map((item) => (
          <GameRoundItem2 key={item.id} gameRound={item} />
        ))}
        <View style={styles.footer}>
          <ThemedText type={"micro"} style={styles.footerText}>
            {"Made with <3 for the VG PR community."}
          </ThemedText>
          <ThemedText type={"micro"} style={styles.footerText}>
            {"=EINF= asko_"}
          </ThemedText>
        </View>
      </View>
    </View>
  );
};

export default AllGameRounds;

const styles = StyleSheet.create((theme) => ({
  measurerView: {
    flex: 1,
    gap: theme.margins.sm,
  },
  footer: {
    alignItems: "center",
    gap: 2,
    paddingTop: 0,
    paddingBottom: theme.margins.sm,
  },
  footerText: {
    fontSize: 8,
    color: theme.colors.textMuted,
  },
  rounds: {
    color: theme.colors.textMuted,
  },
  dateAndSeparator: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.xl,
  },
  container: {
    gap: theme.margins.lg,
    flex: 1,
  },
  activityIndicatorHolder: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  paginationButtonsHolder: {
    alignItems: "center",
    gap: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  paginationTouchable: {
    padding: 10,
    paddingVertical: 0,
    backgroundColor: theme.colors.surface3,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 5,
  },
  contentContainerStyle: {
    // paddingH: 20,
    paddingBottom: 50,
    gap: 10,
  },
}));
