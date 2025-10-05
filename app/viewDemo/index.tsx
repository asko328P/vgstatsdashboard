import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

export default function Page() {
  const { gameRoundId } = useLocalSearchParams<{ gameRoundId: string }>();

  const [data, setData] = useState();

  useEffect(() => {
    const getData = async () => {};
    getData();
  }, []);
  return <View style={styles.container}></View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
