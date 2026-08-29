import { Pressable, View } from "react-native";
import { useMemo, useState } from "react";
import { ThemedText } from "@/components/ui/ThemedText";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { Feather } from "@expo/vector-icons";
import {
  SelectedPlayerState,
  useSelectedPlayerStore,
} from "@/zustand/SelectedPlayerStore";
import { formatClockDuration, formatSquadName } from "@/utils/functions";

export type SquadPlayer = {
  id: string;
  numberOfTicksAsSquadLead: number;
  numberOfTicksAsNonSquadLead: number;
};

type Props = {
  squadName: string;
  players: SquadPlayer[];
  onPlayerPress?: (playerId: string) => void;
};

const SquadItem = ({ squadName, players, onPlayerPress }: Props) => {
  const setSelectedPlayer = useSelectedPlayerStore(
    (state) => state.setSelectedPlayer,
  );
  const selectedPlayer = useSelectedPlayerStore(
    (state: SelectedPlayerState) => state.selectedPlayer,
  );

  // Whoever held the radio longest is the squad lead. Nobody leads a squad
  // where no one ever picked it up.
  const squadLeadId = useMemo(() => {
    const lead = players.reduce<SquadPlayer | undefined>((acc, player) => {
      return !acc ||
        player.numberOfTicksAsSquadLead > acc.numberOfTicksAsSquadLead
        ? player
        : acc;
    }, undefined);

    return lead && lead.numberOfTicksAsSquadLead > 0 ? lead.id : "";
  }, [players]);

  // Hover only ever fires on web; on touch the tooltip simply never shows.
  const [hoveredPlayerId, setHoveredPlayerId] = useState("");

  const pressPlayerHandler = (playerId: string) => {
    setSelectedPlayer(playerId);
    onPlayerPress?.(playerId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type={"label"}>{formatSquadName(squadName)}</ThemedText>
        <ThemedText type={"micro"} style={styles.count}>
          {players.length}
        </ThemedText>
      </View>

      <View style={styles.players}>
        {players.map((player) => {
          const isSelected = selectedPlayer === player.id;
          const isSquadLead = squadLeadId === player.id;

          const timeInSquad =
            player.numberOfTicksAsSquadLead +
            player.numberOfTicksAsNonSquadLead;

          return (
            <Pressable
              key={player.id}
              onPress={() => {
                pressPlayerHandler(player.id);
              }}
              onHoverIn={() => {
                setHoveredPlayerId(player.id);
              }}
              onHoverOut={() => {
                setHoveredPlayerId("");
              }}
              style={styles.player(isSelected)}
            >
              {hoveredPlayerId === player.id && (
                <View pointerEvents={"none"} style={styles.tooltip}>
                  <ThemedText type={"micro"} style={styles.tooltipText}>
                    {formatClockDuration(timeInSquad)}
                  </ThemedText>
                </View>
              )}
              {isSquadLead && (
                <Feather
                  name={"chevrons-up"}
                  size={14}
                  color={UnistylesRuntime.getTheme().colors.accentSquadLead}
                />
              )}
              <ThemedText
                type={"name"}
                numberOfLines={1}
                style={styles.playerName(isSelected, isSquadLead)}
              >
                {player.id.trim()}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default SquadItem;

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderHairline,
    paddingHorizontal: theme.margins.md,
    paddingVertical: theme.margins.md,
    gap: theme.margins.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.margins.md,
  },
  count: {
    color: theme.colors.textMuted,
  },
  players: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.margins.sm,
  },
  player: (isSelected: boolean) => ({
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.sm,
    minWidth: 120,
    paddingHorizontal: theme.margins.md,
    paddingVertical: theme.margins.sm,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: isSelected
      ? theme.colors.accentSelect
      : theme.colors.borderHairline,
    backgroundColor: isSelected
      ? theme.colors.selectBackground
      : theme.colors.surface2,
  }),
  // Sits above the pill it belongs to, out of the row's flow.
  tooltip: {
    position: "absolute",
    bottom: "100%",
    left: 0,
    marginBottom: 4,
    zIndex: 10,
    paddingHorizontal: theme.margins.sm,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface3,
  },
  tooltipText: {
    color: theme.colors.textPrimary,
  },
  playerName: (isSelected: boolean, isSquadLead: boolean) => ({
    color: isSelected
      ? theme.colors.accentSelect
      : isSquadLead
        ? theme.colors.accentSquadLead
        : theme.colors.textPrimary,
  }),
}));
