import { FlatList, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { Kill } from "@/components/ui/KillItem/KillItem";
import KillItem2, { killRowStyles } from "@/components/ui/KillItem2/KillItem2";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";
import { Feather } from "@expo/vector-icons";

const ListHeader = () => {
  return (
    <View style={[killRowStyles.row, styles.header]}>
      <View style={killRowStyles.playerCell}>
        <ThemedText type={"micro"}>{"Killer"}</ThemedText>
      </View>
      <View style={killRowStyles.weaponCell}>
        <ThemedText type={"micro"}>{"Weapon"}</ThemedText>
      </View>
      <View style={killRowStyles.playerCell}>
        <ThemedText type={"micro"}>{"Victim"}</ThemedText>
      </View>
      <View style={killRowStyles.timeCell}>
        <ThemedText type={"micro"}>{"Time"}</ThemedText>
      </View>
    </View>
  );
};

type Props = {
  kills: Kill[];
  onPlayerPress?: (playerId: string) => void;
  isExpanded: boolean;
  onPress?: () => void;
  onExpandPress?: () => void;
};

const TeamkillList = ({
  kills,
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
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={onExpandPress} style={styles.toggle}>
        <ThemedText type={"label"}>
          {!expandAllLists && !isExpanded && (
            <Feather
              name={"chevrons-down"}
              size={15}
              color={UnistylesRuntime.getTheme().colors.textMuted}
            />
          )}
          {"TEAMKILLS"}
        </ThemedText>
        <ThemedText type={"cell"} style={styles.count(kills.length)}>
          {kills.length}
        </ThemedText>
      </TouchableOpacity>

      {isExpanded && (
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          data={kills}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={ListHeader}
          stickyHeaderIndices={[0]}
          renderItem={({ item }) => (
            <KillItem2 kill={item} onPress={onPlayerPress} />
          )}
        />
      )}
    </View>
  );
};

export default TeamkillList;

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
  count: (count: number) => ({
    color:
      count > 30
        ? theme.colors.accentWarn
        : count > 40
          ? theme.colors.accentKill
          : theme.colors.textMuted,
  }),
  header: {
    backgroundColor: theme.colors.surface2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderHairline,
  },
}));
