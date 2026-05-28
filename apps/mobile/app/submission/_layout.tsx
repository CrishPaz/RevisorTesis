import { Stack } from "expo-router";

export default function SubmissionLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Atrás",
        headerStyle: { backgroundColor: "#f0f9ff" },
        headerTintColor: "#0284c7",
      }}
    />
  );
}
