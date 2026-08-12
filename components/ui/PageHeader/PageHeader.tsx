import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

type Props = {};

const FONT_SIZE = 26;

const PageHeader = ({}: Props) => {
  const [syncDate, setSyncDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("sync_time").select(`created_at`);

      console.log("sync data", data);
    };

    fetchData();
  }, []);
  return (
    <View style={styles.container}>
      <View>
        <ThemedText style={{ fontSize: FONT_SIZE }}>
          {"["}
          <ThemedText style={{ color: "#dba900", fontSize: FONT_SIZE }}>
            {"VG.STATS"}
          </ThemedText>
          <ThemedText style={{ fontSize: FONT_SIZE }}>{"]"}</ThemedText>
        </ThemedText>
      </View>
      <ThemedText>
        {"Last synced: Aug 11, 2026, 2:41 PM · "}
        <ThemedText style={{ color: "#94e85a" }}>{"2h ago"}</ThemedText>
      </ThemedText>
    </View>
  );
};

export default PageHeader;

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 30,
    paddingVertical: 30,
    borderBottomColor: "#1d1f22",
    borderBottomWidth: 2,
  },
});
