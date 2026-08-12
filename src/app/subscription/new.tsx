import React, { useState } from "react";
import { useRouter } from "expo-router";

import { Screen } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SubscriptionForm } from "@/components/SubscriptionForm";
import { DataErrorState, LoadingState } from "@/components/DataState";
import type { SubscriptionDraft } from "@/domain/subscription";
import { useData } from "@/hooks/useData";

export default function NewSubscriptionScreen() {
  const router = useRouter();
  const { status, error, categories, settings, addSubscription } = useData();
  const [submitting, setSubmitting] = useState(false);

  if (status === "loading") {
    return (
      <Screen scroll={false} header={<ScreenHeader title="New subscription" showBack />}>
        <LoadingState />
      </Screen>
    );
  }
  if (status === "error") {
    return (
      <Screen scroll={false} header={<ScreenHeader title="New subscription" showBack />}>
        <DataErrorState message={error} />
      </Screen>
    );
  }

  const handleSubmit = async (draft: SubscriptionDraft) => {
    setSubmitting(true);
    try {
      await addSubscription(draft);
      router.back();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen header={<ScreenHeader title="New subscription" showBack />}>
      <SubscriptionForm
        defaultCurrency={settings.currency}
        categories={categories}
        isSubmitting={submitting}
        submitLabel="Create subscription"
        onSubmit={(draft) => void handleSubmit(draft)}
      />
    </Screen>
  );
}
