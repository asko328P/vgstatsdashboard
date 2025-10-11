import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AllGameRounds from "@/components/PageParts/AllGameRounds/AllGameRounds";

export default function Page() {
  return (
    <ScrollView style={{ flex: 1 }}>
      <AllGameRounds />
    </ScrollView>
  );
}
