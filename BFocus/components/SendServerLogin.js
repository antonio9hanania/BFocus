import React, { Component } from 'react';
import { Alert, AsyncStorage } from 'react-native';
import NavigationService from './NavigationService';

export const loginToServer = (username, email, accessToken, loginPlace, callback) => {
   data = {"username" : username, "email": email, "accessToken": accessToken};
   url = "http://192.168.14.145:3000/Login";
    
   try {
    AsyncStorage.setItem('loginPlace', loginPlace);
    console.log("set login place to: " + loginPlace);
  } catch (error) {
   console.log("Couldn't save place of login");
  }
   sendToServerData(data, url, callback);
}

export const loginToServerWithPassword = (email, password, callback) => {
   data = {"email" : email, "password" : password};
   url = "http://192.168.14.145:3000/LoginWithPassword";
   
   try {
    AsyncStorage.removeItem('loginPlace', '');
    console.log("set login place to: " + loginPlace);
  } catch (error) {
   console.log("Couldn't save place of login");
  }

   sendToServerData(data, url, callback);
}

export const signUpToServer = (username, email, password, confirmPassword, callback) => {
   data = {"username" : username, "email" : email, "password" : password, "confirmPassword" : confirmPassword};
   url = "http://192.168.14.145:3000/SignUp";
  
   sendToServerData(data, url, callback);

}

const saveDataInApplication = (responseJson) => {
    AsyncStorage.multiSet([
        ["username", responseJson.username],
        ["id", responseJson.id],
        ["accessToken", responseJson.accessToken]
    ])
}

export const navigateAfterSuccessfullLogin = (responseJson) => {
    if(responseJson.message === "Ok") {
        NavigationService.navigate('Main', {});
    }
    else if(responseJson.message === "Ok-EntityMissing") {
        NavigationService.navigate('EntitySelection', {  });
    }
    else if (responseJson.message === "Ok-TimeTableMissing") {
        NavigationService.navigate('TimeTableUploading', {});
    }
}

sendToServerData = (data, url, callback)=> {
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
        return response.json()
    })
	.then((responseJson) => {
        console.log("Response from server: " + status);
        console.log(responseJson);
        if(status === 200) {
            saveDataInApplication(responseJson);
        }
        callback(status, responseJson);
	 })
	.catch(error => {
        Alert.alert("There was a problem: " + error);
        console.log(`Fetch Error =\n`, error);
    });
}













