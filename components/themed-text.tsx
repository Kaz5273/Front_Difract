import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";
import { Fonts, Typography } from "@/constants/theme";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: keyof typeof Typography;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "body",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return <Text style={[{ color }, Typography[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.regular,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.semiBold,
  },
  title: {
    fontFamily: "Area-SemiBold",
    fontSize: 20,
    lineHeight: 32,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 20,
    fontFamily: Fonts.semiBold,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
    fontFamily: Fonts.regular,
  },
});
