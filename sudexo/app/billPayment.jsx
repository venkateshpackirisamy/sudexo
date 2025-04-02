import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Dimensions, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ToastManager, { Toast } from "toastify-react-native";
import colors from "../assets/color";
import { TouchableOpacity } from "react-native";
const { height, width } = Dimensions.get('window');
export default function Pin() {

    const item = useLocalSearchParams();
    const [id, setID] = useState('');
    const Submit = () => {
        if (id.length == 10)
            router.push({ pathname: '/pay', params: { to_id: id } })
        else
            Toast.error(`invalid ${item.type == 'mobile' ? 'mobile number' : 'consumer id'}`)
    }

    return (

        <View style={styles.container}>
            <StatusBar style='light' backgroundColor={colors.color1} />
            <ToastManager />
            <View style={styles.haeder}>
                <Text style={{ fontSize: 20 }}>{item.type}</Text>
            </View>
            <View style={{ flex: 1, padding: 10, alignItems: 'center' }}>
                <Text style={styles.label}>{item.type == 'mobile' ? "Enter Modile Number" : 'Enter consumber ID'}</Text>
                <TextInput
                    style={styles.input}
                    value={id}
                    onChangeText={data => { setID(data) }}
                    keyboardType="numeric"
                    maxLength={10}
                    placeholder={item.type == 'mobile' ? "Modile Number" : 'consumber ID'}
                    onSubmitEditing={() => { Submit() }}
                />
            </View>
            <View style={{ padding: 20 }}>
                <TouchableOpacity style={styles.button} onPress={Submit}>
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
            </View>

        </View>)
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    haeder: {
        height: height * 0.1,
        width: '100%',
        padding: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10
    },
    input: {
        width: width * 0.8,
        height: height * 0.06,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        marginBottom: 20,
    },
    button: {
        width: '100%',
        padding: 15,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    }
})