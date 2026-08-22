import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { FontAwesome6, Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { ThemedText } from "@/components/ui/ThemedText";
import { useSelectedPlayerStore } from "@/zustand/SelectedPlayerStore";

type Props = {
  label: string;
  // " <player_id> <amount> <unit>" — the player id carries a leading space, so
  // the parts land on indices 1..3.
  value: any;
  type?: "medic" | "killer" | "destroyer" | "player";
  statsArray?: { name: string; value: string | number }[];
  isFetching?: boolean;
};

type RowItemProps = {
  index: number;
  name: string;
  value: string | number;
};

// The runners up under the highlighted player: rank, name, value. The name is
// the player id, so the row doubles as a link to that player's page.
const RowItem = ({ index, name, value }: RowItemProps) => {
  const router = useRouter();
  const setSelectedPlayer = useSelectedPlayerStore(
    (state) => state.setSelectedPlayer,
  );

  const pressPlayerHandler = () => {
    setSelectedPlayer(name);
    router.push(`/viewPlayers/${name}`);
  };

  return (
    <TouchableOpacity onPress={pressPlayerHandler} style={styles.row}>
      <View style={styles.indexCell}>
        <ThemedText type={"cell"} style={styles.index}>
          {index}
        </ThemedText>
      </View>
      <ThemedText type={"name"} numberOfLines={1} style={styles.rowName}>
        {name}
      </ThemedText>
      <ThemedText type={"cell"} style={styles.rowValue}>
        {value}
      </ThemedText>
    </TouchableOpacity>
  );
};

const LeaderBoardStatHolder = ({
  label,
  value,
  type = "medic",
  statsArray = [],
  isFetching,
}: Props) => {
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
      <View style={styles.topPart}>
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
            style={{ position: "absolute", right: 8, top: 20, opacity: 0.2 }}
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

      {isFetching && (
        <ActivityIndicator
          style={styles.loadingIndicator}
          color={colors.typeColor}
        />
      )}

      {statsArray?.length !== 0 && (
        <View style={styles.rowsHolder}>
          {statsArray.map((item, index) => (
            <RowItem
              key={item.name}
              // The card's headline player is #1, so the list picks up at #2.
              index={index + 2}
              name={item.name}
              value={item.value}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default LeaderBoardStatHolder;

const styles = StyleSheet.create((theme) => ({
  loadingIndicator: {
    position: "absolute",
    top: theme.margins.md,
    right: theme.margins.md,
  },
  topPart: {
    padding: 10,
    paddingTop: 10,
    paddingBottom: 0,
    gap: theme.margins.md,
  },
  rowsHolder: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderHairline,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.md,
    paddingHorizontal: theme.margins.md,
    paddingVertical: theme.margins.mdlg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderHairline,
  },
  // Fixed width so the names line up no matter how wide the rank gets.
  indexCell: {
    width: 20,
  },
  index: {
    color: theme.colors.textMuted,
  },
  rowName: {
    flex: 1,
    flexShrink: 1,
  },
  rowValue: {
    color: theme.colors.textPrimary,
  },
  dateAndSeparator: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.xl,
  },
  dataHolderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  dataHolder: {
    maxWidth: 600,
    // Grow to share the row, but never below minWidth — that's what forces a wrap.
    flexGrow: 1,
    flexBasis: 220,
    minWidth: 220,
    backgroundColor: theme.colors.surface1,
    justifyContent: "space-around",
    // padding: 10,
    // paddingTop: 10,
    // paddingBottom: 0,
    // aspectRatio: 1.2,
    // borderRadius: 10,
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
    borderTopWidth: 2,
    overflow: "hidden",
    // gap: 20,
  },
}));
