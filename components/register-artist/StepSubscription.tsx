import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Check, ChevronLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Fonts } from "@/constants/theme";
import IconDifract from "@/components/icons/iconDifract";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from "react-native-reanimated";

const BG_IMAGE = require("@/assets/images/OnboardingChoiceAbo.png");

type Plan = "pro" | "standard";
type TabPlan = "standard" | "reduit";

interface StepSubscriptionProps {
  selectedPlan: Plan;
  onSelectPlan: (plan: Plan) => void;
  onValidate: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PLANS: Record<
  TabPlan,
  {
    title: string;
    features: string[];
    price: string;
    apiPlan: Plan;
    priceColor: string;
  }
> = {
  standard: {
    title:
      "Mettez toutes les chances de votre c\u00f4t\u00e9 pour vous retrouver sur sc\u00e8ne !",
    features: [
      "Ajouter jusqu'\u00e0 5 musiques sur votre compte",
      "Ajouter un extrait vid\u00e9o sur votre compte",
      "Ajouter des liens vers vos r\u00e9seaux sociaux",
      "Participer \u00e0 plus de 6 \u00e9v\u00e9nements par an",
    ],
    price: "8,99\u20ac / mois",
    apiPlan: "pro",
    priceColor: "#F9F871",
  },
  reduit: {
    title: "L'abonnement minimum pour pouvoir rejoindre Difract !",
    features: [
      "Ajouter une musique sur votre compte",
      "Participer \u00e0 3 \u00e9v\u00e9nements par an",
      "Ajouter des liens vers vos r\u00e9seaux sociaux",
    ],
    price: "4,99\u20ac / mois",
    apiPlan: "standard",
    priceColor: "#FFFFFF",
  },
};

function getTabFromPlan(plan: Plan): TabPlan {
  return plan === "pro" ? "standard" : "reduit";
}

export function StepSubscription({
  selectedPlan,
  onSelectPlan,
  onValidate,
  onCancel,
  isLoading,
}: StepSubscriptionProps) {
  const activeTab = getTabFromPlan(selectedPlan);
  const insets = useSafeAreaInsets();

  // Displayed tab is intentionally delayed to allow fade-out before content swap
  const [displayedTab, setDisplayedTab] = useState<TabPlan>(activeTab);
  const plan = PLANS[displayedTab];

  // Content animation values
  const contentOpacity = useSharedValue(1);
  const contentTranslateY = useSharedValue(0);


  useEffect(() => {
    if (activeTab === displayedTab) return;

    // Fade + slide out
    contentOpacity.value = withTiming(0, { duration: 120, easing: Easing.out(Easing.ease) });
    contentTranslateY.value = withTiming(-10, { duration: 120, easing: Easing.out(Easing.ease) }, () => {
      // Swap content mid-animation
      runOnJS(setDisplayedTab)(activeTab);
      // Reset position below, then spring in
      contentTranslateY.value = 12;
      contentOpacity.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.ease) });
      contentTranslateY.value = withSpring(0, { damping: 18, stiffness: 200 });
    });
  }, [activeTab]);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const handleTabPress = (tab: TabPlan) => {
    onSelectPlan(PLANS[tab].apiPlan);
  };

  // Tab styles: active tab is bright yellow (#F9F871), inactive is muted (#717139)
  const getTabStyle = (tab: TabPlan) => {
    if (activeTab === tab) {
      return [styles.tab, styles.tabActive];
    }
    return [styles.tab, styles.tabInactive];
  };

  const getTabTextStyle = (tab: TabPlan) => {
    if (activeTab === tab) {
      return [styles.tabText, styles.tabTextActive];
    }
    return [styles.tabText, styles.tabTextInactive];
  };

  return (
    <View style={styles.root}>
      <ImageBackground source={BG_IMAGE} style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[
            "rgba(17,17,17,0)",
            "rgba(17,17,17,0.85)",
            "#111111",
          ]}
          locations={[0.17, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      {/* Back button */}
      <Pressable
        style={[styles.backButton, { top: insets.top + 12 }]}
        onPress={onCancel}
        hitSlop={8}
      >
        <ChevronLeft size={28} color="#FFFFFF" />
      </Pressable>

      {/* Main content */}
      <View style={[styles.container, { paddingTop: insets.top + 100, paddingBottom: insets.bottom}]}>

        {/* Top section: logo + title + features + tabs */}
        <View style={styles.topSection}>
          {/* Content: logo + title + features */}
          <Animated.View style={[styles.contentSection, contentAnimatedStyle]}>
            <View style={styles.logoContainer}>
              <IconDifract width={119} height={89} />
            </View>
            <Text style={styles.title}>{plan.title}</Text>
            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Tab selector */}
          <View style={styles.tabContainer}>
            <View style={styles.tabWrapper}>
              <Pressable
                style={getTabStyle("standard")}
                onPress={() => handleTabPress("standard")}
              >
                <Text style={getTabTextStyle("standard")}>Pro</Text>
              </Pressable>
            </View>
            <View style={styles.tabWrapper}>
              <Pressable
                style={getTabStyle("reduit")}
                onPress={() => handleTabPress("reduit")}
              >
                <Text style={getTabTextStyle("reduit")}>Standard</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Bottom section: price + buttons */}
        <View style={styles.bottomSection}>
          <Animated.View style={[styles.priceContainer, contentAnimatedStyle]}>
            <Text style={[styles.priceText, { color: plan.priceColor }]}>
              {plan.price}
            </Text>
            <Text style={[styles.priceSubtext, { color: plan.priceColor }]}>
              Sans engagement
            </Text>
          </Animated.View>
          <Pressable
            style={styles.validateButton}
            onPress={onValidate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.validateButtonText}>
                Valider l'inscription
              </Text>
            )}
          </Pressable>
          <Pressable
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </Pressable>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#111111",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  topSection: {
    alignItems: "center",
    gap: 64,
  },
  contentSection: {
    alignItems: "center",
    gap: 48,
    width: "100%",
    paddingHorizontal: 16,
    minHeight: 335,
  },
  bottomSection: {
    alignItems: "center",
    gap: 16,
  },
  backButton: {
    position: "absolute",
    left: 17,
    zIndex: 10,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  title: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 22,
    letterSpacing: -0.32,
  },
  featuresContainer: {
    width: "100%",
    gap: 6,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.24,
    flex: 1,
    lineHeight: 16,
  },
  // Tabs
  tabContainer: {
    flexDirection: "row",
    gap: 16,
  },
  tabWrapper: {
    flex: 1,
  },
  tab: {
    height: 38,
    width: "100%",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  tabActive: {
    backgroundColor: "#F9F871",
  },
  tabInactive: {
    borderWidth: 1,
    borderColor: "#717139",
  },
  tabText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    letterSpacing: -0.28,
  },
  tabTextActive: {
    color: "#111111",
  },
  tabTextInactive: {
    color: "#717139",
  },
  // Price
  priceContainer: {
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  priceText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    letterSpacing: -0.32,
  },
  priceSubtext: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    letterSpacing: -0.28,
  },
  // Buttons
  validateButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 49,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    width: '100%',
    alignSelf: "center",
    marginBottom: 0,
  },
  validateButtonText: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: "#000000",
  },
  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    alignSelf: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: "#9d9d9d",
  },
});
