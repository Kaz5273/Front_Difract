import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ticket } from "lucide-react-native";
import { Fonts } from "@/constants/theme";

interface EarlyAccessBadgeProps {
  price?: number;
}

export const EarlyAccessBadge: React.FC<EarlyAccessBadgeProps> = ({
  price,
}) => {
  return (
    <View style={styles.container}>
      <Ticket size={16} color="#FC5F67" />
      <Text style={styles.text}>Early access</Text>
      {price !== undefined && <Text style={styles.text}>{price}€</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    height: 30,
    paddingHorizontal: 8,
    backgroundColor: "#402123",
    borderRadius: 10,
  },
  text: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#FC5F67",
    letterSpacing: -0.24,
  },
});
