import React, { Component } from 'react';
import { Alert, AsyncStorage, AppState, FlatList, ScrollView, TouchableOpacity, ImageBackground, View, StyleSheet, Image } from 'react-native';
import { List, Text, ListItem } from 'react-native-elements';
import ScreenBridge from '../../ScreenBridgeNativeModule';
import NavigationService from '../../components/NavigationService';
import { NavigationActions } from 'react-navigation';
import { logout } from '../loginScreens/LoginScreen';
import Toast from 'react-native-simple-toast';

import Icon from 'react-native-vector-icons/SimpleLineIcons';
import Icon1 from 'react-native-vector-icons/FontAwesome'
import {showAlert} from '../../components/alert';

export const BackgroundTaskHandler = async (data) => {
  console.log('Background task starting...');
  AsyncStorage.getItem('isLecturer', (error, isLecturer) => {
    console.log("IsLecturer value:" + isLecturer);
     if(error) {
        console.log("An error accured during fetching isLecturer variable.");
     }
     else {
      if(isLecturer === 'false') {
      updateLocation();
      console.log("Object is: " + JSON.stringify(stateContainer));
      
      var status;
      url = "http://192.168.14.145:3000/UpdateServer";
      //data = {"screenState": stateContainer.screenState, "appState": stateContainer.appState  ,"latitude": stateContainer.latitude, "longitude": stateContainer.longitude};
    
        fetch(url, {
          method: "POST", 
          headers: {
              "Content-Type": "application/json",
              "id": stateContainer.id,
          },
          body: JSON.stringify(stateContainer), // body data type must match "Content-Type" header
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
          console.log(`Fetch Error =\n`, error);
      });
     }
    }
  });
}

const updateLocation = () =>{
  navigator.geolocation.getCurrentPosition((position) => {
    stateContainer.latitude = position.coords.latitude;
    stateContainer.longitude = position.coords.longitude;
   

    }, (error) => console.log("couldn't get location."),
    { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 },
  );
}

