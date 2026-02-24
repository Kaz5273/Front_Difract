import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

type Plan = "pro" | "standard";

interface CheckoutResponse {
  checkout_url: string;
  plan: Plan;
}

interface SubscriptionInfo {
  status: string;
  plan: Plan;
  on_trial: boolean;
  on_grace_period: boolean;
  cancelled: boolean;
  paused: boolean;
  past_due: boolean;
  expires_at: string | null;
  renews_at: string | null;
  trial_ends_at: string | null;
}

interface SubscriptionStatusResponse {
  subscribed: boolean;
  subscription: SubscriptionInfo | null;
}

interface CancelResponse {
  message: string;
  expires_at: string;
}

interface ResumeResponse {
  message: string;
}

interface PortalResponse {
  portal_url: string;
}

export const subscriptionService = {
  checkout: async (plan: Plan): Promise<CheckoutResponse> => {
    const response = await apiClient.post<CheckoutResponse>(
      ENDPOINTS.SUBSCRIPTION_CHECKOUT,
      { plan }
    );
    return response.data;
  },

  getStatus: async (): Promise<SubscriptionStatusResponse> => {
    const response = await apiClient.get<SubscriptionStatusResponse>(
      ENDPOINTS.SUBSCRIPTION_STATUS
    );
    return response.data;
  },

  cancel: async (): Promise<CancelResponse> => {
    const response = await apiClient.post<CancelResponse>(
      ENDPOINTS.SUBSCRIPTION_CANCEL
    );
    return response.data;
  },

  resume: async (): Promise<ResumeResponse> => {
    const response = await apiClient.post<ResumeResponse>(
      ENDPOINTS.SUBSCRIPTION_RESUME
    );
    return response.data;
  },

  getPortalUrl: async (): Promise<PortalResponse> => {
    const response = await apiClient.get<PortalResponse>(
      ENDPOINTS.SUBSCRIPTION_PORTAL
    );
    return response.data;
  },
};

export type {
  Plan,
  CheckoutResponse,
  SubscriptionInfo,
  SubscriptionStatusResponse,
};
