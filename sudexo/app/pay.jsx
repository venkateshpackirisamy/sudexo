import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Button, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import ToastManager, { Toast } from "toastify-react-native";
import colors from "../assets/color";
const { height, width } = Dimensions.get('window');
export default function Pay() {

    const item = useLocalSearchParams();
    const [Amount, setAmount] = useState('');

    const Submit = () => {
        if (Amount)
            router.push({ pathname: '/pin', params: { type: 'pay', to_id: item.to_id, amount: Amount } })
        else
            Toast.error('Enter a Amount')
    }

    return (
        <View style={styles.container}>
            <StatusBar style='light' backgroundColor={colors.color1} />
            <ToastManager />
            <View style={styles.haeder}>
                <Text style={{ fontSize: 20 }}>To:{item.to_id}</Text>
            </View>
            <View style={{ flex: 1, padding: 10, alignItems: 'center' }}>
                <Text style={styles.label}>Enter Amount</Text>
                <TextInput
                    style={styles.input}
                    value={Amount}
                    onChangeText={num => { setAmount(num) }}
                    keyboardType="numeric"
                    onSubmitEditing={() => { Submit() }}
                />
            </View>
            <View style={{padding:20}}>
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
        height: height * 0.10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        fontSize: 30,
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