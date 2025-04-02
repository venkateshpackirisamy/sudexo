import { ActivityIndicator, Dimensions, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from "react-native-safe-area-context";
const { height, width } = Dimensions.get('window');
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import usePagination from "./usePaginationEmpTranscation";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import ToastManager, { Toast } from "toastify-react-native";
const uri = process.env.EXPO_PUBLIC_API_URL;
export default function Index() {

  const [token, setToken] = useState(null)
  const item = useLocalSearchParams()
  const [modalVisible, setModalVisible] = useState(false)
  const [empData, setEmpData] = useState({})
  const [balance, setBalance] = useState()
  const [err, setErr] = useState('')
  useEffect(() => {
    setUser()
  }, [])
  useEffect(() => {
    if (token)
      getEmp()
  }, [token])

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
              setEmpData(data)
          })
      })
      .catch((res) => { console.log('errror', res) })
  }


  const {
    data,
    totalResult,
    refreshing,
    loadingMore,
    handleRefresh,
    loadMore,
    initialLoader,
  } = usePagination(item.emp_id);

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

  return (

    <View style={styles.container}>
      <StatusBar style="light" />
      <ToastManager/>
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


      <View style={styles.haeder}>
        <View>
          <MaterialCommunityIcons name="account-circle" size={80} color="black" />
          <Text style={{fontSize:20, fontWeight:'bold',textAlign:'center'}}>{empData.data?.name}</Text>
          
        </View>
        <View style={{ flexDirection:'row',justifyContent:"space-evenly",alignItems:'center',gap:5}}>
        <Text style={{ fontSize: 20,fontWeight:"bold" }}>₹{empData.data?.balance}</Text>
          <TouchableOpacity style={styles.button} onPress={() => { setModalVisible(!modalVisible) }}>
            <Text style={styles.buttonText}>Add Amount</Text>
          </TouchableOpacity>
        </View>
      </View>


      <View style={{ 'width': '100%', height: '70%', alignItems: 'center', gap: 10, }}>

        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={{ 'fontWeight': "bold", 'fontSize': 25 }}>{item.type === 'DR' ? "TO:" : 'From:'}</Text>
                <Text style={{ 'fontWeight': "bold", 'fontSize': 20 }}>{item.type === 'DR' ? item.to_id : item.from_id}</Text>
              </View>
              <View style={styles.CardRight}>
                <Text style={{ 'fontWeight': "bold", 'fontSize': 30, color: item.type === 'DR' ? "red" : 'green' }}> ₹{item.amount} </Text>
                <Text>{covert_date(item.date_time)}</Text>
              </View>

            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={<View style={{height:height*0.8, width:width*0.9,justifyContent:'center',alignItems:'center'}}> <Text style={{fontWeight:'bold',fontSize:25}}> No Transaction Yet</Text></View>}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
        />


      </View>

    </View>
  );

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'

  },
  haeder: {
    height: '30%',
    width: '100%',
    padding: 20,
    alignItems: 'center',
    textAlign:'center',
    gap: 10,
  },
  card: {
    width: width * 0.9,
    height: height * 0.15,
    backgroundColor: 'white',
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
  },

  cardLeft: {
    justifyContent: 'center',

  },
  CardRight: {
    justifyContent: 'center'
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    borderRadius: 5,
    width:width*0.5
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

})