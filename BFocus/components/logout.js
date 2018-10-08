import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';
import Toast from 'react-native-simple-toast';
import { GoogleSignin, statusCodes } from 'react-native-google-signin';
import {FBLoginManager} from 'react-native-facebook-login';
import {SERVER_ADDR} from '../constants/serverAddress';
import { showAlert } from './alert';
import NavigationService from './NavigationService';

export const approveLogout = (id) => {
    console.log('logout comp in approveLogout id is: ',id);
    showAlert('Logout from user', 'Are you sure you want to logout?', () => {
        logout(id, () => {
          console.log("Before navigate to login screen...");
          NavigationService.navigateFromStart('Login', {});
        });
      });
}

const logout = (id, callback) => {
    console.log('logout comp in logout id is: ',id);
	console.log("got to logout");
	AsyncStorage.getItem('loginPlace', (err, loginPlace) => {
		if(err || loginPlace === null || loginPlace === undefined) {
			console.log("Not need to deautorize");
			clearData(id, callback);
		}
		else {
			if(loginPlace === "facebook") {
				console.log("logout from facebook..");
				
				FBLoginManager.logout(function(error, data){
				  if (error) {
					console.log(error, data);
					alert("Error on logout: "+ error );
				  }
				  else {
					console.log("logout from facebook successfully");
					clearData(id, callback);
				  }
				});

			}
			else if(loginPlace === "google") {
				console.log("logout from " + loginPlace);
				
				try {
					GoogleSignin.revokeAccess().then(() => {
						console.log("Revoked access of google.");
						GoogleSignin.signOut().then(() => {
							console.log("Sign out from google.");
							clearData(id, callback);
						}).catch(error => {console.log("error: " + error)});
					}).catch(error => {console.log("error: " + error);});
				} catch (error) {
					console.error(error);
				}	  
			}
		}	
	});

	const clearData = (id, callback) => {
        console.log("got to clear data");
        removeDeviceTokenFromUser(id);

		AsyncStorage.clear((error) => {
			if(error === null) {
				AsyncStorage.getItem("id", (error, id) => {
					if(error) {
                        console.log("Id failed to remove: " + id);
                    }
                    else if(id === null || id === undefined) {
                        console.log("Removed items successfully");
                        Toast.show('Logout from system successfully', Toast.SHORT);
						callback();
					}
					else {
						console.log("Id failed to remove: " + id);
					}
				});
			}
			else {
				console.log("error at remove items from async sotrage: " + error );
			}
		});
	}	
}

const removeDeviceTokenFromUser = (id) => {
    console.log('logout comp in removeDeviceTokenFromUser id is: ',id);
    
    console.log("got to remove device token function to server");
    url = SERVER_ADDR + "RemoveDeviceToken";
    var status;
    console.log("id:" + id ,"url is:", url);

    fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        headers: {
                "Content-Type": "application/json",
                "id": id,
        },
        body: JSON.stringify({"":""}), // body data type must match "Content-Type" header
    })
    .then((response) => {
        status = response.status;
        return response.json();
    })
    .then((responseJson) => {
        console.log("Response from server: " + status);
        console.log(responseJson);   
    })
    .catch(error => {
        console.log(`Fetch Error removeDeviceTokenFromUser =\n`, JSON.stringify(error));
    });     
}