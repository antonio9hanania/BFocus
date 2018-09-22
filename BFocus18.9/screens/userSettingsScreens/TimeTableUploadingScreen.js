import React, { Component } from 'react';
import { Alert, Button, Linking, AsyncStorage, ScrollView, TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';
import NavigationService from '../../components/NavigationService';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
import Toast from 'react-native-simple-toast';
import Icon from 'react-native-vector-icons/Entypo';
import Icon1 from 'react-native-vector-icons/SimpleLineIcons';
import { showAlert } from '../../components/alert';

export default class TimeTableUploadingScreen extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
		file: '',
		nameTimeTableFile: '',
		greeting : '',
		id: '',
		url: 'https://rishum.mta.ac.il/yedion/fireflyweb.aspx',
    };
  }
	
	static navigationOptions = ({ navigation }) => ({
    header: navigation.state.params ? navigation.state.params.header : undefined
	});

  async componentDidMount() {
		try {
			NavigationService.setCurrentlocation("TimeTable");
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
  
  onSubmit() {
    
	}
	
	responseHandler(status, responseJson){
		Toast.show(responseJson.message, Toast.LONG);


		if(status === 200) {
			NavigationService.navigate('Main', {});
		}
}
  
  uploadFile() {
	DocumentPicker.show({
	  filetype: [DocumentPickerUtil.allFiles()],
	},(error,res) => {
		 console.log("error object is: " + error);
		 console.log("res object is: " + res);
		 
		 /*for(var key in error) {
			console.log(key + ": " + error[key]);
			
		  }
		  
		   for(var key in res) {
			console.log(key + ": " + res[key]);
			
		  }*/
		  
		  if(res !== null) {	  
			  // Android
			  console.log(res.uri + ", " + res.type + ", " + res.fileName + ", " + res.fileSize);
			  const body = new FormData();
				//String Key value pair appending to body   
				body.append('Entity', '');
				//Appending file to body
				body.append('File', {
						uri: res.uri,
						type: res.type, //This is the file type .. you can define according to your requirement
						name: res.fileName,   //File name you want to pass
					})
						
				fetch('http://192.168.14.145:3000/TimeTableUpload', {
					method: 'POST',
					headers: {
						"id": this.state.id,
					},
					body: body
				})
				.then((response) => {
					status = response.status;
					return response.json();
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
		});
	}
	
	handleUrlClick = () => {
    Linking.canOpenURL(this.state.url).then(supported => {
      if (supported) {
        Linking.openURL(this.state.url);
      } else {
        console.log("Don't know how to open URI: " + this.state.url);
      }
    });
	};
	
	logout() {
		showAlert('Logout from user', 'Are you sure you want to logout?', () => {
			NavigationService.navigate('Login', {});
		});
	}

  render() {
    return (
	<ScrollView resizeMode="center">
      <View style={styles.container}>
			
				<Text id="greetings" style={styles.greetings}> {this.state.greeting} </Text>   
				<TouchableOpacity onPress={this.logout.bind(this)} style={styles.logoutOpacity} >
									<Icon1 name='logout' size={18} color='black' style={styles.iconButton}/>
									<Text style={styles.textLogout}> Logout </Text>
				</TouchableOpacity>

		  <Image style={styles.logo} source={require('../../img/BFOCUS_LOGO.png')}/>
        		
			<TouchableOpacity onPress={this.uploadFile.bind(this)} style={styles.opacity}> 
				  <Icon name='attachment' size={24} color='black' style={styles.icon}/>
					<Text style={styles.textLogin}> Upload Time Table </Text>
			</TouchableOpacity>
			<Text style={styles.text}> {this.state.nameTimeTableFile} </Text>
			
			<Text style={styles.headExplanation}> הסבר הורדת קובץ</Text>
			<Text style={styles.text}> היכנס/י למידע-נט: </Text>
			
			<TouchableOpacity onPress={this.handleUrlClick.bind(this)}>
          <Text style={styles.text}> {this.state.url}</Text>
      </TouchableOpacity>
			
			<Text style={styles.text}> לאחר התחברות מוצלחת: מערכת שעות-> רשימת מערכת שעות ->"בצע"> ואז ללחוץ על האייקון של האקסל כדי להוריד את הקובץ כמתואר בתמונה:{"\n"}</Text>
			
			<Image style={styles.explanationPicture}source={require('../../img/ExplanationUpload.png')} />


      </View>
	</ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
		alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
  },
  logo: {
		width: 200,
		height: 180,
		alignSelf: 'center',
		resizeMode: 'center',
		marginTop: -40,
   },
    opacity: {
			backgroundColor: '#778899',
			flex: 1,
			marginTop: -20,
			height: 40,
			width: 220,
			borderRadius: 10,
  },
   text: {
		width: 270,
	},
	headExplanation: {
		
		fontSize: 18,
	},
	explanationPicture: {

	},
  textLogin: {
	  fontSize: 20,
	  textAlign: 'center',
		
		marginTop: -30,
    marginLeft: 25,
	 
	},

	greetings: {
		alignSelf: 'flex-start',
		marginTop: 20,
		marginLeft: 15,
	},
	icon: {
		marginLeft: 12,
    marginTop: 10,
	},
	textLogout: {
		fontSize: 14,
		marginLeft: 5,
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