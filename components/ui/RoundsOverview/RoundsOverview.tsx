import { FlatList, ScrollView, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { GameRoundPlayer } from "@/app/viewDemo";
import { GameRound } from "@/components/ui/GameRoundItem2/GameRoundItem2";
import { ThemedText } from "@/components/ui/ThemedText";
import {
  formatRoundTitle,
  toReadableDate,
  toReadableDayMonth,
} from "@/utils/functions";
import { useRouter } from "expo-router";

// Shared by the row and by the list header so the columns can never drift apart.
export const roundRowStyles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.md,
    paddingVertical: theme.margins.md,
  },
  roundCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.md,
    flex: 6,
  },
  dateCell: {
    flex: 1,
  },
  cell: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
}));

const COLUMNS = ["Kills", "Deaths", "Revives", "TKs"];

type Props = {
  gameRounds: (GameRoundPlayer & { game_rounds: GameRound })[];
};

type PlayerGameRoundProps = {
  item: GameRoundPlayer & { game_rounds: GameRound };
};

const ListHeader = () => {
  return (
    <View style={[roundRowStyles.row, styles.header]}>
      <View style={roundRowStyles.roundCell}>
        <ThemedText type={"micro"}>{"Round"}</ThemedText>
      </View>
      <View style={roundRowStyles.dateCell}>
        <ThemedText type={"micro"}>{"Date"}</ThemedText>
      </View>
      {COLUMNS.map((column) => (
        <View key={column} style={roundRowStyles.cell}>
          <ThemedText type={"micro"}>{column}</ThemedText>
        </View>
      ))}
    </View>
  );
};

const PlayerGameRound = ({ item }: PlayerGameRoundProps) => {
  const router = useRouter();
  const navigateToRound = () => {
    router.push({
      pathname: "/viewDemo",
      params: { gameRoundId: item.game_round_id },
    });
  };
  return (
    <TouchableOpacity
      onPress={navigateToRound}
      style={[roundRowStyles.row, styles.playerGameRoundHolder]}
    >
      <View style={roundRowStyles.roundCell}>
        <ThemedText
          type={"name"}
          style={{ textTransform: "uppercase" }}
          numberOfLines={1}
        >
          {formatRoundTitle(item.game_round_id)
            .split(" ")
            .slice(0, -3)
            .join(" ")}
        </ThemedText>
        <View style={styles.mapType}>
          <ThemedText type={"micro"}>
            {formatRoundTitle(item.game_round_id).split(" ").pop()}
          </ThemedText>
        </View>
      </View>
      <View style={roundRowStyles.dateCell}>
        <ThemedText type={"micro"} numberOfLines={1}>
          {toReadableDayMonth(item.game_rounds?.played_at)}
        </ThemedText>
      </View>
      <View style={roundRowStyles.cell}>
        <ThemedText>{item.kills}</ThemedText>
      </View>
      <View style={roundRowStyles.cell}>
        <ThemedText>{item.deaths}</ThemedText>
      </View>
      <View style={roundRowStyles.cell}>
        <ThemedText style={styles.revives(item.revivals)}>
          {item.revivals}
        </ThemedText>
      </View>
      <View style={roundRowStyles.cell}>
        <ThemedText style={styles.teamkills(item.teamkills)}>
          {item.teamkills}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

const RoundsOverview = ({ gameRounds }: Props) => {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.horizontalContent}
        horizontal={true}
      >
        <FlatList
          style={styles.flatlist}
          data={gameRounds}
          keyExtractor={(item) => item.game_round_id}
          ListHeaderComponent={ListHeader}
          stickyHeaderIndices={[0]}
          renderItem={({ item }) => <PlayerGameRound item={item} />}
        />
      </ScrollView>
    </View>
  );
};

export default RoundsOverview;

const styles = StyleSheet.create((theme) => ({
  scroll: {
    flex: 1,
  },
  // `flex` does nothing on a content container — `flexGrow` is what lets the
  // table fill a screen wider than its 600px floor instead of stopping there.
  horizontalContent: {
    flexGrow: 1,
  },
  flatlist: {
    flex: 1,
    minWidth: 600,
  },
  mapType: {
    textTransform: "uppercase",
    backgroundColor: theme.colors.surface3,
    padding: theme.margins.sm,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    paddingHorizontal: theme.margins.md,
  },
  playerGameRoundHolder: {
    paddingRight: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderHairline,
  },
  header: {
    backgroundColor: theme.colors.surface1,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderHairline,
  },
  // Any revive at all is worth crediting.
  revives: (value: number) => ({
    color: value > 0 ? theme.colors.accentMedic : theme.colors.textPrimary,
  }),
  // A few teamkills happen; past five it is a pattern.
  teamkills: (value: number) => ({
    color:
      value > 5
        ? theme.colors.accentKill
        : value > 3
          ? theme.colors.accentWarn
          : theme.colors.textPrimary,
  }),
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface1,
    borderWidth: 1,
    borderColor: theme.colors.borderHairline,
    borderRadius: 2,
    padding: { xs: theme.margins.lg, md: theme.margins.xl },
    paddingRight: 0,
    paddingBottom: { xs: theme.margins.sm },
    gap: theme.margins.xl,
  },
}));
