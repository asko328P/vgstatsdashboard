import { View } from "react-native";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native-unistyles";
import { supabase } from "@/utils/supabase";
import { ThemedText } from "@/components/ui/ThemedText";

// The rpc returns one row per hash the name has been seen under.
type AliasHash = {
  id: string;
};

type Props = {
  playerName: string;
};
const AliasChecker = ({ playerName }: Props) => {
  const [searchResults, setSearchResults] = useState<AliasHash[]>([]);
  // Separate from an empty result list, so "nothing found" only shows once the
  // query has actually come back.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .rpc("find_players_hashes", {
          search_text: playerName,
        })
        .overrideTypes<AliasHash[]>();

      if (error) {
        console.log("alias checker error", error);
      }

      setSearchResults(data ?? []);
      setIsLoading(false);
    };

    fetchData();
  }, [playerName]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type={"label"} style={styles.headerLabel}>
          {"ALIASES"}
        </ThemedText>
        <ThemedText type={"name"}>{playerName}</ThemedText>
      </View>

      <View style={styles.rows}>
        {searchResults.map((item, index) => (
          <View key={item.id} style={styles.row}>
            <ThemedText type={"micro"} style={styles.rowIndex}>
              {String(index + 1).padStart(2, "0")}
            </ThemedText>
            <ThemedText type={"cell"} style={styles.rowValue}>
              {item.id}
            </ThemedText>
          </View>
        ))}

        {!isLoading && searchResults.length === 0 && (
          <ThemedText type={"cell"} style={styles.empty}>
            {"No hashes found for this callsign"}
          </ThemedText>
        )}
      </View>
    </View>
  );
};

export default AliasChecker;

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.borderHairline,
    // Matches the gold cap the other panels wear.
    borderTopWidth: 3,
    borderTopColor: theme.colors.primary,
    borderRadius: 2,
    padding: { xs: theme.margins.lg, md: theme.margins.xl },
    gap: theme.margins.xl,
  },
  header: {
    gap: theme.margins.md,
    paddingBottom: theme.margins.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderHairline,
  },
  headerLabel: {
    color: theme.colors.primary,
  },
  rows: {
    gap: theme.margins.mdlg,
  },
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: theme.margins.lg,
  },
  // A fixed counter column keeps every hash on the same left edge; the hash
  // wraps inside what is left rather than pushing the row wider.
  rowIndex: {
    width: 24,
  },
  rowValue: {
    flexShrink: 1,
    color: theme.colors.textPrimary,
  },
  empty: {
    color: theme.colors.textMuted,
  },
}));
