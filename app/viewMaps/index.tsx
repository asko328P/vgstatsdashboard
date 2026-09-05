import { View } from "react-native";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native-unistyles";
import ViewMapHeader from "@/components/ui/ViewMapHeader/ViewMapHeader";
import { useSelectedMapStore } from "@/zustand/SelectedMapStore";

export default function Page() {
  const router = useRouter();

  const selectedMap = useSelectedMapStore((state) => state.selectedMap);

  const onBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.dismissAll();
      router.replace("/");
    }
  };

  return (
    <View style={styles.container}>
      <ViewMapHeader
        headerTitle={selectedMap ?? "Maps"}
        onBackPress={onBackPress}
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
