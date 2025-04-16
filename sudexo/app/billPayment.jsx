import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Dimensions, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ToastManager, { Toast } from "toastify-react-native";
import colors from "../assets/color";
import { TouchableOpacity } from "react-native";
const { height, width } = Dimensions.get('window');
import { Ionicons } from '@expo/vector-icons';
export default function Pin() {

    const item = useLocalSearchParams();
    const [id, setID] = useState('');
    const Submit = () => {
        console.log('submit')
        if (id.length == 10)
            router.push({ pathname: '/pay', params: { to_id: id } })
        else {
            Toast.error(`invalid ${item.type == 'mobile' ? 'mobile number' : 'consumer id'}`)

        }
    }

    const getIcon = () => {
        return item.type === 'mobile'
            ? <Ionicons name="call-outline" size={24} color="#fff" />
            : <Ionicons name="flash-outline" size={24} color="#fff" />;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" backgroundColor={colors.color1} />
            <ToastManager />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    {getIcon()}
                    <Text style={styles.headerText}>
                        {item.type === 'mobile' ? 'Mobile Recharge' : 'Electricity Bill'}
                    </Text>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>
                    {item.type === 'mobile' ? "Enter Mobile Number" : "Enter Consumer ID"}
                </Text>

                <TextInput
                    style={styles.input}
                    value={id}
                    onChangeText={setID}
                    keyboardType="numeric"
                    maxLength={10}
                    placeholder={item.type === 'mobile' ? "Mobile Number" : "Consumer ID"}
                    onSubmitEditing={Submit}
                    placeholderTextColor="#aaa"
                />

                <TouchableOpacity style={styles.button} onPress={Submit}>
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.color1,
        paddingHorizontal: 15,
        paddingVertical: 20,
    },
    backButton: {
        marginRight: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerText: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
    },
    card: {
        marginTop: 40,
        marginHorizontal: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    label: {
        fontSize: 16,
        marginBottom: 15,
        color: '#333',
        fontWeight: '500',
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 25,
        backgroundColor: '#fafafa',
    },
    button: {
        backgroundColor: colors.color1,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
});