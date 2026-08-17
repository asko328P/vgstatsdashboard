import { ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { PlayerStats } from "@/app/viewPlayers";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import { ThemedText } from "@/components/ui/ThemedText";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";
import ViewPlayerHeader from "@/components/ui/ViewPlayerHeader/ViewPlayerHeader";

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { rt } = useUnistyles();
  const expandAllLists =
    rt.breakpoint !== "xs" &&
    rt.breakpoint !== "sm" &&
    rt.breakpoint !== "md" &&
    rt.breakpoint !== "lg";

  const [playerData, setPlayerData] = useState<PlayerStats | null>(null);

  useEffect(() => {
    const getData = async () => {
      const { data, error } = await supabase
        .from("players")
        .select(`*`)
        .eq("id", id)
        .limit(1)
        .maybeSingle()
        .overrideTypes<PlayerStats>();

      if (error) {
        console.log("single player error", error);
      }
      if (data) {
        // @ts-ignore
        setPlayerData(data);
      }
    };

    if (id) {
      getData();
    }
  }, [id]);

  const onBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.dismissAll();
      router.replace("/viewPlayers");
    }
  };

  const titleRow = (label: string) => (
    <View style={styles.dateAndSeparator}>
      <ThemedText style={{ flexShrink: 1 }} type={"label"}>
        {label}
      </ThemedText>
      <View
        style={{
          flex: 1,
          borderTopColor: UnistylesRuntime.getTheme().colors.surface3,
          borderTopWidth: 1,
        }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ViewPlayerHeader
        headerTitle={id}
        player={playerData}
        onBackPress={onBackPress}
      />

      <ScrollView contentContainerStyle={styles.pageContent}></ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  dateAndSeparator: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.xl,
  },
  pageContent: {
    gap: theme.margins.md,
    paddingHorizontal: theme.margins.md,
    paddingBottom: theme.margins.xxl,
  },
  container: {
    flex: 1,
    gap: theme.margins.md,
  },
}));
