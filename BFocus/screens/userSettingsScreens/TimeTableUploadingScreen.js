import React, { Component } from 'react';
import { Alert, Button, Linking, AsyncStorage, ImageBackground, ScrollView, TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';
import NavigationService from '../../components/NavigationService';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
import Toast from 'react-native-simple-toast';
import Icon from 'react-native-vector-icons/Entypo';
import Icon1 from 'react-native-vector-icons/SimpleLineIcons';
import { showAlert } from '../../components/alert';
import {SERVER_ADDR} from '../../constants/serverAddress';
import {approveLogout} from '../../components/logout';

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
    header: null
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
			NavigationService.navigateFromStart('Main', {});
		}
}
  
  uploadFile() {
	DocumentPicker.show({
	  filetype: [DocumentPickerUtil.allFiles()],
	},(error,res) => {
		 console.log("error object is: " + error);
		 console.log("res object is: " + res);
		 
		  
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
						
				fetch(SERVER_ADDR + 'TimeTableUpload', {
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
						console.log(`Fetch Error in uploadFile =\n`, error);
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
	
	logoutAndReturnLoginScreen() {
    approveLogout(this.state.id);
  }

  render() {
    return (
		<ImageBackground source={require('../../img/img_background_picture.png')}  imageStyle={{resizeMode: 'cover'}} style={{flex:1}}>
			<ScrollView resizeMode="center">
					<View style={styles.container}>
					
						<Text id="greetings" style={styles.greetings}> {this.state.greeting} </Text>   
						<TouchableOpacity onPress={this.logoutAndReturnLoginScreen.bind(this)} style={styles.logoutOpacity} >
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
					<Text> {'\n'} </Text>
					<Text style={styles.text}> לאחר התחברות מוצלחת: מערכת שעות-> רשימת מערכת שעות ->"בצע"> ואז ללחוץ על האייקון של האקסל כדי להוריד את הקובץ כמתואר בתמונה:{"\n"}</Text>
					
					<Image style={styles.explanationPicture}source={require('../../img/ExplanationUpload.png')} />
					<Text> {'\n\n'} </Text>
					</View>
			</ScrollView>
		</ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
		alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    
  },
  logo: {
		width: 200,
		height: 180,
		alignSelf: 'center',
		resizeMode: 'center',
		marginTop: -40,
   },
    opacity: {
			flex: 1,
			backgroundColor: 'rgba(59,89,152,0.6)',
			
			height: 40,
			width: '65%',
			borderRadius: 10,
			flexDirection: 'row',
			justifyContent: 'center',
			paddingTop: 5,

			
  },
   text: {
		width: 270,
		color: 'black'
	},
	headExplanation: {
		color: 'black',
		fontSize: 18,
	},
	explanationPicture: {

	},
  textLogin: {
	  fontSize: 18,	 
	},

	greetings: {
		alignSelf: 'flex-start',
		marginTop: 20,
		marginLeft: 15,
		color: 'black'
	},
	icon: {
		
	},
	textLogout: {
		fontSize: 14,
		marginLeft: 5,
		color: 'black'
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