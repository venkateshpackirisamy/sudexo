import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
      <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="(tabsEmp)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabsAdmin)" options={{ headerShown: false }} />
      <Stack.Screen name="pin" options={{ headerShown: false }} />
      <Stack.Screen name="balance" options={{ headerShown: false }} />
      
    </Stack>
   
  );
}