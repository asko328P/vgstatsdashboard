import { FlatList, ScrollView, TouchableOpacity, View } from "react-native";
import { useState } from "react";
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

const COLUMNS = ["Score", "Score TW", "Kills", "Deaths", "TKs"];

const ListHeader = () => {
  return (
    <View style={[rowStyles.row, styles.header]}>
      <View style={rowStyles.nameCell}>
        <ThemedText type={"micro"}>{"Name"}</ThemedText>
      </View>
      {COLUMNS.map((column) => (
        <View key={column} style={rowStyles.cell}>
          <ThemedText type={"micro"}>{column}</ThemedText>
        </View>
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
            data={players}
            keyExtractor={(item) => String(item.id)}
            ListHeaderComponent={ListHeader}
            stickyHeaderIndices={[0]}
            renderItem={({ item }) => (
              <GameRoundPlayerItem2 item={item} onPress={onPlayerPress} />
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
