import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useRef } from "react";
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ToastManager, { Toast } from "toastify-react-native";
import colors from "../assets/color";
const { height, width } = Dimensions.get('window');

export default function Pin() {
    const item = useLocalSearchParams();
    const [pin, setPin] = useState(['', '', '', '']); // Storing individual digits in an array.
    const [focusedIndex, setFocusedIndex] = useState(0); // To track which digit is focused

    // Create refs for all the PIN input boxes
    const inputRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null)
    ];

    const handlePinChange = (text, index) => {
        let updatedPin = [...pin];
        updatedPin[index] = text;
        setPin(updatedPin);

        // Move to the next box automatically if the current box is filled
        if (text !== '' && index < 3) {
            inputRefs[index + 1].current.focus(); // Focus next input box
        } else if (text === '' && index > 0) {
            inputRefs[index - 1].current.focus(); // Focus previous box if the current box is cleared
        }
    };

    const handleSubmit = () => {
        const pinString = pin.join('');
        if (pinString.length === 4) {
            if (item.type === 'pay') {
                router.push({ pathname: '/payment', params: { to_id: item.to_id, amount: item.amount, pin: pinString } });
            } else if (item.type === 'balance') {
                router.push({ pathname: '/balance', params: { pin: pinString } });
            }
        } else {
            Toast.error("Enter valid pin number");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" backgroundColor={colors.color1} />
            <ToastManager />
            <View style={styles.header}>
                <Text style={{ fontSize: 20, color: 'white' }}>{item.type}</Text>
            </View>

            <View style={{ flex: 1, padding: 10, alignItems: 'center' }}>
                <Text style={styles.label}>Enter your 4-digit PIN</Text>
                <View style={styles.pinInputContainer}>
                    {pin.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={inputRefs[index]} // Assign each input a reference
                            style={[
                                styles.input,
                                {
                                    borderColor: focusedIndex === index ? colors.color1 : '#ccc',
                                    backgroundColor: focusedIndex === index ? '#f0f8ff' : 'transparent',
                                }
                            ]}
                            value={digit}
                            onChangeText={(text) => handlePinChange(text, index)}
                            keyboardType="numeric"
                            maxLength={1}
                            secureTextEntry
                            placeholder="•"
                            textAlign="center"
                            onFocus={() => setFocusedIndex(index)} // Set focus index on field focus
                        />
                    ))}
                </View>
            </View>

            <View style={{ padding: 20, alignItems: 'center' }}>
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        height: height * 0.1,
        width: '100%',
        padding: 20,
        backgroundColor: colors.color1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pinInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 20,
    },
    input: {
        width: width * 0.18,
        height: height * 0.10,
        borderWidth: 1,
        borderRadius: 10,
        fontSize: 30,
        color: colors.color1,
    },
    label: {
        fontSize: 18,
        marginBottom: 20,
    },
    button: {
        width: '80%',
        padding: 15,
        backgroundColor: colors.color1,
        alignItems: 'center',
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
});
