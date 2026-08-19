import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { supabase } from "@/utils/supabase";
import { ThemedText } from "@/components/ui/ThemedText";
import { useAuthStore } from "@/zustand/AuthStore";

// The table is only readable by an authenticated user, so the component never
// even queries while logged out.
// How many lines the list starts with and grows by, and where it stops.
const LOGS_PAGE_SIZE = 20;
const MAX_LOGS = 100;

export type ServerLog = {
  raw_command: string;
};

type Props = {
  searchValue: string;
};

const ServerLogItem = ({ log }: { log: ServerLog }) => {
  return (
    <View style={styles.row}>
      <ThemedText type={"log"} numberOfLines={2}>
        {log.raw_command}
      </ThemedText>
    </View>
  );
};

const ShowMore = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.showMore}>
      <ThemedText type={"label"}>{"SHOW MORE"}</ThemedText>
    </TouchableOpacity>
  );
};

const ServerLogsOverview = ({ searchValue }: Props) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const [logs, setLogs] = useState<ServerLog[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [numberOfItems, setNumberOfItems] = useState(LOGS_PAGE_SIZE);

  // A new search starts over at the first page rather than keeping the depth
  // the previous term was expanded to.
  useEffect(() => {
    setNumberOfItems(LOGS_PAGE_SIZE);
  }, [searchValue]);

  useEffect(() => {
    if (!isLoggedIn || !searchValue) {
      setLogs(null);
      return;
    }

    // A late response from a previous search value must not overwrite the
    // result of the one the user is actually looking at.
    let isCurrent = true;

    const getLogs = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("server_logs")
        .select("raw_command")
        .ilike("raw_command", `%${searchValue}%`)
        .limit(numberOfItems)
        .overrideTypes<ServerLog[]>();

      if (!isCurrent) {
        return;
      }
      if (error) {
        console.log("server logs error", error);
      }
      setLogs(data ?? []);
      setIsLoading(false);
    };

    getLogs();

    return () => {
      isCurrent = false;
    };
  }, [isLoggedIn, searchValue, numberOfItems]);

  const onShowMorePress = () => {
    setNumberOfItems((current) => Math.min(current + LOGS_PAGE_SIZE, MAX_LOGS));
  };

  // Hidden at the cap, and also once a fetch comes back short — that means
  // there are no more matching lines and pressing again would change nothing.
  const canShowMore =
    numberOfItems < MAX_LOGS && (logs?.length ?? 0) >= numberOfItems;

  if (!isLoggedIn) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type={"label"}>{"SERVER LOGS"}</ThemedText>
        <ThemedText type={"label"} style={styles.count}>
          {isLoading ? "…" : `${logs?.length ?? 0}`}
        </ThemedText>
      </View>
      {isLoading && !logs ? (
        <ActivityIndicator color={accentMedic} />
      ) : (
        <FlatList
          style={styles.flatlist}
          data={logs ?? []}
          keyExtractor={(item, index) => `${index}-${item.raw_command}`}
          renderItem={({ item }) => <ServerLogItem log={item} />}
          ListFooterComponent={
            canShowMore ? <ShowMore onPress={onShowMorePress} /> : null
          }
          ListEmptyComponent={
            <ThemedText type={"micro"}>{"No matching log lines"}</ThemedText>
          }
        />
      )}
    </View>
  );
};

export default ServerLogsOverview;

const accentMedic = UnistylesRuntime.getTheme().colors.accentMedic;

const styles = StyleSheet.create((theme) => ({
  flatlist: {
    flex: 1,
  },
  showMore: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 4,
    marginTop: theme.margins.md,
    paddingVertical: theme.margins.md,
  },
  row: {
    paddingVertical: theme.margins.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderHairline,
  },
  count: {
    color: theme.colors.textMuted,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface1,
    borderWidth: 1,
    borderColor: theme.colors.borderHairline,
    borderRadius: 2,
    padding: { xs: theme.margins.lg, md: theme.margins.xl },
    paddingBottom: { xs: theme.margins.sm },
    gap: theme.margins.xl,
  },
}));
