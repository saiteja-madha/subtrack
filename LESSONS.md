# Design audit lessons

## 2026-08-12 — Liquid Glass audit

- NativeTabs is the correct foundation for system tab behavior on iOS and Android, but its web presentation is not a mobile bottom bar. A `.web.tsx` layout is required for a consistent responsive experience.
- Native Liquid Glass should remain scarce. Applying glass to every content card weakens hierarchy and makes the interface feel noisy; ordinary information belongs on opaque surfaces.
- `@expo/ui` is valuable for a high-salience system control such as the add button. A platform file keeps that native SwiftUI implementation isolated while preserving a robust shared fallback.
- Availability checks alone are incomplete. Reduce Transparency must independently force opaque materials even when the OS supports native glass.
- Browser E2E at a phone viewport is valuable even for a native-first app: it exposed navigation overlap that type checks and native bundles could not reveal.
- Accessibility roles are part of the component contract. Contextual names such as “Status filter, Paused” make repeated chip controls understandable without visual context.
- Confirmation sheets must apply insets on the embedded React Native content rather than the native host wrapper, so the sheet presentation retains a reliable internal grid across platforms.
