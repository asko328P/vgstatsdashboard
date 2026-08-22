// Must be the first import: StyleSheet.configure has to run before any
// StyleSheet.create in the component tree below (incl. static web rendering,
// which enters through this file rather than index.ts).
import "@/unistyles/unistyles";

import {
  ChakraPetch_400Regular,
  ChakraPetch_500Medium,
  ChakraPetch_600SemiBold,
  ChakraPetch_700Bold,
  useFonts,
} from "@expo-google-fonts/chakra-petch";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import "react-native-reanimated";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import WipRibbon from "@/components/ui/WipRibbon/WipRibbon";

SplashScreen.preventAutoHideAsync();

// Stats only move when the sync job runs, so a few minutes of staleness costs
// nothing and switching back to a screen is instant.
// Created outside the component so it survives re-renders.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ChakraPetch_400Regular,
    ChakraPetch_500Medium,
    ChakraPetch_600SemiBold,
    ChakraPetch_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.root}>
        <Stack
          screenOptions={{
            contentStyle: {
              backgroundColor: UnistylesRuntime.getTheme().colors.surfaceBase,
            },
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="/viewDemo" options={{ headerShown: false }} />
        </Stack>
        <WipRibbon />
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create(() => ({
  root: {
    flex: 1,
  },
}));
