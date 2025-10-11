import { SplashScreen, Stack } from "expo-router";
import "react-native-reanimated";
import { useFonts } from "expo-font";
import { useEffect } from "react";

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
