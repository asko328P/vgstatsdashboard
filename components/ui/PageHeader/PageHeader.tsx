import { View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { timeSince, toReadableDate } from "@/utils/functions";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";

type Props = {};

const FONT_SIZE = 26;

const PageHeader = ({}: Props) => {
  const [syncDate, setSyncDate] = useState("");

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
      <View>
        <ThemedText type={"title"} style={{ color: primary }}>
          {"[ "}
          <ThemedText type={"title"}>{"VG.STATS"}</ThemedText>
          <ThemedText type={"title"} style={{ color: primary }}>
            {" ]"}
          </ThemedText>
        </ThemedText>
      </View>
      <ThemedText style={styles.text}>
        {UnistylesRuntime.orientation === "landscape"
          ? `Last synced: ${toReadableDate(syncDate)} · `
          : ""}
        <ThemedText
          style={[{ color: accentMedic }, styles.text]}
        >{`${timeSince(syncDate)}`}</ThemedText>
      </ThemedText>
    </View>
  );
};

export default PageHeader;

const styles = StyleSheet.create((theme) => ({
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
