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
  | "small";

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

  return (
    <Text
      style={[
        styles.text,
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "defaultSemiBoldMedium"
          ? styles.defaultSemiBoldMedium
          : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        type === "small" ? styles.small : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  text: {
    color: theme.colors.textPrimary,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  defaultSemiBoldMedium: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "700",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "bold",
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
}));
