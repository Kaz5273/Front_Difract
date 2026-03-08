import { StepSubscription } from "@/components/register-artist/StepSubscription";
import { subscriptionService } from "@/services/subscription/subscription.service";
import { useAuthStore } from "@/store/auth-store";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Alert } from "react-native";

type Plan = "pro" | "standard";

export default function ArtistSubscribeScreen() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>("pro");
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuthStore();

  const handleValidate = async () => {
    setIsLoading(true);
    try {
      const { checkout_url } = await subscriptionService.checkout(selectedPlan);

      const result = await WebBrowser.openBrowserAsync(checkout_url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        dismissButtonStyle: "close",
        toolbarColor: "#080808",
        controlsColor: "#FFFFFF",
      });

      if (result.type === "cancel" || result.type === "dismiss") {
        const status = await subscriptionService.getStatus();
        if (status.subscribed) {
          router.replace("/(tabs)");
        } else {
          Alert.alert(
            "Paiement non finalisé",
            "Vous devez souscrire à un abonnement pour accéder à l'application."
          );
        }
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || "Erreur lors du paiement";
      Alert.alert("Erreur", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Se déconnecter ?",
      "Un abonnement est requis pour accéder à l'application. Voulez-vous vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Se déconnecter",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/OnBoarding/onboarding");
          },
        },
      ]
    );
  };

  return (
    <StepSubscription
      selectedPlan={selectedPlan}
      onSelectPlan={setSelectedPlan}
      onValidate={handleValidate}
      onCancel={handleCancel}
      isLoading={isLoading}
    />
  );
}
