import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ToastManager, { Toast } from "toastify-react-native";
const { height, width } = Dimensions.get('window');
const uri = process.env.EXPO_PUBLIC_API_URL;
export default function App() {
  const [fileName, setFileName] = useState(null);
  const [fileUri, setFileUri] = useState(null);
  const [token, setToken] = useState()
  const [file, setFile] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [data, setData] = useState([])
  const [err ,setErr] = useState(null)
  useEffect(() => {
    (async () => {
      const result = await AsyncStorage.getItem('@userToken')
      if (result)
        setToken(result)
      else
        router.push('/login')
    })();
  }, [])


  const pickCSVFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        // type: 'text/csv',
        copyToCacheDirectory: true,
      });
      console.log(result)

      if (!result.canceled) {
        const fileExtension = result.assets[0].name.split('.').pop().toLowerCase();
        if (fileExtension === 'csv') {
          setFile(result.assets)
          setFileName(result.assets[0].name);
          setFileUri(result.assets[0].uri);
        } else {
          Alert.alert('Invalid File', 'Please select a CSV file.');
        }
      } else {
        console.log('File picking canceled');
      }
    } catch (error) {
      console.error('Error picking file:', error);
    }
  };
  const createEmp = async () => {

    if (fileName && fileUri) {
      const formData = new FormData();

      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: 'text/csv',
      })
      console.log(fileUri)
      fetch(`${uri}/admin/CreateBulkEmployee`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      })
        .then(resp => resp.json())
        .then(json => {
          if (json.email)
            setData(json);
          else
            setErr(json)
          console.log(json)
          setModalVisible(true)

        })
        .catch(err => { console.log(err); Toast.error(err.message) })
    }
    else {
      console.log('select a file')
      Alert.alert('warning', 'Please select a file Before Upload');
    }
  }


  return (

    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 }}>
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
            <View style={{ width: '100%', alignItems: "flex-end", }}>
              <TouchableOpacity onPress={() => { setModalVisible(!modalVisible); }}>
                <AntDesign name="closecircle" size={30} color="black" />
              </TouchableOpacity>

            </View>
            {data.length>=1 &&
            <ScrollView >
              {data.map((item) => {
                return (
                  <View style={[styles.card, { borderColor: (item.result.status_code == 201) ? 'green' : 'red' }]}>
                    <View style={styles.cardHead}>
                      <Text style={{ fontWeight: 'bold' }}>{item.email}</Text>
                    </View>
                    <View style={styles.cardBody}>
                      <Text>{item.result.message}</Text>
                    </View>
                  </View>
                )
              })

              }
            </ScrollView> }

            {err &&
            <View style={{padding:10,borderRadius:10,borderWidth:1,borderColor:'red'}}>
                <Text style={{fontWeight:'bold',alignSelf:'center',margin:10}}>{err.message}</Text>
                <Text>{err.errors[0].error.slice(0,100)}</Text>
            </View>
            }
          </View>
        </View>

      </Modal>




      <Text>Selected File: {fileName ? fileName : 'None'}</Text>
      {/* <Text>{fileUri}</Text> */}
      <TouchableOpacity style={styles.button} onPress={pickCSVFile}>
        <Text style={styles.buttonText}>Pick a CSV file</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={createEmp}>
        <Text style={styles.buttonText}>Upload</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '80%',
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
    height: "80%",
    width: "80%",
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

  card: {
    height: height * 0.15,
    width: width * 0.6,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
  },
  cardHead: {
    height: '30%',
  },
  cardBody: {

    height: '70%',
  }

})
