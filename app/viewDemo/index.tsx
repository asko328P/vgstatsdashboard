import { FlatList, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import GameRoundItem, {
  GameRound,
} from "@/components/ui/gameRoundItem/gameRoundItem";
import KillItem, { Kill } from "@/components/ui/KillItem/KillItem";

export default function Page() {
  const { gameRoundId } = useLocalSearchParams<{ gameRoundId: string }>();

  const [singleGameData, setSingleGameData] = useState<
    GameRound & { kills: Kill[] }
  >();

  useEffect(() => {
    const getData = async () => {
      const { data, error } = await supabase
        .from("game_rounds")
        .select(
          `
        *, kills!inner(*)
        `,
        )
        .eq("id", gameRoundId)
        .maybeSingle()
        .overrideTypes<GameRound & { kills: Kill[] }>();
      if (error) {
        console.log("error", error);
      }
      if (data) {
        //@ts-ignore
        setSingleGameData(data);
      }
    };
    getData();
  }, []);
  return (
    <View style={styles.container}>
      {/*<View style={styles.topHolder}></View>*/}
      <FlatList
        data={singleGameData?.kills}
        renderItem={({ item }) => <KillItem kill={item} />}
      />
      <FlatList
        data={singleGameData?.kills}
        renderItem={({ item }) => <KillItem kill={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  singleFlatlistHolder: {
    flex: 1,
    backgroundColor: "green",
    padding: 10,
  },
  flatListsHolder: {
    gap: 10,
    flexDirection: "row",
    backgroundColor: "red",
  },
  topHolder: {},
  container: {
    flex: 1,
    flexDirection: "row",
  },
});
