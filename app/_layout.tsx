import { SplashScreen, Stack } from "expo-router";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "black" },
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="/viewDemo" options={{ headerShown: false }} />
    </Stack>
  );
}
