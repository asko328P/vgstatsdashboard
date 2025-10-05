import { View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";

export default function Page() {
  return (
    <View style={{ flex: 1 }}>
      <ThemedText>{"Home page"}</ThemedText>
    </View>
  );
}
