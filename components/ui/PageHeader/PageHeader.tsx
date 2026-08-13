import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "expo-router";
import { supabase } from "@/utils/supabase";
import { timeSince, toReadableDate } from "@/utils/functions";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";

type PageButtonProps = {
  name: string;
  currentPath: string;
};
export const PageButton = ({ name, currentPath }: PageButtonProps) => {
  const router = useRouter();
  const path = `/${name.toLowerCase()}`;
  console.log(currentPath);
  const isActive =
    currentPath === path || (currentPath === "/" && name === "ROUNDS");

  return (
    <TouchableOpacity
      // onPress={() => router.push(path)}
      style={styles.pageButton(isActive)}
    >
      <ThemedText type={"label"}>{name}</ThemedText>
    </TouchableOpacity>
  );
};

type Props = {};

const PageHeader = ({}: Props) => {
  const [syncDate, setSyncDate] = useState("");
  const currentPath = usePathname();
  // The full timestamp is the first thing to go once the header gets tight.
  const { rt } = useUnistyles();
  const showFullSyncDate = rt.breakpoint !== "xs" && rt.breakpoint !== "sm";

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("sync_time")
        .select(`created_at`)
        .order("id", {
          ascending: false,
        })
        .limit(1)
        .overrideTypes<[{ created_at: string }]>();

      if (data) {
        setSyncDate(data[0]?.created_at);
      }
    };

    fetchData();
  }, []);

  const primary = UnistylesRuntime.getTheme().colors.primary;
  const accentMedic = UnistylesRuntime.getTheme().colors.accentMedic;
  return (
    <View style={styles.container}>
      <View style={styles.brandAndNav}>
        <ThemedText type={"title"} style={{ color: primary }}>
          {"[ "}
          <ThemedText type={"title"}>{"VG.STATS"}</ThemedText>
          <ThemedText type={"title"} style={{ color: primary }}>
            {" ]"}
          </ThemedText>
        </ThemedText>
        <View style={styles.nav}>
          <PageButton name={"ROUNDS"} currentPath={currentPath} />
          <PageButton name={"PLAYERS"} currentPath={currentPath} />
          <PageButton name={"MAPS"} currentPath={currentPath} />
        </View>
      </View>
      <ThemedText style={styles.text} numberOfLines={1}>
        {showFullSyncDate ? `Last synced: ${toReadableDate(syncDate)} · ` : ""}
        <ThemedText
          style={[{ color: accentMedic }, styles.text]}
        >{`${timeSince(syncDate)}`}</ThemedText>
      </ThemedText>
    </View>
  );
};

export default PageHeader;

const styles = StyleSheet.create((theme) => ({
  brandAndNav: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.margins.xl,
    flexShrink: 1,
  },
  nav: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  pageButton: (isActive: boolean) => ({
    backgroundColor: isActive ? theme.colors.surface3 : theme.colors.surface1,
    borderColor: isActive ? theme.colors.borderStrong : theme.colors.surface1,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: theme.margins.lg,
    paddingVertical: theme.margins.sm,
  }),
  text: {
    textTransform: "uppercase",
  },
  container: {
    backgroundColor: theme.colors.surface1,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 25,
    paddingVertical: 25,
    borderBottomColor: "#1d1f22",
    borderBottomWidth: 2,
  },
}));
