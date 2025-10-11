import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import GameRoundItem, {
  GameRound,
} from "@/components/ui/GameRoundItem/GameRoundItem";
import { GameRoundPlayer } from "@/app/viewDemo";

const NUMBER_OF_GAMES_TO_SHOW = 10;

type GameData = GameRound & { game_round_player: GameRoundPlayer[] };

export default function Page() {
  const [gameData, setGameData] = useState<GameData[]>([]);

  const [gameRange, setGameRange] = useState([0, NUMBER_OF_GAMES_TO_SHOW]);

  useEffect(() => {
    const getData = async () => {
      const { data, error } = await supabase
        .from("game_rounds")
        .select(`*,game_round_player!inner(*)`)
        .order("id", {
          ascending: false,
        })
        .range(gameRange[0], gameRange[1])
        .overrideTypes<GameData[]>();
      if (data) {
        console.log(data);
        setGameData(data);
      }
    };

    getData();
  }, [gameRange]);

  const previousPaginationHandler = () => {
    let copiedGameRange = gameRange.slice(0);
    copiedGameRange[1] = copiedGameRange[0];
    copiedGameRange[0] = copiedGameRange[0] - NUMBER_OF_GAMES_TO_SHOW;
    setGameRange(copiedGameRange);
  };

  const nextPaginationHandler = () => {
    let copiedGameRange = gameRange.slice(0);
    copiedGameRange[0] = copiedGameRange[1];
    copiedGameRange[1] = copiedGameRange[1] + NUMBER_OF_GAMES_TO_SHOW;
    setGameRange(copiedGameRange);
  };
  return (
    <View style={{ flex: 1 }}>
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
        </TouchableOpacity>
        <ThemedText>{`Showing games from ${gameRange[0]} to ${gameRange[1]}`}</ThemedText>
        <TouchableOpacity
          onPress={nextPaginationHandler}
          style={styles.paginationTouchable}
        >
          <ThemedText>{"Next page"}</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  paginationButtonsHolder: {
    alignItems: "center",
    gap: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  paginationTouchable: {
    padding: 10,
    backgroundColor: "#272727",
    borderRadius: 5,
  },
  contentContainerStyle: {
    padding: 20,
    paddingBottom: 200,
    gap: 10,
  },
});
