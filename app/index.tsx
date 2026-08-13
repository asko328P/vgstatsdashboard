import { View, ScrollView } from "react-native";
import AllGameRounds from "@/components/PageParts/AllGameRounds/AllGameRounds";
import TopPlayers from "@/components/PageParts/TopPlayers/TopPlayers";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";

export default function Page() {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        gap: 20,
        flex: 1,
      }}
    >
      <PageHeader />
      <View
        style={{
          flex: 1,
          paddingHorizontal:
            UnistylesRuntime.orientation === "landscape"
              ? UnistylesRuntime.getTheme().margins.xl
              : UnistylesRuntime.getTheme().margins.sm,
        }}
      >
        <TopPlayers />
        <AllGameRounds />
      </View>
    </ScrollView>
  );
}
