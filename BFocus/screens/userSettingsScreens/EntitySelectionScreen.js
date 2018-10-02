import React, { Component } from 'react';
import { Button, AsyncStorage, ScrollView, ImageBackground, TouchableOpacity, Text, Picker, TextInput, View, StyleSheet, Image } from 'react-native';
import NavigationService from '../../components/NavigationService';
import Toast from 'react-native-simple-toast';
import Icon from 'react-native-vector-icons/Entypo';
import Icon1 from 'react-native-vector-icons/SimpleLineIcons';
import { showAlert } from '../../components/alert';
import {SERVER_ADDR} from '../../constants/serverAddress';
import { logout } from '../loginScreens/LoginScreen';

export default class EntitySelectionScreen extends Component {
   constructor(props) {
		super(props);
		this.state = {
				entity : 'Student',
				college: 'MTA - Academic Tel Aviv college',
				greeting : '',
				id: '',
				username: '',
			};
  }
   
  static navigationOptions = ({ navigation }) => ({
    header: navigation.state.params ? navigation.state.params.header : undefined
	});

  async componentDidMount() {
		try {
			NavigationService.setCurrentlocation("Entity");
			const username = await AsyncStorage.getItem('username');
			const id = await AsyncStorage.getItem('id');
	
			console.log("Username is: " + username + ", Id is: " + id);
			this.setState({
				username: username,
				greeting: 'Hi ' + username + ',',
				id: id,
			});
		}
		catch(error) {
			console.log("An error occured: " + error);
		}
	
  }
	
	responseHandler(status, responseJson){
		Toast.show(responseJson.message, Toast.LONG);

		if(status === 200) {
			NavigationService.navigate('TimeTableUploading', {});
		}
}

  onSubmit() {
		var status;
		url = SERVER_ADDR + "EntitySelection";
		data = {"entity" : this.state.entity, "college": this.state.college};

		fetch(url, {
			method: "POST", // *GET, POST, PUT, DELETE, etc.
			headers: {
					"Content-Type": "application/json",
					"id": this.state.id,
			},
			body: JSON.stringify(data), // body data type must match "Content-Type" header
	})
	.then((response) => {
		status = response.status;
		return response.json()
	})
	.then((responseJson) => {
		console.log("Response from server: " + status);
		console.log(responseJson);
		this.responseHandler(status, responseJson);
	 })
		.catch(error => {
			console.log(`Fetch Error =\n`, error);
		});
  }

	logoutAndReturnLoginScreen() {
    showAlert('Logout from user', 'Are you sure you want to logout?', () => {
      logout(() => {
        console.log("Before navigate to login screen...");
        NavigationService.navigate('Login', {});
      });
    });
  }

  render() {
    return (
		<ImageBackground source={require('../../img/backgroundPicture.jpg')} style={{flex:1}}>
			<ScrollView resizeMode="center">
					<View style={styles.container}>

					<Text id="greetings" style={styles.greetings}> {this.state.greeting} </Text>   
					<TouchableOpacity onPress={this.logoutAndReturnLoginScreen.bind(this)} style={styles.logoutOpacity} >
						<Icon1 name='logout' size={18} color='black' style={styles.iconButton}/>
						<Text style={styles.textLogout}> Logout </Text>
					</TouchableOpacity>

						<Image style={styles.logo} source={require('../../img/BFOCUS_LOGO.png')}/>

					<Picker style={styles.picker}
						selectedValue={this.state.college}
						onValueChange={(itemValue, itemIndex) => this.setState({college: itemValue})}>
						<Picker.Item label="MTA - Academic Tel Aviv college" value="MTA" />
					</Picker>
						
					<Picker style={styles.picker}
						selectedValue={this.state.entity}
						onValueChange={(itemValue, itemIndex) => this.setState({entity: itemValue})}>
						<Picker.Item label="Student" value="Student" />
						<Picker.Item label="Lecturer" value="Lecturer" />
					</Picker>
						
					<TouchableOpacity onPress={this.onSubmit.bind(this)} style={styles.opacity} >
						<Icon name='check' size={25} color='black' style={styles.iconButton}/>
						<Text style={styles.textLogin}> Submit </Text>
					</TouchableOpacity>
				
				
					</View>
			</ScrollView>
		</ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  logo: {
		width: 200,
		height: 180,
		alignSelf: 'center',
		resizeMode: 'center',
		marginTop: -30,
   },
    opacity: {
	    flex: 1,
		backgroundColor: '#778899',
		
		marginTop: 10,
		height: 40,
		width: 200,
		borderRadius: 10,
		flexDirection: 'row',
		justifyContent: 'center',
		paddingTop: 5,
  },
   greetings: {
		alignSelf: 'flex-start',
		marginTop: 20,
		marginLeft: 23,
		color: 'black'
  },
  textLogin: {
	fontSize: 18,
	 
  },
  picker: {
	  width: 150,
  },
  textLogout: {
	fontSize: 14,
	marginLeft: 5,
	color: 'black',
},
 logoutOpacity: {
	alignSelf: 'flex-start',
	marginTop: 5,
	height: 30,
	width: 80,
	borderRadius: 10,
	marginLeft: 15,
	flex: 1,
	flexDirection: 'row',
	justifyContent: 'center',
	paddingTop: 5,
},
});