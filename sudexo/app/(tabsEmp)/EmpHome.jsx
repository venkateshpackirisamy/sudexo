import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Constants from "expo-constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
const { height, width } = Dimensions.get('window');
export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.haeder}>
        <TouchableOpacity>
          {/* <MaterialCommunityIcons name="account-circle-outline" size={40} color="black" /> */}
          <MaterialCommunityIcons name="account-circle" size={40} color="black" />
        </TouchableOpacity>

      </View>

      <View style={{ 'width': '100%', height: '90%', alignItems: 'center', padding: 20, gap: 10 }}>

        <View style={styles.card}>
          <View style={styles.cardHeaad}><Text>Money Transfer</Text></View>
          <View style={styles.cardBody}>

            <TouchableOpacity>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <MaterialCommunityIcons name="qrcode-scan" size={40} color="black" />
                <Text>Scan & Pay</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <FontAwesome6 name="indian-rupee-sign" size={40} color="black" />
                <View style={{ alignItems: 'center' }}>
                  <Text>Check Balance</Text>
                </View>
              </View>
            </TouchableOpacity>

          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeaad}><Text>Reacharge & Bill Payment</Text></View>
          <View style={styles.cardBody}>

            <TouchableOpacity>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <Entypo name="mobile" size={40} color="black" />
                <View style={{ alignItems: 'center' }}>
                  <Text>Mobile</Text>
                  <Text>Recharge</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <FontAwesome6 name="lightbulb" size={40} color="black" />
                <View style={{ alignItems: 'center' }}>
                  <Text>Electricity</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <Entypo name="mobile" size={40} color="black" />
                <View style={{ alignItems: 'center' }}>
                  <Text>Mobile</Text>
                  <Text>PostPaid</Text>
                </View>
              </View>
            </TouchableOpacity>

          </View>
        </View>


      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#b0006d",
    // paddingTop: Constants.statusBarHeight,
    alignItems: 'Center',
  },
  haeder: {
    height: '10%',
    width: '100%',
    padding: 20,
    backgroundColor: 'white',
    justifyContent: 'center'
  },
  card: {
    width: '100%',
    height: '20%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10
  },
  cardHeaad: {
    height: '20%'
  },
  cardBody: {
    height: '80%',
    alignItems: 'center',
    justifyContent: "space-evenly",
    flexDirection: 'row',
    gap: 10,
  }


})