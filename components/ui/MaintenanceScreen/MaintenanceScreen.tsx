import { useEffect, useState } from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { MAINTENANCE_LINES, MAINTENANCE_MESSAGE } from "@/utils/maintenance";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";

// Widest label plus a couple of dots, so every status line breaks at the same
// column no matter how long its label is.
const DOT_COLUMN = 22;

const withDots = (label: string) =>
  `${label} ${".".repeat(Math.max(3, DOT_COLUMN - label.length))} `;

// Full screen takeover rendered instead of the router stack while
// `MAINTENANCE_MODE` is on. Deliberately self contained: no Supabase, no
// navigation, no stores — it has to render even when the data layer is the
// thing that is down.
const MaintenanceScreen = () => {
  const [cursorOn, setCursorOn] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setCursorOn((on) => !on), 600);
    return () => clearInterval(id);
  }, []);

  const primary = UnistylesRuntime.getTheme().colors.primary;
  const accentWarn = UnistylesRuntime.getTheme().colors.accentWarn;

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <ThemedText type={"title"} style={{ color: primary }}>
          {"[ "}
          <ThemedText type={"title"}>{"VG.STATS"}</ThemedText>
          <ThemedText type={"title"} style={{ color: primary }}>
            {" ]"}
          </ThemedText>
        </ThemedText>

        <View style={styles.badge}>
          <View style={[styles.dot, { backgroundColor: accentWarn }]} />
          <ThemedText type={"label"} style={{ color: accentWarn }}>
            {"MAINTENANCE"}
          </ThemedText>
        </View>

        <ThemedText type={"log"} style={styles.message}>
          {MAINTENANCE_MESSAGE}
        </ThemedText>
      </View>
    </View>
  );
};

export default MaintenanceScreen;

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceBase,
    padding: theme.margins.xl,
  },
  // Hugs the console block on phones and stops growing on desktop, where a
  // full width card would strand the text in the middle of the screen.
  card: {
    width: "100%",
    maxWidth: 560,
    alignItems: "center",
    gap: theme.margins.lg,
    backgroundColor: theme.colors.surface1,
    borderColor: theme.colors.borderHairline,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: { xs: theme.margins.xl, md: theme.margins.xxl },
    paddingVertical: { xs: theme.margins.xxl, md: theme.margins.xxl },
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.md,
    backgroundColor: theme.colors.surface3,
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: theme.margins.mdlg,
    paddingVertical: theme.margins.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  headingText: {
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    maxWidth: 420,
  },
  console: {
    width: "100%",
    gap: theme.margins.sm,
    backgroundColor: theme.colors.surface2,
    borderColor: theme.colors.borderHairline,
    borderWidth: 1,
    borderRadius: 6,
    padding: theme.margins.lg,
  },
  line: {
    color: theme.colors.textMuted,
  },
}));
