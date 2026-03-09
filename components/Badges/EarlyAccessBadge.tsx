import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ticket } from "lucide-react-native";
import { Fonts } from "@/constants/theme";

type TicketTier = "early_access" | "standard" | "last_minute";

const TIER_LABELS: Record<TicketTier, string> = {
  early_access: "Early access",
  standard: "Standard",
  last_minute: "Dernière minute",
};

interface EarlyAccessBadgeProps {
  price?: number;
  tier?: TicketTier;
}

export const EarlyAccessBadge: React.FC<EarlyAccessBadgeProps> = ({
  price,
  tier = "early_access",
}) => {
  const label = TIER_LABELS[tier];

  return (
    <View style={styles.container}>
      <Ticket size={16} color="#FC5F67" />
      <Text style={styles.text}>{label}</Text>
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
