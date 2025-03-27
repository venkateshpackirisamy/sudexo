import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Dimensions, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const { height, width } = Dimensions.get('window');
export default function Pin() {

    const item = useLocalSearchParams();

    const [Amount, setAmount] = useState('');

    const Submit = () => {
        router.push({ pathname: '/pin', params: { type:'pay',to_id:item.to_id,amount:Amount} })
    }

    return (

        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.haeder}>
                <Text style={{ fontSize: 20 }}>To:{item.to_id}</Text>
            </View>
            <View style={{ flex: 1, padding: 10, alignItems: 'center' }}>
                <Text style={styles.label}>Enter Amount</Text>
                <TextInput
                    style={styles.input}
                    value={Amount}
                    onChangeText={num=>{setAmount(num)}}
                    keyboardType="numeric"
                    onSubmitEditing={() => { Submit() }}
                />
            </View>
        </SafeAreaView>)
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
    }
})