var stateContainer = {"id": '', "screenState": '', "appState": ''  ,"latitude": '', "longitude": ''};

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
    console.log(">>>>>>>Constructor of Home");
    this.state = {
      greeting: '',
      id: '',
      username: '',
      screenState: 'On',
      appState: AppState.currentState,
      selected: '',
      isLecturer: false,

      coursesGroups: [],
      latitude: null,
      longitude: null,
      error: null,
    };
  }

  static navigationOptions = {
		header: null
  }

  updateGroupList(status, responseJson) {
    if (status === 200) {
      console.log("updating courses groups list.");
      this.setState({ coursesGroups: responseJson.groupsPosition, isLecturer: responseJson.isLecturer });


      AsyncStorage.multiSet([
        ['coursesGroups', JSON.stringify(responseJson.groupsPosition)],
        ['isLecturer', JSON.stringify(responseJson.isLecturer)],
      ]);

      //NavigationService.navigate('QueryOrSurveyUploadScreen', { isQuery: true, coursesGroups: responseJson.groupsPosition });
    }
  }
  
  updateCoursesGroups() {
    console.log("Fetching from server courses groups list.");
    var status;
    url = "http://192.168.14.145:3000/GetCoursesGroupsList";

    fetch(url, {
      headers: {
        "id": this.state.id,
      },
    })
      .then((response) => {
        status = response.status;
        return response.json()
      })
      .then((responseJson) => {
        console.log("Response from server: " + status);
        console.log(responseJson);
        this.updateGroupList(status, responseJson);

      })
      .catch(error => {
        console.log(`Fetch Error =\n`, error);
      });
  }

  screenOffEventHandler = () => {
    console.log("Screen was closed");
    this.setState({ screenState: "Off" });
    stateContainer.screenState = "Off";

    BackgroundTaskHandler();
    console.log("Object is: " + JSON.stringify(stateContainer));
  }

  screenOnEventHandler = () => {
    console.log("Screen is on");
    this.setState({ screenState: "On" });
    stateContainer.screenState = "On";

    BackgroundTaskHandler();
    console.log("Object is: " + JSON.stringify(stateContainer));

  }

  handleAppStateChange = (nextAppState) => {
    console.log("App state is: " + nextAppState);
    this.setState({ appState: nextAppState });
    stateContainer.appState = nextAppState;

    BackgroundTaskHandler();
    console.log("Object is: " + JSON.stringify(stateContainer));
  }

  async componentDidMount() {
    console.log("->>>>>>> Home Coomponent did mount");
    this._eventSubscription1 = ScreenBridge.emitter.addListener('ACTION_USER_PRESENT', ({ ACTION_USER_PRESENT }) => this.screenOnEventHandler());
    this._eventSubscription2 = ScreenBridge.emitter.addListener('ACTION_SCREEN_OFF', ({ ACTION_SCREEN_OFF }) => this.screenOffEventHandler());
    AppState.addEventListener('change', this.handleAppStateChange);
    Toast.show('Welcome to BFocus...', Toast.SHORT);

    try {
      const username = await AsyncStorage.getItem('username');
      const id = await AsyncStorage.getItem('id');

      stateContainer.id = id;
      stateContainer.appState = this.state.appState;
      stateContainer.screenState = this.state.screenState;

      console.log("Username is: " + username + ", Id is: " + id);
      this.setState({
        username: username,
        greeting: 'Hi ' + username + ',',
        id: id,
      });
    }
    catch (error) {
      console.log("An error occured: " + error);
    }

    this.updateCoursesGroups();
  }

  removeEventsListeners() {
    this._eventSubscription1 && this._eventSubscription1.remove();
    this._eventSubscription2 && this._eventSubscription2.remove();
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    this.removeEventsListeners();
    console.log('---> Home screen Component UNmounted:');
  }

  onUploadNewTimeTable() {
    showAlert("Upload new Time Table", "You will reset your data in the server, are you sure?", () => {
      console.log("Deleting time table from server.");
      var status;
      url = "http://192.168.14.145:3000/DeleteTimeTable";

      fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        headers: {
          "id": this.state.id,
        },
      })
        .then((response) => {
          status = response.status;
          return response.json()
        })
        .then((responseJson) => {
          console.log("Response from server: " + status);
          console.log(responseJson);

          if(status === 200) {
            Toast.show("Deleted current time table successfully.", Toast.LONG);
            NavigationService.navigateFromStart('TimeTableUploading', { header: null});
          }

        })
        .catch(error => {
          console.log(`Fetch Error =\n`, error);
        });
    })
  }

  onPressItem = (item) => {
    console.log("Pressed on item:" + item);
    this.props.navigation.navigate('CourseGroupChart', { item: item });
  };

  renderItemGroupList = ({ item }) => (
    <ListItem
      id={item.id}
      onPress={this.onPressItem.bind(this, item)}
      title={item.groupName}
      titleStyle= {{color:'black'}}
      subtitleStyle= {{color:'black'}}
    />
  );

  renderHeader = () => {
    return <Text style={styles.HeadList} h5> Courses Groups: </Text>
  }

  logoutAndReturnLoginScreen() {
    showAlert('Logout from user', 'Are you sure you want to logout?', () => {
      logout();
      NavigationService.navigate('Login', {});
    });
  }

  render() {
    return (
      <ImageBackground source={require('../../img/backgroundPicture.jpg')} style={{flex:1}}>
      
      <ScrollView resizeMode="center">
        
        <View style={styles.container}>
        
          <Text id="greetings" style={styles.greetings}> {this.state.greeting} </Text>
          
          <TouchableOpacity onPress={this.logoutAndReturnLoginScreen.bind(this)} style={styles.logoutOpacity} >
            <Icon name='logout' size={18} color='black'/>
            <Text style={styles.textLogout}> Logout </Text>
          </TouchableOpacity>

           <TouchableOpacity onPress={this.onUploadNewTimeTable.bind(this)} style={[styles.logoutOpacity, { height: 40, marginLeft: 10, width: 100, }]} >
            <Icon1 name='upload' size={18} color='black' style={styles.iconTime}/>
            <Text style={styles.textNewTimeTable}> Upload a new {"\n"} time table </Text>
          </TouchableOpacity>

          <Image style={styles.logo} source={require('../../img/BFOCUS_LOGO.png')} />
         

          {this.state.isLecturer === true ?
          <List containerStyle={styles.listStyle}>
            <FlatList
              data={this.state.coursesGroups}
              keyExtractor={item => item._id}
              renderItem={this.renderItemGroupList}
              ListHeaderComponent={() => this.renderHeader()}
            />
          </List> : null }

        </View>
       
      </ScrollView>
      
      </ImageBackground>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  greetings: {
    marginLeft: 15,
    color: 'black',
  },
  logo: {
    width: 200,
    height: 180,
    alignSelf: 'center',
    resizeMode: 'center',
    marginTop: -60,
  },
  logoutOpacity: {
    marginTop: 5,
    height: 30,
    width: 80,
    borderRadius: 10,
    marginLeft: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
		paddingTop: 5,
  },
  iconTime: {
    marginLeft: 5,
  },
  opacity: {
    flex: 1,
    backgroundColor: 'green',
    marginTop: 20,
    height: 40,
    width: 200,
    borderRadius: 10,
  },
  textLogout: {
    fontSize: 14,
    marginLeft: 5,
    color: 'black',
  },
  textLogin: {
    fontSize: 22,
    justifyContent: 'center',
    textAlign: 'center',
    marginTop: 4,

  },
  textNewTimeTable: {
    fontSize: 11,
    marginLeft: 3,
    color: 'black',
  },
  picker: {
    width: 150,
  },
  HeadList: {
    alignSelf: 'center',
    color: 'black',
  },
  listStyle:{
    marginTop: -40,
    alignSelf: 'center',
    justifyContent: 'center',
    width: 270,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },
  iconButton: {
    marginLeft: 31,
  },
  fixed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }
});

