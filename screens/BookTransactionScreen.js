import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import firebase from 'firebase';
import db from '../config'

export default class BookTransactionScreen extends React.Component{
    constructor(){
        super();
        this.state = {
            hasCameraPermissions:null,
            scanned:false,
            scannedData:'',
            buttonState:'normal',
            scannedBookId:'',
            scannedStudentId:'',
            transactionMessage:''
        }
    }

    initiateBookIssue = async ()=>{
        //add a transaction
        db.collection('transactions').add({
            "studentId":this.state.scannedStudentId,
            "bookId":this.state.scannedBookId,
            "date":firebase.firestore.Timestamp.now().toDate(),
            "transactionType":"issue"
        })

        //change book status
        db.collection('books').doc(this.state.scannedBookId).update({
            'bookAvailability':false,

        })
        //change the number of issued books for the student
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
        })
        alert("book Issued")
        this.setState({
            scannedStudentId:'',
            scannedBookId:''
        })
    }

    initiateBookReturn = async ()=>{
         //add a transaction
         db.collection('transactions').add({
            "studentId":this.state.scannedStudentId,
            "bookId":this.state.scannedBookId,
            "date":firebase.firestore.Timestamp.now().toDate(),
            "transactionType":"return"
        })

        //change book status
        db.collection('books').doc(this.state.scannedBookId).update({
            'bookAvailability':true,

        })
        //change the number of issued books for the student
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
        })
        alert("book returned")
        this.setState({
            scannedStudentId:'',
            scannedBookId:''
        })
    }

    getCameraPermission = async (id)=>{
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermissions:status === "granted",
            buttonState:id,
            scanned:false
        })
    }

    handleBarCodeScanned = async ({type,data})=>{
        const {buttonState} = this.state
        if(buttonState==="BookId"){
        this.setState({
            scanned:true,
            scannedData:data,
            buttonState:'normal'
        }
        )} else if(buttonState==="studentId"){
            this.setState({
                scanned:true,
                scannedData:data,
                buttonState:'normal'
            }
            )
        }
    }

    checkStudentEligibilityForBookIssue = async ()=>{
        const studentRef = await db.collection("students").where("studentId", "==", this.state.scannedStudentId).get()
        var isStudentEligible = ""
        if(studentRef.docs.length==0){
            this.setState({
                scannedStudentId:'',
                scannedBookId:''
            })
            isStudentEligible = false;
            alert("the student id doesn't exist in the database")
        } else{
            studentRef.docs.map((doc)=>{
                var student = doc.data();
                if(student.numberOfBooksIssued<2){
                    isStudentEligible = true;
                }else{
                    isStudentEligible = false;
                    alert("the student has already issued 2 books");
                    this.setState({
                        scannedStudentId:'',
                        scannedBookId:''
                    })
                }
            });
        }
        return isStudentEligible;
    }

    checkStudentEligibilityForBookReturn = async ()=>{
        const transactionRef = await db.collection('transactions').where('bookId', '==', this.state.scannedBookId).limit(1).get()
        var isStudentEligible = ""
        transactionRef.docs.map((doc)=>{
            var lastBookTransaction = doc.data()
            if(lastBookTransaction.studentId===this.state.scannedStudentId){
                isStudentEligible = true;
            }else{
                isStudentEligible = false;
                alert("the book wan't issued by the student");
                this.setState({
                    scannedStudentId:'',
                    scannedBookId:''
                })
            }
        })
        return isStudentEligible;
    }

    checkBookEligibility = async ()=>{
        const bookRef = await db.collection("books").where("bookId", "==", this.state.scannedBookId).get();
        var transactionType = ""
        if(bookRef.docs.length==0){
            transactionType = false;
            console.log(bookRef.docs.length)
        }else{
            bookRef.docs.map((doc)=>{
                var book = doc.data();
                if(book.bookAvailability){
                    transactionType = "Issue"
                }else{
                    transactionType = "Return"
                }
            });
        }
        return transactionType;
    }

    handleTransaction = async ()=>{
        // Verify if the student is eligible for book return/issue/none
        //student id existance
        //issue:number of book issued<2
        //issue:verify book availablility
        //return:last transaction =>book issued by the student id
        var transactionType = await this.checkBookEligibility();
        if(!transactionType){
            alert("the book doesn't exist in the library database");
            this.setState({
                scannedStudentId:'',
                scannedBookId:''
            })
        }else if(transactionType==="Issue"){
            var isStudentEligible=await this.checkStudentEligibilityForBookIssue();
            if(isStudentEligible){
                this.initiateBookIssue();
                alert("book issued to the student");
            }
        } else{
            var isStudentEligible = await this.checkStudentEligibilityForBookReturn();
            if(isStudentEligible){
                this.initiateBookReturn();
                alert("book returned to the library")
            }
        }
        /*var transactionMessage = null;
        db.collection("books").doc(this.state.scannedBookId).get()
        .then((doc)=>{
            var book = doc.data();
            if(book.bookAvailability){
                this.initiateBookIssue();
                transactionMessage = "book issued"
                alert(transactionMessage)
                //ToastAndroid.show(transactionMessage, ToastAndroid.SHORT)
            }else{
                this.initiateBookReturn();
                transactionMessage = "book returned"
                alert(transactionMessage)
                //ToastAndroid.show(transactionMessage, ToastAndroid.SHORT)
            }
        }) 
        this.setState({
            transactionMessage:transactionMessage,
        })*/
    }
    render(){
        const hasCameraPermissions = this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;

        if(buttonState !== "normal" && hasCameraPermissions){
            return(
                <BarCodeScanner
                onBarCodeScanned = {scanned?undefined:this.handleBarCodeScanned}
                style = {StyleSheet.absoluteFillObject}
                />
            )
        }else if(buttonState === "normal"){

        return(
            <KeyboardAvoidingView style = {
            styles.container} behavior = "padding" enabled>
                <View>
                    <Image source = {require('../assets/booklogo.jpg')}
                    style = {{width:200, height:200}}/>
                    <Text style = {{textAlign:'center', fontSize:30}}>Willy</Text>
                </View>
              
                <View style = {styles.inputView}>
                    <TextInput
                    style = {styles.inputBox}
                    placeholder = 'book id'
                    onChangeText = {(text)=>{
                        this.setState({scannedBookId:text})
                    }}
                    value = {this.state.scannedBookId}
                    />
                <TouchableOpacity style = {styles.scanButton} 
                onPress = {()=>{this.getCameraPermission("BookId")}}>
                 <Text style = {styles.buttonText}>
                    Scan
                </Text>
                </TouchableOpacity>
                </View>
                <View>
                <TextInput
                    style = {styles.inputBox}
                    placeholder = 'student id'
                    onChangeText = {(text)=>{
                        this.setState({scannedStudentId:text})
                    }}
                    value = {this.state.scannedStudentId}
                    />
               

                <TouchableOpacity style = {styles.scanButton} 
                onPress = {()=>{this.getCameraPermission("StudentId")}}>
                 <Text style = {styles.buttonText}>
                    Scan
                </Text>
                </TouchableOpacity>
                </View>
                <TouchableOpacity style ={styles.submitButton} onPress = {async ()=>{
                    var transactionMessage = await this.handleTransaction()
                   /* this.setState({
                        scannedBookId:'',
                        scannedStudentId:''
                    })*/
                }}>
                    <Text style = {styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
                
            </KeyboardAvoidingView>
        );
                }
    }
}
const styles = StyleSheet.create({
     container: { 
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
     },

      displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
     backgroundColor: '#2196F3',
     padding: 10,
     margin: 10
    },
    buttonText:{ 
     fontSize: 15,
     textAlign: 'center',
     marginTop: 10 
    },
     inputView:{
     flexDirection: 'row',
     margin: 20 
    },
    inputBox:{
     width: 200,
     height: 40,
     borderWidth: 1.5,
     borderRightWidth: 0,
     fontSize: 20              
    },
    scanButton:{
     backgroundColor: '#66BB6A',
     width: 50,
     borderWidth: 1.5,
     borderLeftWidth: 0 
    },
    submitButton:{
     backgroundColor:'aqua',
     width:100,
     height:50,
    },
    submitButtonText:{
     padding:10,
     textAlign:'center',
     fontSize:20,
     fontWeight:'bold',
     color:'white'
    }
 });