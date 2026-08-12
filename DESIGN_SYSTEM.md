# SubTrack design system

## Principles

- Keep content calm and readable. Glass is interaction chrome, not a card treatment for every section.
- Use platform-native behavior when it improves fidelity, with deliberate fallbacks for older systems, Android, and web.
- Preserve user accessibility choices, especially Reduce Transparency and color-scheme preferences.

## Materials

- `SurfaceCard` is the standard container for summaries, settings groups, details, and forms. It uses the themed surface and divider tokens.
- `GlassSurface` is reserved for floating or modal interaction chrome such as selectors and confirmation dialogs. On supported iOS versions it uses `expo-glass-effect`; elsewhere it uses blur/translucency. Reduce Transparency replaces it with an opaque surface.
- Confirmation dialogs use native bottom sheets with generously inset content, one full-width primary action, and a separate lower-emphasis cancel action.
- `GlassIconButton` is the shared circular glass control. Supported iOS versions use interactive native glass. Fallbacks retain a 44-point target, visible border, and pressed feedback.
- `AddSubscriptionButton.ios.tsx` uses a SwiftUI `Button` from `@expo/ui` with the system glass button style. `AddSubscriptionButton.tsx` is the cross-platform fallback.

## Navigation

- iOS and Android use Expo Router `NativeTabs`. iOS receives the system tab material, including Liquid Glass where the OS supports it; Android receives the platform-native tab implementation and themed material.
- Web uses a platform-specific Expo Router `Tabs` layout with a floating blurred bottom bar. Do not use native tabs on web because their web fallback presents as a top strip.

## Interaction and accessibility

- Interactive targets are at least 44 points high or wide.
- Segmented controls expose `radiogroup` and `radio` semantics with contextual labels.
- Icon-only controls require an accessibility label and, where useful, a hint.
- Loading states use static skeleton shapes; error states use an assertive live region and a retry action.
- Form errors are announced and also shown adjacent to the affected field.

## Content hierarchy

- Each screen has one title and only the supporting metadata needed to make a decision.
- Subscription filters remain collapsed until requested; the filter button shows the active-filter count.
- Use `SurfaceCard` for ordinary content and reserve elevated glass for controls that float above content.
