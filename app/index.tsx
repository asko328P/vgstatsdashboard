import { ScrollView } from "react-native";
import AllGameRounds from "@/components/PageParts/AllGameRounds/AllGameRounds";
import TopPlayers from "@/components/PageParts/TopPlayers/TopPlayers";

export default function Page() {
  return (
    <ScrollView
      style={{ flex: 1, padding: 20 }}
      contentContainerStyle={{ gap: 20 }}
    >
      <TopPlayers />
      <AllGameRounds />
    </ScrollView>
  );
}
