import { View } from "react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { ThemedText } from "@/components/ui/ThemedText";

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
};

const StatCard = ({ title, value, subtitle, color }: Props) => {
  return (
    <View style={styles.container(color)}>
      <View style={styles.titleHolder}>
        <View style={styles.dot(color)} />
        <ThemedText type={"label"} style={styles.title}>
          {title}
        </ThemedText>
      </View>

      <View style={styles.valueHolder}>
        <ThemedText
          style={{
            color: color ?? UnistylesRuntime.getTheme().colors.textPrimary,
          }}
          type={"stat"}
        >
          {value}
        </ThemedText>
        {!!subtitle && (
          <ThemedText type={"micro"} style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        )}
      </View>
    </View>
  );
};

export default StatCard;

const styles = StyleSheet.create((theme) => ({
  // `color` tints the cap and the dot; everything else stays neutral so the
  // number is what the eye lands on.
  // A basis with a floor rather than `flex: 1`, so a row of cards wraps onto the
  // next line instead of shrinking every card into a sliver.
  container: (color?: string) => ({
    flexGrow: 1,
    flexBasis: 150,
    minWidth: 150,
    justifyContent: "space-between",
    gap: theme.margins.xl,
    backgroundColor: theme.colors.surface1,
    borderWidth: 1,
    borderColor: theme.colors.borderHairline,
    borderTopWidth: 3,
    borderTopColor: color ?? theme.colors.textPrimary,
    borderRadius: 2,
    padding: { xs: theme.margins.sm, md: theme.margins.md },
  }),
  titleHolder: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.md,
  },
  dot: (color?: string) => ({
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color ?? theme.colors.textPrimary,
  }),
  title: {
    flexShrink: 1,
    color: theme.colors.textPrimary,
  },
  valueHolder: {
    gap: theme.margins.sm,
  },
  subtitle: {
    textTransform: "uppercase",
  },
}));
