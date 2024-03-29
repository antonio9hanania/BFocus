/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { AppRegistry, AsyncStorage } from 'react-native';

import LoginScreen from './screens/loginScreens/LoginScreen';
import EmailLoginScreen from './screens/loginScreens/EmailLoginScreen';
import EmailSignupScreen from './screens/loginScreens/EmailSignupScreen';
import TimeTableUploadingScreen from './screens/userSettingsScreens/TimeTableUploadingScreen';
import EntitySelectionScreen from './screens/userSettingsScreens/EntitySelectionScreen';
import MainScreen from './screens/mainScreens/MainScreen';

import InitialNavigate from './components/InitialNavigate';
import { createStackNavigator} from 'react-navigation';
import PushNotification from 'react-native-push-notification';
import NavigationService from './components/NavigationService';
import { BackgroundTaskHandler, FireBaseCustomNotification } from './screens/mainScreens/HomeScreen';

const notificationActionHandler = async (data) => {
  console.log( '--->NOTIFICATION got to handler:');
  console.log( '--->NOTIFICATION of finished app:');

  AsyncStorage.getItem('isLecturer', (error, isLecturer) => {
    if(error) {
      console.log("An error accured during fetching isLecturer variable: " + error);
   }
   else if(isLecturer === "true") {
    console.log("The user is lecturer doesn't need t present notification.");
   }
   else {
      console.log(">>>>>>>>>Student..");
      NavigationService.getCurrentLocation((location)=> {
        console.log("current location is: " + location);
        if(location === "Main") {
          PushNotification.localNotificationSchedule({
            message: "App closed, We can't track you and to credit you with points. Enter to activate the app.", // (required)
            date: new Date(Date.now() + (0 * 1000)), // in 60 secs
          });
          console.log( '--->NOTIFICATION of finished app executed:');
        }
      });
   }
  });
}

AppRegistry.registerHeadlessTask('NotificationHeadlessTaskName', () => { return notificationActionHandler });

/*const BackgroundTaskHandler = async (data) => {
  console.log( 'Hello from background task');
  
}*/

AppRegistry.registerHeadlessTask('BackgroundTask', () => { return BackgroundTaskHandler });

AppRegistry.registerHeadlessTask('FireBaseCustomNotification', () => { return FireBaseCustomNotification });

type Props = {};
export default class App extends Component<Props> {

  render() {
    return (
	<AppStackNavigator ref={navigatorRef => {
          NavigationService.setTopLevelNavigator(navigatorRef);
        }}/>
    );
  }
}

const AppStackNavigator = createStackNavigator( {
  InitialNavigateOption: InitialNavigate,
  Login: LoginScreen,
	EmailLogin: EmailLoginScreen,
	EmailSignup: EmailSignupScreen,
	TimeTableUploading: TimeTableUploadingScreen,
  EntitySelection: EntitySelectionScreen,
  Main: MainScreen,
})

