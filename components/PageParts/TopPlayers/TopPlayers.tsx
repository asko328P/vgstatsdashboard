import { View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/utils/supabase";
import { GameRound } from "@/components/ui/GameRoundItem/GameRoundItem";
import { GameRoundPlayer } from "@/app/viewDemo";
import { ThemedText } from "@/components/ui/ThemedText";
import {
  FontAwesome,
  FontAwesome6,
  Ionicons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { toReadableDate, toReadableDayMonth } from "@/utils/functions";

type GameData = GameRound & { game_round_player: GameRoundPlayer[] };

type DataProps = {
  label: string;
  value: any;
  type?: "medic" | "killer" | "destroyer" | "player";
};
const DataHolder = ({ label, value, type = "medic" }: DataProps) => {
  const colors = useMemo(() => {
    switch (type) {
      case "medic":
        return {
          containerBackground: "#071003",
          containerBorderColor: "#41b333",
          labelColor: "#399c2d",
          valueColor: "#41b333",
        };
      case "destroyer":
        return {
          containerBackground: "#100903",
          containerBorderColor: "#cf6b35",
          labelColor: "#cf6a33",
          valueColor: "#c15829",
        };
      case "killer":
        return {
          containerBackground: "#190505",
          containerBorderColor: "#b33333",
          labelColor: "#b33333",
          valueColor: "#e42f2f",
        };
      case "player":
        return {
          containerBackground: "#171717",
          containerBorderColor: "#b5b5b5",
          labelColor: "#989898",
          valueColor: "#bdbdbd",
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
        <Ionicons
          style={{ position: "absolute", right: 8, top: 6 }}
          name="bandage-sharp"
          size={90}
          color={"#122c0e"}
        />
      )}
      {type === "killer" && (
        <SimpleLineIcons
          style={{ position: "absolute", right: 8, top: 6 }}
          name="target"
          size={90}
          color={"#4a1717"}
        />
      )}
      {type === "destroyer" && (
        <FontAwesome6
          name="explosion"
          style={{ position: "absolute", right: 8, bottom: 24 }}
          size={60}
          color={"#4a2c17"}
        />
      )}
      <ThemedText
        style={{
          color: colors.labelColor,
        }}
      >
        {label}
      </ThemedText>
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

  const topDestroyer = useMemo(() => {
    if (!gameData) return "";
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

    let allDestructorsArray = [];

    for (const [key, value] of Object.entries(allPlayersDestructions)) {
      allDestructorsArray.push({
        player_id: key,
        vehicle_destroyeds: value,
      });
    }
    allDestructorsArray = allDestructorsArray.sort(
      (a, b) => b.vehicle_destroyeds - a.vehicle_destroyeds,
    );

    return `${allDestructorsArray[0]?.player_id}: ${allDestructorsArray[0]?.vehicle_destroyeds} veh. d.`;
  }, [gameData]);

  const mostRounds = useMemo(() => {
    if (!gameData) return "";
    const allPlayersRounds: {
      [key: string]: number;
    } = {};
    gameData.forEach((game) => {
      game.game_round_player.forEach((player) => {
        if (!allPlayersRounds[player.player_id]) {
          allPlayersRounds[player.player_id] = 0;
        }
        allPlayersRounds[player.player_id] += 1;
      });
    });

    let allPlayersArray = [];

    for (const [key, value] of Object.entries(allPlayersRounds)) {
      if (key.startsWith("[R-BOT]")) {
        continue;
      }
      allPlayersArray.push({
        player_id: key,
        rounds: value,
      });
    }
    allPlayersArray = allPlayersArray.sort((a, b) => b.rounds - a.rounds);

    return `${allPlayersArray[0]?.player_id}: ${allPlayersArray[0]?.rounds} rounds`;
  }, [gameData]);

  return (
    <View style={styles.container}>
      <View style={styles.dateAndSeparator}>
        <ThemedText type={"label"}>{"Last 7 days"}</ThemedText>
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
      {
        // @ts-ignore
        <View style={{ flexDirection: "row", gap: 16 }}>
          <DataHolder label={"Best medic"} value={topMedic} type={"medic"} />
          <DataHolder label={"Most kills"} value={topKiller} type={"killer"} />
          <DataHolder
            label={"Veh. destroyer"}
            value={topDestroyer}
            type={"destroyer"}
          />
          <DataHolder
            label={"Most rounds played"}
            value={mostRounds}
            type={"player"}
          />
        </View>
      }
    </View>
  );
};

export default TopPlayers;

const styles = StyleSheet.create((theme) => ({
  rounds: {
    color: theme.colors.textMuted,
  },
  dateAndSeparator: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.xl,
  },
  dataHolder: {
    justifyContent: "space-around",
    padding: 10,
    paddingTop: 16,
    // aspectRatio: 1.2,
    borderRadius: 10,
    borderWidth: 2,
    overflow: "hidden",
    gap: 30,
  },
  container: {
    // padding: 20,
    // flexDirection: "row",
    gap: 16,
    backgroundColor: theme.colors.surfaceBase,
    paddingVertical: 16,
    borderRadius: 16,
  },
}));
