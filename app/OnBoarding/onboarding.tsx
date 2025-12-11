import { OnboardingButton } from "@/components/onboarding/onboarding-button";
import { OnboardingPagination } from "@/components/onboarding/onboarding-pagination";
import { OnboardingSlide } from "@/components/onboarding/onboarding-slide";
import { ONBOARDING_SLIDES } from "@/constants/onboarding-data";
import { useOnboarding } from "@/hooks/use-onboarding";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { completeOnboarding } = useOnboarding();

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
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace("/Auth/Index");
  };

  const handleFinish = async () => {
    await completeOnboarding();
    router.replace("/Auth/Index");
  };

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={({ item, index }) => (
          <OnboardingSlide slide={item} index={index} />
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
      <View style={styles.footer}>
        <OnboardingPagination
          totalSlides={ONBOARDING_SLIDES.length}
          currentIndex={currentIndex}
        />
        <View style={styles.buttonsContainer}>
          {!isLastSlide && (
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Passer</Text>
            </Pressable>
          )}
          <OnboardingButton
            title={isLastSlide ? "Commencer" : "Suivant"}
            onPress={isLastSlide ? handleFinish : handleNext}
          />
        </View>
      </View>
    </SafeAreaView>
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
    paddingHorizontal: 40,
    paddingBottom: 70,
    gap: 32,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  skipText: {
    color: "#999999",
    fontSize: 16,
    fontFamily: "Area-Regular",
  },
});
