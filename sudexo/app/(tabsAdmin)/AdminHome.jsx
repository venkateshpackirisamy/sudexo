import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Constants from "expo-constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from "expo-router";
// import PieChart from 'react-native-pie-chart'
import { BarChart, PieChart } from "react-native-gifted-charts";
import colors from "../../assets/color";
import { useIsFocused } from "@react-navigation/native";
const uri = process.env.EXPO_PUBLIC_API_URL;
const { height, width } = Dimensions.get('window');
export default function AdminHome() {
  const [userName, setUserName] = useState(null)
  const [totalEmp, setTotalEmp] = useState(0)
  const [token, setToken] = useState(null)
  const [series, setseries] = useState([])
  const [barSat, setBarSat] = useState([])
  const [loading, setLoading] = useState(true)
  const isfocuse = useIsFocused()
  useEffect(() => {
    setUser();
  }, [])

  useEffect(() => {
    if (token) {
      getSat()
      getbarSat()
    }
  }, [token])

  useEffect(() => {
    if (token && isfocuse) {
      setUser()
      getSat()
      getbarSat()
    }
  }, [isfocuse])

  const barData = [
    { value: 0, label: 'Jan', frontColor: '#4ABFF4', mon: 1, },
    { value: 0, label: 'Feb', frontColor: '#79C3DB', mon: 2, },
    { value: 0, label: 'Mar', frontColor: '#28B2B3', mon: 3, },
    { value: 0, label: 'Apr', frontColor: '#4ADDBA', mon: 4, },
    { value: 0, label: 'May', frontColor: '#91E3E3', mon: 5, },
    { value: 0, label: 'June', frontColor: '#4ADDBA', mon: 6, },
    { value: 0, label: 'July', frontColor: '#4ADDBA', mon: 7, },
    { value: 0, label: 'Aug', frontColor: '#4ADDBA', mon: 8, },
    { value: 0, label: 'Sep', frontColor: '#4ADDBA', mon: 9, },
    { value: 0, label: 'Oct', frontColor: '#4ADDBA', mon: 10, },
    { value: 0, label: 'Nov', frontColor: '#4ADDBA', mon: 11, },
    { value: 0, label: 'Dec', frontColor: '#4ADDBA', mon: 12, },
  ]
  const setUser = async () => {
    const result = await AsyncStorage.getItem('@userName')
    const token = await AsyncStorage.getItem('@userToken')
    const admin = await AsyncStorage.getItem('is_admin')
    if (result && admin === 'true') {
      setUserName(result)
      setToken(token)
    }
    else
      router.replace('/login')
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
                  { value: data.result[0].GreatT2000[0]?.GreatT2000 || 0, color: '#B6A6E9' },
                  { value: data.result[0].LessT2000[0]?.LessT2000 || 0, color: '#876FD4' },
                  { value: data.result[0].LessT1000[0]?.LessT1000 || 0, color: '#5E40BE' },
                ]
                setseries(sat)
                setTotalEmp(data.result[0].total[0]?.total || 0)
                setLoading(false)

              }
              else if(data.status_code == 401){
                AsyncStorage.clear()
                .then(
                  router.replace('/login')
                )
              }
            })
        })
        .catch(function (res) { console.log('errror') })

    } catch (error) {

    }
  }

  const getbarSat = () => {
    try {
      fetch(`${uri}/admin/monthlyspending`,
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
                const last_month = data.result[data.result.length - 1]._id
                data.result.forEach(element => {
                  barData[element._id - 1].value = element.totalAmount
                });
                let temp
                if (last_month < 6) {
                  temp = [
                    ...barData.slice(12 - (6 - last_month)),
                    ...barData.slice(0, last_month)
                  ]
                } else {
                  temp = barData.slice(last_month - 6, last_month)
                }
                setBarSat(temp)
              }
            })
        })
        .catch(function (res) { console.log('errror') })

    } catch (error) {
      console.log(error)
    }
  }
  if (!userName || loading)
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

        {totalEmp >= 1 ?
          <View style={{ height: '80%' }}>
            <ScrollView horizontal={true}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false} >
              <View style={styles.dashBoard}>
                {/* {totalEmp >= 1 ? <PieChart widthAndHeight={widthAndHeight} series={series} cover={0.6} /> : <PieChart widthAndHeight={widthAndHeight} series={[{ value: 1, color: 'black' }]} cover={0.6} />}
          <View style={styles.dashBoardFooter}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontWeight: 'bold' }}> <FontAwesome name="square" color="black" /> Total Number of Employees</Text> <Text style={{ fontWeight: 'bold' }}>{totalEmp}</Text> </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontWeight: 'bold' }}> <FontAwesome name="square" color="green" /> Emplyee with balance more than 2000</Text> <Text style={{ fontWeight: 'bold' }}>{series[0]?.value}</Text> </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontWeight: 'bold' }} > <FontAwesome name="square" color="yellow" /> Emplyee with balance more than 1000</Text> <Text style={{ fontWeight: 'bold' }}>{series[1]?.value}</Text> </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontWeight: 'bold' }}> <FontAwesome name="square" color="red" /> Emplyee with balance less than 1000</Text> <Text style={{ fontWeight: 'bold' }}>{series[2]?.value}</Text> </View>
          </View> */}
                <Text style={{fontWeight:'bold',width:'100%',fontSize:18}}>Employees Balance Data</Text>
                <PieChart
                  donut
                  showGradient
                  data={series}
                  showText
                  textColor="black"
                  radius={150}
                  textSize={20}
                  focusOnPress
                  showValuesAsLabels
                  showTextBackground
                  textBackgroundRadius={26}
                  // onPress ={(item,index)=>{Alert.alert(item.value.toString())}}
                  centerLabelComponent={() => {
                    return (
                      <View>
                        <Text style={{ color: 'black', fontSize: 36 }}>{totalEmp}</Text>
                        {/* <Text style={{ color: 'black', fontSize: 10,alignSelf:'center' }}>Total</Text> */}
                      </View>
                    );
                  }}
                  // textBackgroundColor="rgba(0, 0, 0, 0.5)" 
                  style={styles.pieChart}
                />:
                <View style={styles.dashBoardFooter}>
                  <TouchableOpacity onPress={() => { router.push({ pathname: '/employees', params: { filter: 0 } }) }}
                    style={styles.dashBoardLabel}><Text style={{ fontWeight: 'bold' }}> <FontAwesome name="square" color="black" /> Total Number of Employees</Text> <Text style={{ fontWeight: 'bold' }}>{totalEmp}</Text> </TouchableOpacity>
                  <TouchableOpacity onPress={() => { router.push({ pathname: '/employees', params: { filter: 1 } }) }}
                    style={styles.dashBoardLabel}><Text style={{ fontWeight: 'bold' }}> <FontAwesome name="square" color='#B6A6E9' /> Emplyee with balance more than 2000</Text> <Text style={{ fontWeight: 'bold' }}>{series[0]?.value}</Text> </TouchableOpacity>
                  <TouchableOpacity onPress={() => { router.push({ pathname: '/employees', params: { filter: 2 } }) }}
                    style={styles.dashBoardLabel}><Text style={{ fontWeight: 'bold' }} > <FontAwesome name="square" color='#876FD4' /> Emplyee with balance more than 1000</Text> <Text style={{ fontWeight: 'bold' }}>{series[1]?.value}</Text> </TouchableOpacity>
                  <TouchableOpacity onPress={() => { router.push({ pathname: '/employees', params: { filter: 3 } }) }}
                    style={styles.dashBoardLabel}><Text style={{ fontWeight: 'bold' }}> <FontAwesome name="square" color='#5E40BE' /> Emplyee with balance less than 1000</Text> <Text style={{ fontWeight: 'bold' }}>{series[2]?.value}</Text> </TouchableOpacity>
                </View>

              </View>


              <View style={[styles.dashBoard, { justifyContent: 'center' }]}>
              <Text style={{fontWeight:'bold',width:'100%',fontSize:18,marginBottom:10}}>Employees Spending Month wise</Text>
                <View>
                  <BarChart
                    showFractionalValue
                    showYAxisIndices
                    hideRules
                    noOfSections={4}
                    maxValue={5000}
                    data={barSat}
                    barWidth={25}
                    sideWidth={15}
                    side="right"
                  />
                </View>
                <View style={[styles.dashBoardFooter, { marginTop: 20 }]}>
                  <TouchableOpacity  onPress={() => { router.push({ pathname: '/spending', params: { month: barSat[0]?.mon}})}}   style={styles.dashBoardLabel}  >
                    <Text style={{ fontWeight: 'bold' }}>
                      <FontAwesome name="square" color={barSat[0]?.frontColor} /> {barSat[0]?.label} </Text> <Text style={{ fontWeight: 'bold' }}>{barSat[0]?.value}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity  onPress={() => { router.push({ pathname: '/spending', params: { month: barSat[1]?.mon}})}} style={styles.dashBoardLabel} >
                    <Text style={{ fontWeight: 'bold' }}>
                      <FontAwesome name="square" color={barSat[1]?.frontColor} /> {barSat[1]?.label} </Text> <Text style={{ fontWeight: 'bold' }}>{barSat[1]?.value}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => { router.push({ pathname: '/spending', params: { month: barSat[2]?.mon}})}} style={styles.dashBoardLabel} >
                    <Text style={{ fontWeight: 'bold' }}>
                      <FontAwesome name="square" color={barSat[2]?.frontColor} /> {barSat[2]?.label} </Text> <Text style={{ fontWeight: 'bold' }}>{barSat[2]?.value}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => { router.push({ pathname: '/spending', params: { month: barSat[3]?.mon}})}} style={styles.dashBoardLabel} >
                    <Text style={{ fontWeight: 'bold' }}>
                      <FontAwesome name="square" color={barSat[3]?.frontColor} /> {barSat[3]?.label} </Text> <Text style={{ fontWeight: 'bold' }}>{barSat[3]?.value}</Text>
                  </TouchableOpacity>
                   
                  <TouchableOpacity onPress={() => { router.push({ pathname: '/spending', params: { month: barSat[4]?.mon}})}} style={styles.dashBoardLabel} >
                    <Text style={{ fontWeight: 'bold' }}>
                      <FontAwesome name="square" color={barSat[4]?.frontColor} /> {barSat[4]?.label} </Text> <Text style={{ fontWeight: 'bold' }}>{barSat[4]?.value}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity   onPress={() => { router.push({ pathname: '/spending', params: { month: barSat[5]?.mon}})}} style={styles.dashBoardLabel} >
                    <Text style={{ fontWeight: 'bold' }}>
                      <FontAwesome name="square" color={barSat[5]?.frontColor} /> {barSat[5]?.label} </Text> <Text style={{ fontWeight: 'bold' }}>{barSat[5]?.value}</Text>
                  </TouchableOpacity>
                </View>

              </View>


            </ScrollView>

          </View> :

          <View style={{ height: '60%', width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: 10, }}>
            <Text style={{ fontWeight: 'bold' }}>No Emplyee Yet</Text>
          </View>
        }


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
    padding: 10,
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
    width: width * 0.9,
    // height: '40%',
    backgroundColor: 'white',
    // borderRadius: 10,
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
  pieChart: {
    borderRadius: 20, // Rounded corners for the chart
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 5, // Shadow radius
    elevation: 5, // For Android shadow
  },
  dashBoardLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 0.2,
    padding: 5,
    borderRadius: 3,
    borderColor: '#A9A9A9',
  }

})
