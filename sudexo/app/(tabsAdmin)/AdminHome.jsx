import { ActivityIndicator, Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Constants from "expo-constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from "expo-router";
import PieChart from 'react-native-pie-chart'
import colors from "../../assets/color";
const uri = process.env.EXPO_PUBLIC_API_URL;
const { height, width } = Dimensions.get('window');
export default function Index() {
  const [userName, setUserName] = useState(null)
  const [totalEmp, setTotalEmp] = useState(0)
  const [token, setToken] = useState(null)
  const [series, setseries] = useState([])
  useEffect(() => {
    setUser();
  }, [])
  useEffect(() => {
    if (token)
      getSat()
  }, [token])

  const widthAndHeight = width * 0.6
  const setUser = async () => {
    const result = await AsyncStorage.getItem('@userName')
    const token = await AsyncStorage.getItem('@userToken')
    const admin = await AsyncStorage.getItem('is_admin')
    if (result && admin === 'true') {
      setUserName(result)
      setToken(token)
    }
    else
      router.push('/login')
  }

  const getSat = () => {
    try {
      fetch(`${uri}/admin/dashBoard`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        })
        .then(function (res) {
          res.json()
            .then(data => {
              if (data.status_code == 200) {
                const sat = [
                  { value: data.result[0].GreatT2000[0]?.GreatT2000 || 0, color: 'green' },
                  { value: data.result[0].LessT2000[0]?.LessT2000 || 0, color: 'yellow' },
                  { value: data.result[0].LessT1000[0]?.LessT1000 || 0, color: 'red' },
                ]
                setseries(sat)
                setTotalEmp(data.result[0].total[0]?.total || 0)

              }
            })
        })
        .catch(function (res) { console.log('errror') })

    } catch (error) {

    }
  }

 
  // const refresh = useCallback(() => {
  //   console.log('callback')
  //   if (token)
  //     getSat()
  // })
  


  if (!userName)
    return (
      <SafeAreaView style={styles.loadingContainor}>
        <ActivityIndicator size="large" color="#00ff00" />
        <Text>Loading...</Text>
      </SafeAreaView>
    )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style='light' backgroundColor={colors.color1} />
      <View style={styles.haeder}>
        <TouchableOpacity onPress={() => { router.push('/profile') }}>
          <MaterialCommunityIcons name="account-circle" size={40} color="white" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, color: 'white' }}>{userName}</Text>
      </View>

      <View style={{ 'width': '100%', height: '90%', alignItems: 'center', padding: 20, gap: 10 }}>

        <View style={styles.dashBoard}>
          {totalEmp >= 1 ? <PieChart widthAndHeight={widthAndHeight} series={series} cover={0.6} /> : <PieChart widthAndHeight={widthAndHeight} series={[{ value: 1, color: 'black' }]} cover={0.6} />}
          <View style={styles.dashBoardFooter}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontWeight: 'bold' }}> <FontAwesome name="square" color="black" /> Total Number of Employees</Text> <Text style={{ fontWeight: 'bold' }}>{totalEmp}</Text> </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontWeight: 'bold' }}> <FontAwesome name="square" color="green" /> Emplyee with balance more than 2000</Text> <Text style={{ fontWeight: 'bold' }}>{series[0]?.value}</Text> </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontWeight: 'bold' }} > <FontAwesome name="square" color="yellow" /> Emplyee with balance more than 1000</Text> <Text style={{ fontWeight: 'bold' }}>{series[1]?.value}</Text> </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontWeight: 'bold' }}> <FontAwesome name="square" color="red" /> Emplyee with balance less than 1000</Text> <Text style={{ fontWeight: 'bold' }}>{series[2]?.value}</Text> </View>
          </View>
        </View>


        <View style={styles.card}>
          <View style={styles.cardHeaad}><Text>Add New Employes</Text></View>
          <View style={styles.cardBody}>

            <TouchableOpacity onPress={() => { router.push('/createMultiple') }}>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <AntDesign name="addusergroup" size={40} color={colors.color1} />
                <Text>craete Multiple</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { router.push('/employeeRegister') }}>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <AntDesign name="adduser" size={40} color={colors.color1} />
                <View style={{ alignItems: 'center' }}>
                  <Text>Craete Single</Text>
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
    // backgroundColor: 'white',
    alignItems: 'Center',
  },
  haeder: {
    height: '10%',
    width: '100%',
    padding: 20,
    backgroundColor: colors.color1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
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
  },
  card: {
    width: '100%',
    height: '20%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10
  },
  dashBoard: {
    width: '100%',
    // height: '40%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  dashBoardFooter: {
    width: '100%',
    gap: 5
  },
  loadingContainor: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },

})



