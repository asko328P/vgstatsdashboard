import { ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ReactNode, useEffect, useState } from "react";
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
import PlayerOverview from "@/components/ui/PlayerOverview/PlayerOverview";

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

  // `flex` is what splits a desktop row into thirds; on phones the cells stack
  // and size to their content instead.
  type SectionProps = {
    label: string;
    flex?: number;
    children?: ReactNode;
  };
  const Section = ({ label, flex, children }: SectionProps) => (
    <View key={label} style={styles.cell(flex)}>
      {titleRow(label)}
      {children}
    </View>
  );

  // Phones: one column, all four sections stacked.
  if (!expandAllLists) {
    return (
      <View style={styles.container}>
        <ViewPlayerHeader
          headerTitle={id}
          player={playerData}
          onBackPress={onBackPress}
        />

        <ScrollView contentContainerStyle={styles.pageContent}>
          <Section label={"Overview"}>
            <PlayerOverview
              callsign={playerData?.id ?? id}
              createdAt={playerData?.created_at}
              lastSeenAt={playerData?.last_seen}
              favWeapon={"COMING SOON"}
            />
          </Section>
          <Section label={"Combat"}></Section>
          <Section label={"Activity"}></Section>
          <Section label={"Rounds"}></Section>
        </ScrollView>
      </View>
    );
  }

  // Wide: two rows of two, the left cell taking a third and the right two thirds.
  return (
    <View style={styles.container}>
      <ViewPlayerHeader
        headerTitle={id}
        player={playerData}
        onBackPress={onBackPress}
      />

      <ScrollView contentContainerStyle={styles.pageContent}>
        <View style={styles.row}>
          <Section label={"Overview"} flex={1}>
            <PlayerOverview
              callsign={playerData?.id ?? id}
              createdAt={playerData?.created_at}
              lastSeenAt={playerData?.last_seen}
              favWeapon={"(COMING SOON)"}
              favClass={"(COMING SOON)"}
            />
          </Section>
          <Section label={"Combat"} flex={2}></Section>
        </View>
        <View style={styles.row}>
          <Section label={"Activity"} flex={1}></Section>
          <Section label={"Rounds"} flex={2}></Section>
        </View>
      </ScrollView>
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
  row: {
    flexDirection: "row",
    gap: theme.margins.lg,
  },
  cell: (flex?: number) => ({
    flex,
    gap: theme.margins.md,
  }),
  panel: {
    flex: 1,
    minHeight: 200,
    backgroundColor: theme.colors.surface1,
    borderWidth: 1,
    borderColor: theme.colors.borderHairline,
    borderRadius: 10,
  },
  container: {
    flex: 1,
    gap: theme.margins.md,
  },
}));
