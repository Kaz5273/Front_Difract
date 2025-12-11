import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const IconPlay = ({ color, ...props }: SvgProps & { color?: string }) => (
  <Svg width={10} height={12} viewBox="0 0 10 12" fill="none" {...props}>
    <Path
      d="M1 1L9 6L1 11V1Z"
      fill="white"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default IconPlay;
