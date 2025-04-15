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
            <StatusBar style="light" backgroundColor={colors.color1} />
            <ToastManager />
            <View style={styles.header}>
                <Text style={styles.headerText}>Paying To</Text>
                <Text style={styles.receiverText}>{item.to_id}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Enter Amount</Text>
                <TextInput
                    style={styles.input}
                    value={Amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    onSubmitEditing={Submit}
                    placeholder="₹0.00"
                    placeholderTextColor="#aaa"
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={Submit}>
                <Text style={styles.buttonText}>Proceed to Pay</Text>
            </TouchableOpacity>
        </View>
    );
}
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     haeder: {
//         height: height * 0.1,
//         width: '100%',
//         padding: 20,
//         backgroundColor: 'white',
//         alignItems: 'center',
//         justifyContent: 'center',
//         gap: 10
//     },
//     input: {
//         width: width * 0.8,
//         height: height * 0.10,
//         borderColor: '#ccc',
//         borderWidth: 1,
//         borderRadius: 5,
//         fontSize: 30,
//         textAlign: 'center',
//         marginBottom: 20,
//     },
//     label: {
//         fontSize: 18,
//         marginBottom: 20,
//     },
//      button: {
//         width: '100%',
//         padding: 15,
//         backgroundColor: '#4CAF50',
//         alignItems: 'center',
//         borderRadius: 5,
//     },
//     buttonText: {
//         fontSize: 18,
//         color: '#fff',
//         fontWeight: 'bold',
//     }
// })

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F8FA',
        padding: 20,
        backgroundColor:'white'
    },
    header: {
        paddingTop: 40,
        paddingBottom: 20,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 16,
        color: '#555',
    },
    receiverText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111',
        marginTop: 5,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        marginTop: 30,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 5,
        alignItems: 'center',
    },
    label: {
        fontSize: 18,
        color: '#444',
        marginBottom: 10,
    },
    input: {
        width: '100%',
        fontSize: 32,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        textAlign: 'center',
        padding: 10,
        color: '#000',
    },
    button: {
        backgroundColor: colors.color1,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 40,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});