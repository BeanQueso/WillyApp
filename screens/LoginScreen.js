import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, ToastAndroid } from 'react-native';
import * as firebase from 'firebase'
export default class LoginScreen extends React.Component{
    constructor(){
        super();
        this.state = {
            password:'',
            emailId:''
        }
    }

    login = async (email,password)=>{
        if(email && password){
            try{
                const response = await firebase.auth().signInWithEmailAndPassword(email,password);
                if(response){
                    this.props.navigation.navigate('Transaction')
                }
            }
            catch(error){
                switch(error.code){
                    case 'auth/user-not-found':
                        alert("user doesn't exist");
                        break;
                    case 'auth/invalid-email':
                        alert("incorrect email or password");
                        break;
                }
            }
        }else{
            alert("enter email and password")
        }
    }

    render(){
        return(
            <KeyboardAvoidingView>
                <View>
                    <Image source = {require("../assets/booklogo.jpg")}
                    style = {{
                        width:200,
                        height:200,
                    }}
                    />
                </View>
                <View>
                    <TextInput style = {styles.loginBox} placeholder = "abc@example.com"
                    keyboardType = 'email-address'
                    onChangeText = {(text)=>{
                        this.setState({
                            emailId:text
                        })
                    }}
                    />

                    <TextInput style = {styles.loginBox} secureTextEntry = {true}
                    placeholder = "Enter Password"
                    onChangeText = {(text)=>{
                        this.setState({
                            password:text
                        })
                    }}
                    />

                </View>
                <View>
                    <TouchableOpacity style = {{height:30, width:90, borderWidth:1, marginTop:20, paddingTop:5}}
                    onPress = {()=>{
                        this.login(this.state.emailId, this.state.password)
                    }}
                    >
                        <Text style = {{textAlign:'center'}}>
                            Login
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            
        )
    }
}
const styles = StyleSheet.create({
    loginBox:
    {
      width: 300,
    height: 40,
    borderWidth: 1.5,
    fontSize: 20,
    margin:10,
    paddingLeft:10
    }
  })
  