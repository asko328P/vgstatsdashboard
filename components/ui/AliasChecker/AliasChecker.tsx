import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";
import * as sea from "node:sea";
import { supabase } from "@/utils/supabase";
import { ThemedText } from "@/components/ui/ThemedText";
import { AntDesign } from "@expo/vector-icons";

type Props = {
  playerName: string;
};
const AliasChecker = ({ playerName }: Props) => {
  const [containerIsShown, setContainerIsShown] = useState(false);

  const [searchResults, setSearchResults] = useState<{ id: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      let { data, error } = await supabase.rpc("find_players_hashes", {
        search_text: playerName,
      });
      if (error) console.error(error);
      else setSearchResults(data);
    };
    fetchData();
  }, [playerName]);

  useEffect(() => {
    setContainerIsShown(true);
  }, [searchResults]);

  if (!containerIsShown) {
    return;
  }

  return (
    <View style={styles.container}>
      <View style={{ alignSelf: "flex-end" }}>
        <TouchableOpacity
          onPress={() => {
            setContainerIsShown(false);
          }}
        >
          <AntDesign name="close" size={20} color={"#cdcdcd"} />
        </TouchableOpacity>
      </View>
      <View style={styles.topContainer}>
        <ThemedText>{"Viewing aliases for player: "}</ThemedText>
        <ThemedText type={"subtitle"}>{playerName}</ThemedText>
      </View>
      <View style={styles.results}>
        {searchResults.map((item) => (
          <View
            key={item.id}
            style={{ justifyContent: "space-between", flexDirection: "row" }}
          >
            <ThemedText>{""}</ThemedText>
            <ThemedText>{item.id}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
};

export default AliasChecker;

const styles = StyleSheet.create({
  results: {
    paddingRight: 10,
  },
  topContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  container: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
    backgroundColor: "#4a4a4a",
    borderRadius: 10,
    padding: 10,
    paddingTop: 5,
  },
});
