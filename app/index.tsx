import { FlatList, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import GameRoundItem, {
  GameRound,
} from "@/components/ui/gameRoundItem/gameRoundItem";

export default function Page() {
  const [gameData, setGameData] = useState<GameRound[]>([]);

  useEffect(() => {
    const getData = async () => {
      const { data, error } = await supabase
        .from("game_rounds")
        .select()
        .overrideTypes<GameRound[]>();
      if (data) {
        setGameData(data);
      }
    };

    getData();
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={styles.contentContainerStyle}
        style={{ flex: 1 }}
        data={gameData}
        renderItem={({ item }) => <GameRoundItem gameRound={item} />}
      />
      <ThemedText>{"Home page"}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainerStyle: {
    gap: 10,
  },
});
