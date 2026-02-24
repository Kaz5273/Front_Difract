import IconDifract from "@/components/icons/iconDifract";
import { Fonts } from "@/constants/theme";
import React, { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Plan = "pro" | "standard";

interface StepSubscriptionProps {
  selectedPlan: Plan;
  onSelectPlan: (plan: Plan) => void;
}

const PRO_FEATURES = [
  "Ajouter quatre musiques supplémentaires",
  "Ajouter un extrait vidéo",
  "Ajouter des liens vers vos plateforme",
  "Participer à plus de 6 événements par an",
];

const STANDARD_FEATURES = [
  "Participer à plus de 3 événements par an",
];

const TIMING_CONFIG = { duration: 250, easing: Easing.out(Easing.ease) };

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PlanCard({
  isSelected,
  onPress,
  children,
}: {
  isSelected: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(isSelected ? 1.03 : 0.97);
  const opacity = useSharedValue(isSelected ? 1.03 : 0.5);

  useEffect(() => {
    scale.value = withTiming(isSelected ? 1 : 0.97, TIMING_CONFIG);
    opacity.value = withTiming(isSelected ? 1 : 0.5, TIMING_CONFIG);
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      style={[
        styles.card,
        isSelected ? styles.cardSelected : styles.cardDefault,
        animatedStyle,
      ]}
      onPress={onPress}
    >
      {children}
    </AnimatedPressable>
  );
}

export function StepSubscription({
  selectedPlan,
  onSelectPlan,
}: StepSubscriptionProps) {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Les abonnements :</Text>

      {/* Pro card */}
      <PlanCard

        isSelected={selectedPlan === "pro"}
        onPress={() => onSelectPlan("pro")}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleGroup}>
            <Text style={styles.proTitle}>Abonnement pro</Text>
            <Text style={styles.proPrice}>8,99€ / mois</Text>
          </View>
          <IconDifract width={30} height={23} />
        </View>
        <View style={styles.featuresList}>
          {PRO_FEATURES.map((feature, index) => (
            <Text key={index} style={styles.featureText}>
              {feature}
            </Text>
          ))}
        </View>
      </PlanCard>

      {/* Standard card */}
      <PlanCard

        isSelected={selectedPlan === "standard"}
        onPress={() => onSelectPlan("standard")}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleGroup}>
            <Text style={styles.standardTitle}>Abonnement standard</Text>
            <Text style={styles.standardPrice}>4,99€ / mois</Text>
          </View>
          <IconDifract width={30} height={23} />
        </View>
        <View style={styles.featuresList}>
          {STANDARD_FEATURES.map((feature, index) => (
            <Text key={index} style={styles.featureText}>
              {feature}
            </Text>
          ))}
        </View>
      </PlanCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    marginTop: -80,
    marginHorizontal: -24,
  },
  container: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    gap: 18,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.extraBold,
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },

  // Cards
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 20,
    gap: 10,
  },
  cardSelected: {
    borderColor: "#fc5f67",
  },
  cardDefault: {
    borderColor: "#8a8a8a",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitleGroup: {
    flex: 1,
    gap: 4,
  },

  // Pro
  proTitle: {
    fontSize: 24,
    fontFamily: Fonts.extraBold,
    color: "#FFFFFF",
    letterSpacing: -0.96,
  },
  proPrice: {
    fontSize: 20,
    fontFamily: Fonts.extraBold,
    color: "#FFFFFF",
    letterSpacing: -0.8,
  },

  // Standard
  standardTitle: {
    fontSize: 20,
    fontFamily: Fonts.extraBold,
    color: "#FFFFFF",
    letterSpacing: -0.8,
  },
  standardPrice: {
    fontSize: 13,
    fontFamily: Fonts.extraBold,
    color: "#b2b2b2",
    letterSpacing: -0.52,
  },

  // Features
  featuresList: {
    gap: 12,
  },
  featureText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: -0.24,
    lineHeight: 14,
  },
});
