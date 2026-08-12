import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/ui";
import { useAppTheme } from "@/theme";

export default function NotFoundScreen() {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Page not found</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        That screen does not exist.
      </Text>
      <Link href="/" asChild>
        <AppButton label="Go home" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: "800" },
  message: { fontSize: 15 },
});
