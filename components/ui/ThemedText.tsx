import { Text, type TextProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";

// import { useThemeColor } from '@/hooks/useThemeColor';

export type TextTypes =
  | "default"
  | "title"
  | "defaultSemiBold"
  | "subtitle"
  | "link"
  | "defaultSemiBoldMedium"
  | "small"
  | "mono"
  | "monoSmall"
  | "monoBold"
  // Design system type scale
  | "display"
  | "heading"
  | "label"
  | "name"
  | "stat"
  | "metric"
  | "cell"
  | "log"
  | "micro";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: TextTypes;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  // const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <Text style={[styles.text, styles[type], style]} {...rest} />;
}

// Custom fonts ship one file per weight, so the weight is selected by picking
// the matching family rather than by `fontWeight`.
const fonts = {
  regular: "ChakraPetch_400Regular",
  medium: "ChakraPetch_500Medium",
  semiBold: "ChakraPetch_600SemiBold",
  bold: "ChakraPetch_700Bold",
  mono: "JetBrainsMono_400Regular",
  monoMedium: "JetBrainsMono_500Medium",
  monoSemiBold: "JetBrainsMono_600SemiBold",
  monoBold: "JetBrainsMono_700Bold",
} as const;

const styles = StyleSheet.create((theme) => ({
  text: {
    color: theme.colors.textPrimary,
    fontFamily: fonts.regular,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.semiBold,
  },
  defaultSemiBoldMedium: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: fonts.bold,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.bold,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 22,
    fontFamily: fonts.bold,
  },
  link: {
    lineHeight: 24,
    // fontSize: 14,
    color: theme.colors.primary,
    textDecorationLine: "underline",
    textDecorationColor: theme.colors.primary,
  },
  small: {
    fontSize: 12,
    lineHeight: 18,
  },
  mono: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.mono,
  },
  monoSmall: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.mono,
  },
  monoBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.monoBold,
  },
  // Design system type scale
  display: {
    fontFamily: fonts.bold,
    fontSize: 40,
    lineHeight: 42,
    letterSpacing: 40 * 0.16,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 19,
    lineHeight: 22,
    letterSpacing: 19 * 0.04,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    letterSpacing: 11 * 0.2,
    textTransform: "uppercase",
    color: theme.colors.textSecondary,
  },
  name: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 17,
  },
  stat: {
    fontFamily: fonts.monoBold,
    fontSize: 42,
    lineHeight: 42,
    letterSpacing: 42 * -0.02,
  },
  metric: {
    fontFamily: fonts.monoBold,
    fontSize: 20,
    lineHeight: 20,
  },
  cell: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  log: {
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.textSecondary,
  },
  micro: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 11 * 0.08,
    color: theme.colors.textMuted,
  },
}));
