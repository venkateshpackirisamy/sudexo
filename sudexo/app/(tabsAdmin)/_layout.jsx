import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';
import colors from '../../assets/color';
export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor:colors.color1 }}>
            <Tabs.Screen
                name="AdminHome"
                options={{
                    headerShown: false ,
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
                    ),
                }}
            />
            <Tabs.Screen
                name="employees"
                options={{
                    headerShown: false ,
                    title: 'Employees',
                    tabBarIcon: ({ color, focused }) => (
                        <FontAwesome6 name="people-group" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="spending"
                options={{
                    headerShown: false ,
                    title: 'Spending',
                    tabBarIcon: ({ color, focused }) => (
                        <Feather name="trending-up" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}