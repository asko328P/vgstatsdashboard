import { ScrollView } from "react-native";
import AllGameRounds from "@/components/PageParts/AllGameRounds/AllGameRounds";
import TopPlayers from "@/components/PageParts/TopPlayers/TopPlayers";
import PageHeader from "@/components/ui/PageHeader/PageHeader";

export default function Page() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 20 }}>
      <PageHeader />
      <TopPlayers />
      <AllGameRounds />
    </ScrollView>
  );
}
