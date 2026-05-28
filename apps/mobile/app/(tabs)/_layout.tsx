import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#f0f9ff" },
        headerTitleStyle: { fontWeight: "700" },
        tabBarActiveTintColor: "#0284c7",
        tabBarInactiveTintColor: "#71717a",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Inicio", tabBarLabel: "Inicio" }}
      />
      <Tabs.Screen
        name="submissions"
        options={{ title: "Mis avances", tabBarLabel: "Avances" }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Mi perfil", tabBarLabel: "Perfil" }}
      />
    </Tabs>
  );
}
