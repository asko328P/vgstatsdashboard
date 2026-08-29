import { FlatList, ScrollView, TouchableOpacity, View } from "react-native";
import { useMemo, useState } from "react";
import { GameRoundPlayer } from "@/utils/queries";
import { ThemedText } from "@/components/ui/ThemedText";
import GameRoundPlayerItem2, {
  rowStyles,
} from "@/components/ui/GameRoundPlayerItem2/GameRoundPlayerItem2";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import { AllSquadsObject } from "@/components/ui/GameRoundItem2/GameRoundItem2";
import SquadItem, { SquadPlayer } from "@/components/ui/SquadItem/SquadItem";

const COLUMNS = ["Score", "Score TW", "Kills", "Deaths", "TKs"] as const;

// Alphabetical, except clan members — whose names start with "=" — who are
// grouped at the top and alphabetised among themselves.
const compareNames = (a: string, b: string) => {
  const aIsClan = a.startsWith("=");
  const bIsClan = b.startsWith("=");

  if (aIsClan !== bIsClan) {
    return aIsClan ? -1 : 1;
  }
  return a.localeCompare(b, undefined);
};

type ListHeaderProps = {
  sortBy: (typeof COLUMNS)[number] | "Name";
  onLabelPress: (label: (typeof COLUMNS)[number] | "Name") => void;
};
const ListHeader = ({ sortBy, onLabelPress }: ListHeaderProps) => {
  const selectedColor = UnistylesRuntime.getTheme().colors.textPrimary;
  const unSelectedColor = UnistylesRuntime.getTheme().colors.textSecondary;
  return (
    <View style={[rowStyles.row, styles.header]}>
      <TouchableOpacity
        onPress={() => {
          onLabelPress("Name");
        }}
        style={[rowStyles.nameCell(sortBy === "Name")]}
      >
        <ThemedText
          style={{ color: sortBy === "Name" ? selectedColor : unSelectedColor }}
          type={"micro"}
        >
          {"Name"}
        </ThemedText>
      </TouchableOpacity>
      {COLUMNS.map((column) => (
        <TouchableOpacity
          onPress={() => {
            onLabelPress(column);
          }}
          key={column}
          style={rowStyles.cell(sortBy === column)}
        >
          <ThemedText
            style={{
              color: sortBy === column ? selectedColor : unSelectedColor,
            }}
            type={"micro"}
          >
            {column}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

type Props = {
  players: GameRoundPlayer[];
  onPlayerPress?: (playerId: string) => void;
  isExpanded: boolean;
  onPress?: () => void;
  onExpandPress?: () => void;
  // Round duration in seconds — decides who counted as a squad leader.
  roundLength: number;
  allSquadsObject?: AllSquadsObject;
};

const PlayersList = ({
  players,
  onPlayerPress,
  isExpanded,
  onExpandPress,
  roundLength,
  allSquadsObject,
}: Props) => {
  const { rt } = useUnistyles();
  const expandAllLists =
    rt.breakpoint !== "xs" &&
    rt.breakpoint !== "sm" &&
    rt.breakpoint !== "md" &&
    rt.breakpoint !== "lg";

  const [sortBy, setSortBy] = useState<(typeof COLUMNS)[number] | "Name">(
    "Name",
  );

  const [whichList, setWhichList] = useState<"players" | "squads">("players");

  const labelPressHandler = (label: (typeof COLUMNS)[number] | "Name") => {
    console.log(label);
    setSortBy(label);
  };

  const sortedPlayers = useMemo(() => {
    const copy = [...players];
    switch (sortBy) {
      case "Name":
        return copy.sort((a, b) =>
          compareNames(String(a.player_id), String(b.player_id)),
        );
      case "Score":
        return copy.sort((a, b) => b.score - a.score);
      case "Score TW":
        return copy.sort((a, b) => b.scoreTW - a.scoreTW);
      case "Kills":
        return copy.sort((a, b) => b.kills - a.kills);
      case "Deaths":
        return copy.sort((a, b) => b.deaths - a.deaths);
      case "TKs":
        return copy.sort((a, b) => b.teamkills - a.teamkills);
      default:
        return copy;
    }
  }, [players, sortBy]);

  // The squads object nests team -> squad -> player, flattened here into one
  // row per squad. Teams without squads come through as {} and drop out.
  const squads = useMemo(() => {
    if (!allSquadsObject) {
      return [];
    }
    return Object.entries(allSquadsObject).flatMap(([teamId, teamSquads]) =>
      Object.entries(teamSquads ?? {})
        .map(([squadName, squad]) => ({
          key: `${teamId}-${squadName}`,
          squadName,
          players: Object.entries(squad ?? {})
            .map<SquadPlayer>(([playerId, ticks]) => ({
              id: playerId,
              numberOfTicksAsSquadLead: ticks.numberOfTicksAsSquadLead,
              numberOfTicksAsNonSquadLead: ticks.numberOfTicksAsNonSquadLead,
            }))
            // Squad lead first, then alphabetical like the players list.
            .sort(
              (a, b) =>
                b.numberOfTicksAsSquadLead - a.numberOfTicksAsSquadLead ||
                compareNames(a.id, b.id),
            )
            //filter if player didn't spend more than 2 minute in the squad
            .filter(
              (item) =>
                item.numberOfTicksAsNonSquadLead +
                  item.numberOfTicksAsSquadLead >
                60 * 2,
            ),
        }))
        .filter((item) => item.players.length > 0),
    );
  }, [allSquadsObject]);

  // Squad members are sorted lead first, so the top of each squad is its lead —
  // as long as anyone in it actually held the role. Names are trimmed because
  // the squads object keeps the leading space some player names carry.
  const squadLeadIds = useMemo(() => {
    const ids = new Set<string>();
    squads.forEach((squad) => {
      const lead = squad.players[0];
      if (lead && lead.numberOfTicksAsSquadLead > roundLength / 4) {
        ids.add(lead.id.trim());
      }
    });
    return ids;
  }, [squads]);

  return (
    <Animated.View entering={FadeIn.duration(400)} style={{ flex: 1 }}>
      <TouchableOpacity onPress={onExpandPress} style={styles.toggle}>
        <View style={styles.playersAndSquadsHolder}>
          <TouchableOpacity
            hitSlop={7}
            onPress={() => {
              setWhichList("players");
            }}
            style={[whichList !== "players" && { opacity: 0.3 }]}
          >
            <ThemedText type={"label"}>
              {!expandAllLists && !isExpanded && (
                <Feather
                  name={"chevrons-down"}
                  size={15}
                  color={UnistylesRuntime.getTheme().colors.textMuted}
                />
              )}
              {"PLAYERS"}
            </ThemedText>
          </TouchableOpacity>
          {allSquadsObject && (
            <TouchableOpacity
              hitSlop={7}
              onPress={() => {
                setWhichList("squads");
              }}
              style={[whichList !== "squads" && { opacity: 0.3 }]}
            >
              <ThemedText type={"label"}>{"SQUADS"}</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <ThemedText type={"cell"} style={styles.count}>
          {whichList === "players" ? players.length : squads.length}
        </ThemedText>
      </TouchableOpacity>

      {isExpanded && (
        <ScrollView horizontal={true} contentContainerStyle={{ flex: 1 }}>
          {whichList === "players" && (
            <FlatList
              initialNumToRender={30}
              showsVerticalScrollIndicator={false}
              style={{ minWidth: 420 }}
              contentContainerStyle={{ paddingBottom: 20 }}
              data={sortedPlayers}
              extraData={sortBy}
              keyExtractor={(item) => String(item.id)}
              ListHeaderComponent={
                <ListHeader sortBy={sortBy} onLabelPress={labelPressHandler} />
              }
              stickyHeaderIndices={[0]}
              renderItem={({ item }) => (
                <GameRoundPlayerItem2
                  key={item.player_id}
                  item={item}
                  onPress={onPlayerPress}
                  roundLength={roundLength}
                  isSquadLead={
                    allSquadsObject
                      ? squadLeadIds.has(item.player_id.trim())
                      : undefined
                  }
                />
              )}
            />
          )}
          {whichList === "squads" && (
            <FlatList
              initialNumToRender={10}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              data={squads}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <SquadItem
                  squadName={item.squadName}
                  players={item.players}
                  onPlayerPress={onPlayerPress}
                />
              )}
            />
          )}
        </ScrollView>
      )}
    </Animated.View>
  );
};

export default PlayersList;

const styles = StyleSheet.create((theme) => ({
  playersAndSquadsHolder: {
    flexDirection: "row",
    gap: theme.margins.md,
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.margins.md,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.borderHairline,
    borderRadius: 2,
    paddingHorizontal: theme.margins.lg,
    paddingVertical: theme.margins.md,
  },
  count: {
    color: theme.colors.textMuted,
  },
  header: {
    backgroundColor: theme.colors.surface2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderHairline,
  },
}));
