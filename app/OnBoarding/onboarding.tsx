import { OnboardingButton } from "@/components/onboarding/onboarding-button";
import { OnboardingPagination } from "@/components/onboarding/onboarding-pagination";
import { OnboardingSlide } from "@/components/onboarding/onboarding-slide";
import { ONBOARDING_SLIDES, UserRole } from "@/constants/onboarding-data";
import { Fonts } from "@/constants/theme";
import { useOnboarding } from "@/hooks/use-onboarding";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserRole>("public");
  const flatListRef = useRef<FlatList>(null);
  const { completeOnboarding } = useOnboarding();

  // Filtrer les slides : garder ceux sans forRole + ceux du rôle sélectionné
  const slides = useMemo(
    () =>
      ONBOARDING_SLIDES.filter(
        (s) => !s.forRole || s.forRole === selectedRole
      ),
    [selectedRole]
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    }
  ).current;

  const handleMomentumScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleFinish = async () => {
    await completeOnboarding();
    if (selectedRole === "public") {
      router.replace("/Auth/register-public");
    } else {
      router.replace("/Auth/register-artist");
    }
  };

  const handleGuest = async () => {
    await completeOnboarding();
    router.replace("/(tabs)");
  };

  const isLastSlide = currentIndex === slides.length - 1;
  const isWelcomeSlide = slides[currentIndex]?.type === "welcome";

  const handleCreateAccount = () => {
    // Aller au slide de choix public/artiste (index 1)
    flatListRef.current?.scrollToIndex({
      index: 1,
      animated: true,
    });
  };

  const handleLogin = () => {
    router.push("/Auth/Login");
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item, index }) => (
          <OnboardingSlide
            slide={item}
            index={index}
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
          />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        keyExtractor={(item) => item.id}
        scrollEventThrottle={32}
        bounces={false}
        style={styles.flatList}
        snapToInterval={width}
        decelerationRate="fast"
      />
      <View style={[styles.footer, isWelcomeSlide ? styles.footerWelcome : styles.footerDefault]}>
        {isWelcomeSlide ? (
          <>
            <OnboardingButton
              title="Créer un compte"
              onPress={handleCreateAccount}
              fullWidth
            />
            <OnboardingButton
              title="Se connecter"
              onPress={handleLogin}
              fullWidth
            />
          </>
        ) : (
          <OnboardingButton
            title={isLastSlide ? "C'est parti !" : "Suivant"}
            onPress={isLastSlide ? handleFinish : handleNext}
            fullWidth
          />
        )}
        <OnboardingPagination
          totalSlides={slides.length}
          currentIndex={currentIndex}
        />
        {isWelcomeSlide && (
          <Pressable onPress={handleGuest} style={styles.guestButton}>
            <Text style={styles.guestText}>
              Je continue en tant qu'invité
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  flatList: {
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 10,
  },
  footerWelcome: {
    paddingBottom: 80,
  },
  footerDefault: {
    paddingBottom: 127,
  },
  guestButton: {
    paddingVertical: 10,
    paddingHorizontal: 79,
  },
  guestText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: "rgba(255, 255, 255, 0.7)",
  },
});
