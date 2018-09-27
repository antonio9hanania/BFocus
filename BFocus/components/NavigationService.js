import { NavigationActions, StackActions  } from 'react-navigation';
import { AsyncStorage } from 'react-native';

let _navigator;

function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

function navigate(routeName, params) {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    })
  );
}

function navigateFromStart(routeName, params) {
  _navigator.dispatch(
    StackActions.reset({
      index: 0,
      actions: [ NavigationActions.navigate({ routeName: routeName,  params: params}) ]
    })
  );
}

const lOCATION_NAME_STRING = "locationName";

function setCurrentlocation(locationName) {
  try {
    AsyncStorage.setItem(lOCATION_NAME_STRING, locationName);
  }
  catch(error) {
    console.log("Error at set item current location:" + error);
  }
}

function getCurrentLocation(callback) {
  try {
    AsyncStorage.getItem(lOCATION_NAME_STRING, (error, locationName) => {
        callback(locationName);
      });
  }
  catch(error) {
    console.log("Error at get item current location:" + error);
  }
}

function navigateToCurrentLocation() {
  AsyncStorage.getItem(lOCATION_NAME_STRING, (error, locationName) => {
    if(error) {
      console.log("Coudln't fetch location place.");
    }
    else {
      console.log("Navigation to: " + locationName);
      if(locationName === "Main") {
        navigateFromStart('Main', { header: null});
      }
      else if(locationName === "Entity") {
        navigateFromStart('EntitySelection', { header: null});
      }
      else if (locationName === "TimeTable") {
        navigateFromStart('TimeTableUploading', { header: null});
      }
      else {
        navigateFromStart('Login', { header: null});
      }
    }
  });
}

// add other navigation functions that you need and export them

export default {
  navigate,
  setTopLevelNavigator,
  navigateFromStart,
  setCurrentlocation,
  navigateToCurrentLocation,
  getCurrentLocation
};