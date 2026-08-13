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
import { supabase } from "@/utils/supabase";
import { GameRoundPlayer } from "@/app/viewDemo";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { toReadableDayMonth } from "@/utils/functions";

const NUMBER_OF_GAMES_TO_SHOW = 10;

type GameData = GameRound & { game_round_player: GameRoundPlayer[] };

const AllGameRounds = () => {
  const [gameData, setGameData] = useState<GameData[]>([]);
  const [gameRoundCount, setGameRoundCount] = useState(0);

  const [measuredRectangle, setMeasuredRectangle] = useState<
    LayoutRectangle | undefined
  >(undefined);
  const [dummyRectangle, setDummyRectangle] = useState<
    LayoutRectangle | undefined
  >(undefined);

  const [isLoading, setIsLoading] = useState(false);

  const [gameRange, setGameRange] = useState([]);

  useEffect(() => {
    if (!measuredRectangle || !dummyRectangle) return;
    setGameRange([
      0,
      Math.round(measuredRectangle.height / dummyRectangle.height),
    ]);
  }, [measuredRectangle, dummyRectangle]);

  useEffect(() => {
    if (gameRange.length === 0) {
      return;
    }
    const getData = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("game_rounds")
        .select(`*,game_round_player!inner(*)`)
        .order("id", {
          ascending: false,
        })
        .range(gameRange[0], gameRange[1])
        .overrideTypes<GameData[]>();
      if (data) {
        setGameData(data);
      }
      setIsLoading(false);
    };

    const getRoundCountData = async () => {
      const { count, error } = await supabase
        .from("game_rounds")
        .select("*", { count: "exact", head: true })
        .overrideTypes<number>();

      setGameRoundCount(count ?? 0);
    };

    getData();
    getRoundCountData();
  }, [gameRange]);

  const previousPaginationHandler = () => {
    let copiedGameRange = gameRange.slice(0);
    let difference = Math.abs(copiedGameRange[1] - copiedGameRange[0]);
    copiedGameRange[1] = copiedGameRange[0];
    copiedGameRange[0] = copiedGameRange[0] - difference;
    setGameRange(copiedGameRange);
  };

  const nextPaginationHandler = () => {
    let copiedGameRange = gameRange.slice(0);
    let difference = Math.abs(copiedGameRange[1] - copiedGameRange[0]);
    copiedGameRange[0] = copiedGameRange[1];
    copiedGameRange[1] = copiedGameRange[1] + difference;
    setGameRange(copiedGameRange);
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateAndSeparator}>
        <ThemedText type={"label"}>{"Rounds"}</ThemedText>
        <ThemedText type={"micro"}>{`${gameRoundCount} recorded`}</ThemedText>
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
                <ActivityIndicator />
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
                <ActivityIndicator />
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
      </View>
    </View>
  );

  return (
    <>
      <ThemedText>{`Showing games from ${gameRange[0]} to ${gameRange[1]}`}</ThemedText>
      <FlatList
        contentContainerStyle={styles.contentContainerStyle}
        style={{ flex: 1 }}
        data={gameData}
        renderItem={({ item }) => <GameRoundItem gameRound={item} />}
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
          <ThemedText>{"previous page"}</ThemedText>
          {isLoading && (
            <View style={styles.activityIndicatorHolder}>
              <ActivityIndicator />
            </View>
          )}
        </TouchableOpacity>
        <ThemedText>{`Showing games from ${gameRange[0]} to ${gameRange[1]}`}</ThemedText>
        <TouchableOpacity
          onPress={nextPaginationHandler}
          style={styles.paginationTouchable}
        >
          <ThemedText>{"Next page"}</ThemedText>
          {isLoading && (
            <View style={styles.activityIndicatorHolder}>
              <ActivityIndicator />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

export default AllGameRounds;

const styles = StyleSheet.create((theme) => ({
  measurerView: {
    flex: 1,
    gap: theme.margins.sm,
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
