import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { interpolateColor } from "react-native-reanimated";

type Props = {
  // 0 - 100. Anything outside that range is clamped.
  percentage: number;
  size?: number;
};

const PiePercentage = ({ percentage, size = 16 }: Props) => {
  const { theme } = useUnistyles();
  const value = Math.max(0, Math.min(100, percentage));

  // `interpolateColor` cannot run inside `StyleSheet.create`, so the fill is
  // computed here and handed to the SVG as a prop.
  const fill = interpolateColor(
    value,
    [0, 100],
    [theme.colors.textPrimary, theme.colors.accentMedic],
  );

  // The pie is drawn as a single stroked circle at half the radius: a stroke as
  // thick as that radius reaches the center on one side and the edge on the
  // other, and the dash covers the share of the circumference we want filled.
  const radius = size / 2;
  const pieRadius = radius / 2;
  const circumference = 2 * Math.PI * pieRadius;
  const filled = (circumference * value) / 100;

  return (
    <View style={styles.container(size)}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={radius}
          cy={radius}
          r={pieRadius}
          fill={"none"}
          stroke={fill}
          strokeWidth={pieRadius * 2}
          strokeDasharray={`${filled} ${circumference}`}
          // Dashes start at 3 o'clock; the pie should fill from 12 o'clock.
          transform={`rotate(-90 ${radius} ${radius})`}
        />
        <Circle
          cx={radius}
          cy={radius}
          r={radius - 0.5}
          fill={"none"}
          stroke={theme.colors.borderStrong}
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
};

export default PiePercentage;

const styles = StyleSheet.create(() => ({
  container: (size: number) => ({
    width: size,
    height: size,
  }),
}));
