import * as React from "react";
import Svg, { SvgProps, Defs, Pattern, Path, Rect } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={3000} height={400} {...props}>
    <Defs>
      <Pattern
        id="a"
        width={10}
        height={20}
        patternTransform="rotate(45 0 0)"
        patternUnits="userSpaceOnUse"
      >
        <Path stroke={"#4e4e4e"} strokeWidth={1.5} d="M0 0v20" />
      </Pattern>
    </Defs>
    <Rect width="100%" height="100%" fill="url(#a)" />
  </Svg>
);
export default SvgComponent;
