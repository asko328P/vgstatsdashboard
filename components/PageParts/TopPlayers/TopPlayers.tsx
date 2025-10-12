import { StyleSheet, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/utils/supabase";
import { GameRound } from "@/components/ui/GameRoundItem/GameRoundItem";
import { GameRoundPlayer } from "@/app/viewDemo";
import { ThemedText } from "@/components/ui/ThemedText";
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type GameData = GameRound & { game_round_player: GameRoundPlayer[] };

type DataProps = {
  label: string;
  value: any;
  type?: "medic" | "killer";
};
const DataHolder = ({ label, value, type = "medic" }: DataProps) => {
  const colors = useMemo(() => {
    switch (type) {
      case "medic":
        return {
          containerBackground: "#0b1905",
          containerBorderColor: "#41b333",
          labelColor: "#41b333",
          valueColor: "#41b333",
        };
      case "killer":
        return {
          containerBackground: "#190505",
          containerBorderColor: "#b33333",
          labelColor: "#b33333",
          valueColor: "#b33333",
        };
      default:
        return {
          containerBackground: "#131313",
          containerBorderColor: "#FFFFFF",
          labelColor: "#FFFFFF",
          valueColor: "#FFFFFF",
        };
    }
  }, [type]);
  return (
    <View
      style={[
        styles.dataHolder,
        {
          backgroundColor: colors.containerBackground,
          borderColor: colors.containerBorderColor,
        },
      ]}
    >
      {type === "medic" && (
        <FontAwesome
          style={{ position: "absolute", right: 8, top: 6 }}
          name="plus"
          size={90}
          color={"#122c0e"}
        />
      )}
      {type === "killer" && (
        <FontAwesome6
          style={{ position: "absolute", right: 8, top: 6 }}
          name="crosshairs"
          size={90}
          color={"#331010"}
        />
      )}
      <ThemedText
        style={{
          color: colors.labelColor,
        }}
      >
        {label}
      </ThemedText>
      <ThemedText />
      <ThemedText style={{ color: colors.valueColor, fontSize: 20 }}>
        {value}
      </ThemedText>
    </View>
  );
};

const TopPlayers = () => {
  const [gameData, setGameData] = useState<GameData[] | null>([]);

  useEffect(() => {
    const fetchData = async () => {
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - sevenDaysInMs);
      const { data } = await supabase
        .from("game_rounds")
        .select(`*, game_round_player!inner(*)`)
        .gte("played_at", sevenDaysAgo.toISOString())
        .overrideTypes<GameData[]>();

      setGameData(data);
      console.log("data", data);
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

    return `${allKillsArray[0]?.player_id}: ${allKillsArray[0]?.revivals} kills`;
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

    return `${allMedicsArray[0]?.player_id}: ${allMedicsArray[0]?.revivals} rev.`;
  }, [gameData]);

  return (
    <View style={styles.container}>
      <ThemedText type={"title"}>{"Last 7 days"}</ThemedText>
      <View style={{ flexDirection: "row", gap: 16 }}>
        <DataHolder label={"Best medic"} value={topMedic} type={"medic"} />
        <DataHolder label={"Most kills"} value={topKiller} type={"killer"} />
      </View>
    </View>
  );
};

export default TopPlayers;

const styles = StyleSheet.create({
  dataHolder: {
    justifyContent: "space-around",
    padding: 10,
    paddingTop: 16,
    aspectRatio: 1.2,
    borderRadius: 16,
    borderWidth: 3,
  },
  container: {
    // padding: 20,
    // flexDirection: "row",
    gap: 16,
    backgroundColor: "#0e0e0e",
    padding: 20,
    borderRadius: 16,
  },
});
