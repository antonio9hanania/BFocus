import React, { Component } from 'react';
import { Alert, AsyncStorage, Platform } from 'react-native';
import NavigationService from './NavigationService';
import {SERVER_ADDR} from '../constants/serverAddress';
import FCM, { NotificationActionType } from "react-native-fcm";

export const loginToServer = (username, email, accessToken, loginPlace, callback) => {
   data = {"username" : username, "email": email, "accessToken": accessToken, "deviceToken": ''};
   url = SERVER_ADDR + "Login";
    
   setLoginPlaceTo(loginPlace);
   sendToServerData(data, url, callback);
}

export const loginToServerWithPassword = (email, password, callback) => {
   data = {"email" : email, "password" : password, "deviceToken": ''};
   url = SERVER_ADDR + "LoginWithPassword";
   
   setLoginPlaceTo('');
   sendToServerData(data, url, callback);
}

export const signUpToServer = (username, email, password, confirmPassword, callback) => {
   data = {"username" : username, "email" : email, "password" : password, "confirmPassword" : confirmPassword, "deviceToken": ''};
   url = SERVER_ADDR + "SignUp";
   setLoginPlaceTo('');
   sendToServerData(data, url, callback);
}

setLoginPlaceTo = (loginPlace) => {
    try {
        AsyncStorage.setItem('loginPlace', loginPlace);
        console.log("set login place to: " + loginPlace);
      } catch (error) {
       console.log("Couldn't save place of login:", error);
      }
}

const saveDataInApplication = async (responseJson) => {
    console.log('in saveDataInAplication');
    await AsyncStorage.multiSet([
        ["username", responseJson.username],
        ["id", responseJson.id],
        ["accessToken", responseJson.accessToken]
    ])
}

export const navigateAfterSuccessfullLogin = (responseJson) => {
    if(responseJson.message === "Ok") {
        NavigationService.navigateFromStart('Main', {});
    }
    else if(responseJson.message === "Ok-EntityMissing") {
        NavigationService.navigateFromStart('EntitySelection', {  });
    }
    else if (responseJson.message === "Ok-TimeTableMissing") {
        NavigationService.navigateFromStart('TimeTableUploading', {});
    }
}

getDeviceToken = (callback) => { 
    if (Platform.OS === "android") {
        FCM.getFCMToken().then((token) => {
            console.log("TOKEN (getFCMToken): ", token);
            callback(token);
        });
    }
    else {
        FCM.getAPNSToken().then((token) => {
            console.log("TOKEN (getFCMToken): ", token);
            callback(token);
        });
    }
}

sendToServerData = (data, url, callback)=> {
    getDeviceToken((deviceToken) => {
        data.deviceToken = deviceToken;
        console.log('device token is: ', data.deviceToken);
            
        jsonData = JSON.stringify(data);
        console.log('Sending to server the data:' + jsonData);
        var status;
        
        fetch(url, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            headers: {
                "Content-Type": "application/json",
            },
            body: jsonData, // body data type must match "Content-Type" header
        })
        .then((response) => {
            status = response.status;
            console.log('in first response of sendToServerData');
            return response.json()
        })
        .then(async (responseJson) => {
            console.log("Response from server: " + status);
            console.log(responseJson);
            if(status === 200) {
                await saveDataInApplication(responseJson);
            }
            callback(status, responseJson);
        })
        .catch(error => {
            Alert.alert("There was a problem: " + error);
            console.log(`Fetch Error =\n`, JSON.stringify(error));
        });
    });
}













