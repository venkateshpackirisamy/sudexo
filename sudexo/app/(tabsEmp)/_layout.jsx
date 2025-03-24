import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="EmpHome"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
                    ),
                }}
            />
            <Tabs.Screen
                name="transaction"
                options={{
                    title: 'Transaction',
                    tabBarIcon: ({ color, focused }) => (

                        <FontAwesome6 name="money-bill-transfer" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}