import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { EmptyState } from "@/components/EmptyState";
import { DataErrorState, LoadingState } from "@/components/DataState";
import { Screen } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SubscriptionForm } from "@/components/SubscriptionForm";
import { toFormValues, type SubscriptionDraft } from "@/domain/subscription";
import { useData } from "@/hooks/useData";

export default function EditSubscriptionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { status, error, subscriptions, categories, settings, updateSubscription } = useData();
  const [submitting, setSubmitting] = useState(false);

  const subscription = useMemo(
    () => subscriptions.find((s) => s.id === params.id),
    [subscriptions, params.id],
  );
  const initial = useMemo(
    () => (subscription ? toFormValues(subscription) : undefined),
    [subscription],
  );

  if (status === "loading") {
    return (
      <Screen nativeFormSheet scroll={false} header={<ScreenHeader title="Edit subscription" />}>
        <LoadingState />
      </Screen>
    );
  }
  if (status === "error") {
    return (
      <Screen nativeFormSheet scroll={false} header={<ScreenHeader title="Edit subscription" />}>
        <DataErrorState message={error} />
      </Screen>
    );
  }

  if (!subscription) {
    return (
      <Screen nativeFormSheet header={<ScreenHeader title="Edit subscription" />}>
        <View style={styles.center}>
          <EmptyState
            icon="alert-circle-outline"
            title="Subscription not found"
            message="It may have been deleted."
          />
        </View>
      </Screen>
    );
  }

  const handleSubmit = async (draft: SubscriptionDraft) => {
    setSubmitting(true);
    try {
      await updateSubscription(subscription.id, draft);
      router.back();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen
      nativeFormSheet
      scroll={process.env.EXPO_OS !== "ios"}
      header={<ScreenHeader title="Edit subscription" />}
    >
      <SubscriptionForm
        initial={initial}
        defaultCurrency={settings.currency}
        categories={categories}
        showStatus
        isSubmitting={submitting}
        submitLabel="Save changes"
        onSubmit={(draft) => void handleSubmit(draft)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({ center: { flex: 1, justifyContent: "center" } });
