import { Stack } from 'expo-router';
import colors from '../assets/color';
export default function RootLayout() {
  return (
      <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="emplogin" options={{ headerShown: false }} />
      <Stack.Screen name="(tabsEmp)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabsAdmin)" options={{ headerShown: false }} />
      <Stack.Screen name="pin" options={{ headerShown: false }} />
      <Stack.Screen name="balance" options={{ headerShown: false }} />
      <Stack.Screen name="payment" options={{ headerShown: false }} />
      <Stack.Screen name='profile' options={{headerStyle:{backgroundColor:colors.color1}, headerTitleStyle:{color:'white'}, headerTintColor:'white'}} />
      <Stack.Screen name="employeeRegister" options={{headerStyle:{backgroundColor:colors.color1}, headerTitleStyle:{color:'white'}, headerTintColor:'white'}} />
      <Stack.Screen name="employee" options={{headerStyle:{backgroundColor:colors.color1}, headerTitleStyle:{color:'white'}, headerTintColor:'white'}} />
      <Stack.Screen name="billPayment" options={{headerStyle:{backgroundColor:colors.color1}, headerTitleStyle:{color:'white'}, headerTintColor:'white'}} />
      <Stack.Screen name="scanQr" options={{headerTitle:'Scan & Pay', headerStyle:{backgroundColor:colors.color1}, headerTitleStyle:{color:'white'}, headerTintColor:'white'}} />
      <Stack.Screen name="pay" options={{headerTitle:'Payment', headerStyle:{backgroundColor:colors.color1}, headerTitleStyle:{color:'white'}, headerTintColor:'white'}} />
      <Stack.Screen name="createMultiple" options={{headerStyle:{backgroundColor:colors.color1}, headerTitleStyle:{color:'white'}, headerTintColor:'white'}} />
    </Stack>
      
   
  );
}