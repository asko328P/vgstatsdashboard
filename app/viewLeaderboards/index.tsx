import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native-unistyles";
import LeaderboardsHeader from "@/components/ui/LeaderboardsHeader/LeaderboardsHeader";

const POSSIBLE_RANGES = ["1D", "3D", "7D"];

export default function Page() {
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState("7D");

  return (
    <View style={styles.container}>
      <LeaderboardsHeader
        headerTitle={"Leaderboards"}
        possibleRanges={POSSIBLE_RANGES}
        selectedRange={selectedRange}
        onRangePress={setSelectedRange}
        onBackPress={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    gap: theme.margins.md,
  },
}));
