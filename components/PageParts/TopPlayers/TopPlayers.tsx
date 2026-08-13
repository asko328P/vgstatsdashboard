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
  const valuesArray = value.split(" ");
  const colors = useMemo(() => {
    switch (type) {
      case "medic":
        return {
          typeColor: UnistylesRuntime.getTheme().colors.accentMedic,
        };
      case "destroyer":
        return {
          typeColor: UnistylesRuntime.getTheme().colors.accentVehicle,
        };
      case "killer":
        return {
          typeColor: UnistylesRuntime.getTheme().colors.accentKill,
        };
      case "player":
        return {
          typeColor: UnistylesRuntime.getTheme().colors.accentSelect,
        };
      default:
        return {
          typeColor: UnistylesRuntime.getTheme().colors.accentMedic,
        };
    }
  }, [type]);
  return (
    <View
      style={[
        styles.dataHolder,
        {
          borderColor: colors.typeColor,
        },
      ]}
    >
      {type === "medic" && (
        <Ionicons
          style={{ position: "absolute", right: 8, top: 6, opacity: 0.2 }}
          name="bandage-sharp"
          size={90}
          color={UnistylesRuntime.getTheme().colors.accentMedic}
        />
      )}
      {type === "killer" && (
        <SimpleLineIcons
          style={{ position: "absolute", right: 8, top: 6, opacity: 0.2 }}
          name="target"
          size={90}
          color={UnistylesRuntime.getTheme().colors.accentKill}
        />
      )}
      {type === "destroyer" && (
        <FontAwesome6
          name="explosion"
          style={{ position: "absolute", right: 8, bottom: 24, opacity: 0.2 }}
          size={60}
          color={UnistylesRuntime.getTheme().colors.accentVehicle}
        />
      )}
      <ThemedText
        type={"log"}
        style={{
          color: colors.typeColor,
        }}
      >
        {`• ${label}`}
      </ThemedText>
      <ThemedText type={"name"} style={{ fontSize: 20 }}>
        {valuesArray.at(1)}
      </ThemedText>
      <ThemedText
        style={{
          color: colors.typeColor,
        }}
        type={"stat"}
      >
        {valuesArray.at(2)}
        <ThemedText type={"label"}>{` ${valuesArray.at(3)}`}</ThemedText>
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

    return `${allKillsArray[0]?.player_id} ${allKillsArray[0]?.revivals} kills`;
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

    return `${allMedicsArray[0]?.player_id} ${allMedicsArray[0]?.revivals} revives`;
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

    return `${allDestructorsArray[0]?.player_id} ${allDestructorsArray[0]?.vehicle_destroyeds} assets`;
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

    return `${allPlayersArray[0]?.player_id} ${allPlayersArray[0]?.rounds} rounds`;
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
            label={"Vehicle destroyer"}
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
    flex: 1,
    backgroundColor: theme.colors.surface1,
    justifyContent: "space-around",
    padding: 10,
    paddingTop: 10,
    paddingBottom: 0,
    // aspectRatio: 1.2,
    // borderRadius: 10,
    borderTopWidth: 2,
    overflow: "hidden",
    gap: 20,
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
