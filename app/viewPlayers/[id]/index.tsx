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
import { GameRoundPlayer } from "@/app/viewDemo";
import { GameRound } from "@/components/ui/GameRoundItem2/GameRoundItem2";
import KDOverview from "@/components/ui/KDOverview/KDOverview";
import StatCard from "@/components/ui/StatCard/StatCard";
import RevivesOverView from "@/components/ui/RevivesOverView/RevivesOverView";
import RoundsOverview from "@/components/ui/RoundsOverview/RoundsOverview";

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const accentMedic = UnistylesRuntime.getTheme().colors.accentMedic;
  const accentWarn = UnistylesRuntime.getTheme().colors.accentWarn;
  const accentKill = UnistylesRuntime.getTheme().colors.accentKill;

  const { rt } = useUnistyles();
  const expandAllLists =
    rt.breakpoint !== "xs" &&
    rt.breakpoint !== "sm" &&
    rt.breakpoint !== "md" &&
    rt.breakpoint !== "lg";

  const [playerData, setPlayerData] = useState<PlayerStats | null>(null);

  const [roundsData, setRoundsData] = useState<
    (GameRoundPlayer & { game_rounds: GameRound })[] | null
  >(null);

  useEffect(() => {
    const getData = async () => {
      const { data: player, error } = await supabase
        .from("players")
        .select(`*`)
        .eq("id", id)
        .limit(1)
        .maybeSingle()
        .overrideTypes<PlayerStats>();

      if (error) {
        console.log("single player error", error);
      }
      if (player) {
        // @ts-ignore
        setPlayerData(player);

        const { data: rounds } = await supabase
          .from("game_round_player")
          .select("*, game_rounds(*)")
          .eq("player_id", id)
          .order("played_at", {
            referencedTable: "game_rounds",
            ascending: true,
          })
          .limit(10);

        // @ts-ignore
        setRoundsData(rounds);
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

  // The cards carry their own width floor, so the row only has to allow wrapping.
  const stats = playerData && (
    <View style={styles.statsRow}>
      <StatCard
        title={"lifetime k/d"}
        value={(playerData.kills / playerData.deaths).toFixed(2)}
      />
      <StatCard title={"Rounds played"} value={playerData.rounds} />
      <StatCard
        title={"Revives"}
        value={playerData.revivals}
        color={accentMedic}
      />
      <StatCard
        title={"Teamkills"}
        value={playerData.teamkills}
        color={accentWarn}
      />
      <StatCard title={"Kills"} value={playerData.kills} color={accentKill} />
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
          <Section label={"Combat"}>
            {stats}
            {roundsData && <KDOverview gameRounds={roundsData} />}
          </Section>
          <Section label={"Medic Activity"}>
            {roundsData && <RevivesOverView gameRounds={roundsData} />}
          </Section>
          <Section label={"Rounds"}>
            {roundsData && <RoundsOverview gameRounds={roundsData} />}
          </Section>
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

      <View style={styles.wideContent}>
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
          <Section label={"Combat"} flex={2}>
            {stats}
            {roundsData && <KDOverview gameRounds={roundsData} />}
          </Section>
        </View>
        <View style={[styles.row, styles.growRow]}>
          <Section label={"Medic Activity"} flex={1}>
            {roundsData && <RevivesOverView gameRounds={roundsData} />}
          </Section>
          <Section label={"Rounds"} flex={2}>
            {roundsData && <RoundsOverview gameRounds={roundsData} />}
          </Section>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  dateAndSeparator: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.xl,
  },
  // Phones only — this is a ScrollView content container, so it must stay
  // content-sized or the page would never scroll.
  pageContent: {
    gap: theme.margins.md,
    paddingHorizontal: theme.margins.md,
    paddingBottom: theme.margins.xxl,
  },
  // Wide only: capped by the window, which is what gives the rounds table
  // something to overflow and therefore something to scroll.
  wideContent: {
    flex: 1,
    minHeight: 0,
    gap: theme.margins.md,
    paddingHorizontal: theme.margins.md,
    paddingBottom: theme.margins.md,
  },
  row: {
    flexWrap: "wrap",
    flexDirection: "row",
    gap: theme.margins.lg,
  },
  // The bottom row takes whatever the top row leaves. `nowrap` is required, not
  // cosmetic: a wrapping container sizes its line to the content and its cells
  // never stretch to the bounded height, so the table would overflow the window.
  growRow: {
    flex: 1,
    minHeight: 0,
    flexWrap: "nowrap",
    alignItems: "stretch",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.margins.md,
  },

  cell: (flex?: number) => ({
    flex,
    minHeight: 0,
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
