import { ActivityIndicator, Dimensions, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from "react-native-safe-area-context";
const { height, width } = Dimensions.get('window');
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import usePagination from "./usePaginationEmpTranscation";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import ToastManager, { Toast } from "toastify-react-native";
import colors from "../assets/color";
import { Route } from "expo-router/build/Route";
const uri = process.env.EXPO_PUBLIC_API_URL;
export default function Index() {

  const [token, setToken] = useState(null)
  const item = useLocalSearchParams()
  const [modalVisible, setModalVisible] = useState(false)
  const [empData, setEmpData] = useState({})
  const [balance, setBalance] = useState()
  const [modalVisibleFilter, setModalVisibleFilter] = useState(false)
  const [modalVisibleSatus, setModalVisibleSatus] = useState(false)
  const [lastSixMon, setLastSixMon] = useState([])
  const [filterVar, setfilterVar] = useState(0)
  const [err, setErr] = useState('')
  const [month, setMonth] = useState(0)
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState(null)
  const monthData = [
    { label: 'Jan', mon: 1, },
    { label: 'Feb', mon: 2, },
    { label: 'Mar', mon: 3, },
    { label: 'Apr', mon: 4, },
    { label: 'May', mon: 5, },
    { label: 'June', mon: 6, },
    { label: 'July', mon: 7, },
    { label: 'Aug', mon: 8, },
    { label: 'Sep', mon: 9, },
    { label: 'Oct', mon: 10, },
    { label: 'Nov', mon: 11, },
    { label: 'Dec', mon: 12, },
  ]
  useEffect(() => {
    setUser()
    getMonths()
  }, [])
  useEffect(() => {
    if (token)
      getEmp()
  }, [token])

  useEffect(() => {
    if (month != null)
      handleRefresh();
  }, [month, type]);

  const setUser = async () => {
    const result = await AsyncStorage.getItem('@userToken')
    if (result) {
      setToken(result)
    }
    else
      router.push('/login')
  }

  const getEmp = () => {
    fetch(`${uri}/admin/employee?employee_id=${item.emp_id}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then(function (res) {
        res.json()
          .then(data => {
            if (data.status === 'error') {
            }
            else if (data.status_code == 200)
              setLoading(false)
            setEmpData(data)
          })
      })
      .catch((res) => { console.log('errror', res) })
  }

  const getMonths = () => {
    const d = new Date();
    const current_month = d.getMonth() + 1
    let temp
    if (current_month < 6) {
      temp = [
        ...monthData.slice(12 - (6 - current_month)),
        ...monthData.slice(0, current_month)
      ]
    } else {
      temp = monthData.slice(current_month - 6, current_month)
    }
    setLastSixMon(temp)
  }




  const {
    data,
    totalResult,
    refreshing,
    loadingMore,
    handleRefresh,
    loadMore,
    initialLoader,
  } = usePagination(item.emp_id, month, type);

  const renderFooter = () => {
    if (!loadingMore || data.length < 4) return null; // Show footer loader only for subsequent pages
    return <ActivityIndicator animating size="large" />;
  };

  const covert_date = (dateString) => {
    const date = new Date(dateString);
    const dateOnly = date.toLocaleDateString();  // In local format, e.g., "3/26/2025"
    return dateOnly
  }

  const deposit = () => {
    if (balance) {
      setErr('')
      fetch(`${uri}/admin/addAmount`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          method: "POST",
          body: JSON.stringify({ employee_id: item.emp_id, amount: balance })
        })
        .then(function (res) {
          res.json()
            .then(data => {
              if (data.status === 'error') {
                setEmailError(element.error)
              }
              else if (data.status_code == 200) {
                setBalance('');
                setModalVisible(false)
                getEmp()
                handleRefresh()
                Toast.success('Amount Deposited')
              }
            })
        })
        .catch((res) => { console.log('errror', res) })
    }
    else {
      setErr('Enter the Amount')
    }
  }


  const changeStatus = () => {
    if (item.emp_id) {
      const mode = empData.data?.active ? '/deactivateEmployee' : '/activateEmployee/'
      fetch(`${uri}/admin${mode}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          method: "POST",
          body: JSON.stringify({ employee_id: item.emp_id, email: empData.data.email })
        })
        .then(function (res) {
          res.json()
            .then(data => {
              if (data.status === 'error') {
                setModalVisibleSatus(false)
                Toast.error(data.error)
              }
              else if (data.status_code == 200) {
                setModalVisibleSatus(false)
                getEmp()
                const mode = empData.data?.active ? 'Employee Account Deactivate' : 'Employee Account Activate'
                Toast.success(mode)
              }
            })
        })
        .catch((res) => { console.log('errror', res) })
    }
    else {
      setErr('Enter the Amount')
    }
  }

  if (loading)
    return (
      <SafeAreaView style={styles.loadingContainor}>
        <ActivityIndicator size="large" color="#00ff00" />
        <Text>Loading...</Text>
      </SafeAreaView>
    )


  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ToastManager />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Deposit Amount to {empData.data?.name}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter a Amount"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={balance}
              onChangeText={(text) => setBalance(text)}
            />
            <Text style={{ color: 'red' }}>{err}</Text>
            <TouchableOpacity style={styles.button1} onPress={deposit}>
              <Text style={styles.buttonText}>Deposit</Text>
            </TouchableOpacity>



            <Pressable
              style={[styles.button1, styles.buttonClose]}
              onPress={() => { setBalance(null); setModalVisible(!modalVisible) }}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisibleSatus}
        onRequestClose={() => {
          setModalVisibleSatus(!modalVisibleSatus);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Are you sure want to {empData.data?.active ? 'Deactivate' : 'Activate'} {empData.data?.name}</Text>

            <View style={{ flexDirection: 'row', gap: 20 }}>
              <TouchableOpacity onPress={changeStatus} style={[styles.button1, { width: '40%', borderRadius: 10 }]}>
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
              <Pressable
                style={[styles.button1, styles.buttonClose, { width: '40%', borderRadius: 10 }]}
                onPress={() => { setModalVisibleSatus(!modalVisibleSatus) }}>
                <Text style={styles.buttonText}>No</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>



      <View style={styles.haeder}>
        <View style={{ alignItems: "center" }}>
          <MaterialCommunityIcons name="account-circle" size={80} color="black" />
          <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>{empData.data?.name.toUpperCase()}</Text>
          <View style={{ flexDirection: 'row', gap: 3, justifyContent: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 17 }}>Status</Text>
            <Text style={{ fontSize: 17, color: empData.data?.active ? 'green' : 'red' }}>{empData.data?.active ? 'Active' : 'Inactive'}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 3, justifyContent: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Balance</Text>
            <Text style={{ fontSize: 20, fontWeight: "semibold" }}>₹{empData.data?.balance}</Text>
          </View>

          <TouchableOpacity onPress={() => { router.push({ pathname: '/reset', params: { emp_id: item.emp_id } }) }}
            style={[styles.button, { marginBlock: 10 }]}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', width: '100%', gap: 10, justifyContent: 'center' }}>
            {empData.data?.active ?
              <TouchableOpacity onPress={() => setModalVisibleSatus(true)} style={[styles.button, { backgroundColor: 'red' }]} >
                <Text style={styles.buttonText}>Deactivate</Text>
              </TouchableOpacity> :
              <TouchableOpacity onPress={() => setModalVisibleSatus(true)} style={[styles.button]}>
                <Text style={styles.buttonText}>Activate</Text>
              </TouchableOpacity>
            }

            {empData.data?.active ?
              <TouchableOpacity style={styles.button} onPress={() => { setModalVisible(!modalVisible) }}>
                <Text style={styles.buttonText}>Add Amount</Text>
              </TouchableOpacity> :
              <View style={[styles.button, { backgroundColor: '#B0BEC5' }]}>
                <Text style={[styles.buttonText, { color: 'black' }]}>Add Amount</Text>
              </View>
            }
          </View>
        </View>
        {/* <View style={{ flexDirection: 'row', justifyContent: "space-evenly", alignItems: 'center', gap: 5 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>₹{empData.data?.balance}</Text>
          {empData.data?.active ?
            <TouchableOpacity style={styles.button} onPress={() => { setModalVisible(!modalVisible) }}>
              <Text style={styles.buttonText}>Add Amount</Text>
            </TouchableOpacity> :
            <View style={[styles.button, { backgroundColor: 'red' }]}>
              <Text style={styles.buttonText}>! Inactive</Text>
            </View>
          }
        </View> */}
      </View>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => setType(type == 'CR' ? null : 'CR')} style={[styles.filter, type == 'CR' && { borderWidth: 1, borderColor: 'black' }]}>
          <Text style={{ fontSize: 15, fontWeight: "500" }}>Credit</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setType(type == 'DR' ? null : 'DR')} style={[styles.filter, type == 'DR' && { borderWidth: 1, borderColor: 'black' }]}>
          <Text style={{ fontSize: 15, fontWeight: "500" }}>Dedit</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setModalVisibleFilter(true)} style={styles.filter}>
          <Text style={{ fontSize: 15, fontWeight: "500" }}>Filters </Text>
          <Ionicons name="filter" size={15} color="black" />
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisibleFilter}
        onRequestClose={() => {
          setfilterVar(month)
          setModalVisible(!modalVisibleFilter);
        }}>
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { height: "55%", width: "80%", }]}>
            <View style={styles.modelHaeder}>
              <Pressable onPress={() => { setModalVisibleFilter(false), setfilterVar(month) }}><AntDesign name="close" size={24} color="black" /></Pressable>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Filters</Text>
              <Pressable onPress={() => setfilterVar(0)}><Text style={[filterVar != 0 && { fontWeight: 'bold' }]}>clear </Text></Pressable>
            </View>
            <View style={{ gap: 10, width: '100%', alignItems: 'center' }}>
              {lastSixMon.map((item) => {
                return (
                  <TouchableOpacity onPress={() => setfilterVar(item.mon)} style={[styles.filter1, filterVar == item.mon && { borderWidth: 1, borderColor: 'black' }]}>
                    <Text>{item.label}</Text>
                  </TouchableOpacity>)
              })}


            </View>
            <TouchableOpacity onPress={() => { setMonth(filterVar); setModalVisibleFilter(false) }} style={{ width: '100%', padding: 10, alignItems: 'center', backgroundColor: colors.color1 }} >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      <View style={{ 'width': '100%', height: '56%', alignItems: 'center', gap: 10, paddingVertical: 10, backgroundColor: 'white' }}>

        {!refreshing ?
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>

                <View style={{ height: '100%', width: '20%', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
                  <View style={{ backgroundColor: colors.color1, height: '60%', width: '80%', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
                    <Text style={{ fontSize: 25, padding: 5, color: 'white' }}>{item.type === 'DR' ? <Feather name="arrow-up-right" size={24} color="white" /> : <Feather name="arrow-down-left" size={24} color="White" />}</Text>
                  </View>
                </View>

                <View style={{ justifyContent: 'center', width: '80%' }}>
                  <Text style={{ 'fontSize': 17 }}>{item.type === 'DR' ? "Send to" : 'Received from'}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ 'fontWeight': "bold", 'fontSize': 20 }}>{item.type === 'DR' ? item.to_id : item.from_id}</Text>
                    <Text style={{ 'fontWeight': "bold", 'fontSize': 20, alignSelf: 'flex-end', color: item.type === 'DR' ? "red" : 'green' }}> ₹{item.amount} </Text>
                  </View>
                  <Text style={{ alignSelf: 'flex-end' }}>{covert_date(item.date_time)}</Text>
                </View>

              </View>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            ListEmptyComponent={<View style={{ borderWidth: 1, borderRadius: 10, borderColor: '#A9A9A9', height: height * 0.49, width: width * 0.9, justifyContent: 'center', alignItems: 'center' }}> <Text style={{ fontWeight: 'bold', fontSize: 25 }}> No Transaction Yet</Text></View>}
            ListFooterComponent={renderFooter}
            onEndReached={loadMore}
            onEndReachedThreshold={0.1}
          />
          :
          <View style={styles.loadingContainor}>
            <ActivityIndicator size="large" color="#00ff00" />
            <Text>Loading...</Text>
          </View>
        }
      </View>
    </View>
  );

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white'

  },
  haeder: {
    height: '40%',
    width: '100%',
    padding: 20,
    alignItems: 'center',
    textAlign: 'center',
    gap: 10,
    backgroundColor: 'white',

  },
  card: {
    width: width * 0.95,
    height: height * 0.13,
    backgroundColor: 'white',
    flexDirection: "row",
    borderRadius: 15,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 16,
    borderWidth: 0.5,
    borderColor: '#A9A9A9',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  cardLeft: {
    width: '50%',
    justifyContent: 'center',
    alignItems: 'flex-start'

  },
  CardRight: {
    justifyContent: 'center'
  },
  button: {
    padding: 10,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    borderRadius: 5,
    width: width * 0.40
  },
  button1:
  {
    width: width * 0.6,
    padding: 15,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    // height:"80%",
    // width:"80%",
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    gap: 10
  },

  buttonClose: {
    backgroundColor: 'red',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    width: width * 0.5,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  filter: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    marginHorizontal: 15,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#A9A9A9',
  },
  modelHaeder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  filter1: {
    padding: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    width: '80%',
    borderColor: '#A9A9A9',
  },
  loadingContainor: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
})