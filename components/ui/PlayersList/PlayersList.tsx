import { FlatList, ScrollView, TouchableOpacity, View } from "react-native";
import { useMemo, useState } from "react";
import { GameRoundPlayer } from "@/app/viewDemo";
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
};

const PlayersList = ({
  players,
  onPlayerPress,
  isExpanded,
  onExpandPress,
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

  return (
    <Animated.View entering={FadeIn.duration(400)} style={{ flex: 1 }}>
      <TouchableOpacity onPress={onExpandPress} style={styles.toggle}>
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
        <ThemedText type={"cell"} style={styles.count}>
          {players.length}
        </ThemedText>
      </TouchableOpacity>

      {isExpanded && (
        <ScrollView horizontal={true} contentContainerStyle={{ flex: 1 }}>
          <FlatList
            initialNumToRender={30}
            showsVerticalScrollIndicator={false}
            style={{ minWidth: 400 }}
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
              />
            )}
          />
        </ScrollView>
      )}
    </Animated.View>
  );
};

export default PlayersList;

const styles = StyleSheet.create((theme) => ({
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
