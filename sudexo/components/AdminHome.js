import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Text, View } from "react-native";

export default function AdminHome(){
    console.log('hello')
    console.log(Platform.StatusBar)
    return(
        <View style={styles.main}>
            <StatusBar style="auto"/>
            <View style={styles.chart}></View>
            
        </View>
    
    )
}


const styles = StyleSheet.create({
    main:{
        marginTop:10,
        flex:1,
        backgroundColor:'#fff'
    },
    chart:{
        flex:1,
        backgroundColor:'blue'
    }
})